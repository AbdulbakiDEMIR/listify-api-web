const express = require('express');
const crypto = require('crypto');
const pool = require('../db');
const { mergeItemsLWW } = require('../services/mergeService');

const router = express.Router();
const TTL_HOURS = parseInt(process.env.TTL_HOURS || '48', 10);

/**
 * POST /api/v1/shares
 * Yeni bir paylaşım oluşturur veya mevcut aktif linki döner (Idempotency)
 */
router.post('/shares', async (req, res) => {
    try {
        const { local_list_id, owner_client_id, title, type = 'shopping', items = [] } = req.body;

        if (!local_list_id || !owner_client_id || !title) {
            return res.status(400).json({ error: 'local_list_id, owner_client_id ve title zorunludur.' });
        }

        // Idempotency kontrolü: Bu yerel liste için süresi dolmamış aktif paylaşım var mı?
        const [existing] = await pool.query(
            `SELECT sync_token, clone_token, expires_at 
             FROM shared_lists 
             WHERE local_list_id = ? AND owner_client_id = ? AND expires_at > NOW() 
             LIMIT 1`,
            [local_list_id, owner_client_id]
        );

        if (existing.length > 0) {
            return res.status(200).json({
                message: 'Aktif paylaşım bağlantısı mevcut.',
                sync_token: existing[0].sync_token,
                clone_token: existing[0].clone_token,
                expires_at: existing[0].expires_at
            });
        }

        // Yeni paylaşım oluştur
        const id = crypto.randomUUID();
        const sync_token = crypto.randomBytes(16).toString('hex');
        const clone_token = crypto.randomBytes(16).toString('hex');
        const itemsJson = JSON.stringify(items);

        await pool.query(
            `INSERT INTO shared_lists 
             (id, local_list_id, owner_client_id, title, type, sync_token, clone_token, items, version, expires_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, DATE_ADD(NOW(), INTERVAL ? HOUR))`,
            [id, local_list_id, owner_client_id, title, type, sync_token, clone_token, itemsJson, TTL_HOURS]
        );

        const [created] = await pool.query(
            `SELECT expires_at FROM shared_lists WHERE id = ?`,
            [id]
        );

        return res.status(201).json({
            id,
            sync_token,
            clone_token,
            expires_at: created[0].expires_at
        });
    } catch (error) {
        console.error('Paylaşım oluşturma hatası:', error);
        return res.status(500).json({ error: 'Paylaşım oluşturulurken sunucu hatası meydana geldi.' });
    }
});

/**
 * GET /api/v1/shares/clone/:clone_token
 * Listeyi klonlamak için çeker. Tüm maddelerin is_completed durumu false yapılır.
 */
router.get('/shares/clone/:clone_token', async (req, res) => {
    try {
        const { clone_token } = req.params;

        const [rows] = await pool.query(
            `SELECT title, type, items, expires_at 
             FROM shared_lists 
             WHERE clone_token = ? AND expires_at > NOW() 
             LIMIT 1`,
            [clone_token]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Paylaşım linki bulunamadı veya süresi doldu.' });
        }

        const rawItems = typeof rows[0].items === 'string' ? JSON.parse(rows[0].items) : rows[0].items;

        // Klonlanan maddelerin tamamlanma durumlarını sıfırla, silinmişleri hariç tut
        const clonedItems = rawItems
            .filter(item => !item.is_deleted)
            .map(item => ({
                ...item,
                id: crypto.randomUUID(), // Yeni bağımsız madde ID'si
                is_completed: false,
                updated_at: Date.now()
            }));

        return res.status(200).json({
            title: rows[0].title,
            type: rows[0].type,
            items: clonedItems
        });
    } catch (error) {
        console.error('Klonlama hatası:', error);
        return res.status(500).json({ error: 'Liste klonlanırken hata oluştu.' });
    }
});

/**
 * GET /api/v1/shares/sync/:sync_token
 * Canlı senkronizasyon durumunu çeker. Versiyon kontrolü yapar.
 */
router.get('/shares/sync/:sync_token', async (req, res) => {
    try {
        const { sync_token } = req.params;
        const clientVersion = parseInt(req.headers['if-none-match'] || req.query.version || '0', 10);

        const [rows] = await pool.query(
            `SELECT id, title, type, items, version, expires_at, updated_at 
             FROM shared_lists 
             WHERE sync_token = ? AND expires_at > NOW() 
             LIMIT 1`,
            [sync_token]
        );

        if (rows.length === 0) {
            return res.status(410).json({ error: 'Canlı senkronizasyon oturumu bulunamadı veya süresi doldu.' });
        }

        const list = rows[0];

        // Değişiklik yoksa 304 dönebiliriz
        if (clientVersion > 0 && clientVersion === list.version) {
            return res.status(304).end();
        }

        const items = typeof list.items === 'string' ? JSON.parse(list.items) : list.items;

        res.setHeader('ETag', list.version.toString());
        return res.status(200).json({
            id: list.id,
            title: list.title,
            type: list.type,
            version: list.version,
            expires_at: list.expires_at,
            updated_at: list.updated_at,
            items
        });
    } catch (error) {
        console.error('Senkronizasyon çekme hatası:', error);
        return res.status(500).json({ error: 'Senkronizasyon verisi alınamadı.' });
    }
});

/**
 * PATCH /api/v1/shares/sync/:sync_token
 * Değişen maddeleri (mutasyonları) iletir. Item-Level LWW ile birleştirir.
 */
router.patch('/shares/sync/:sync_token', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { sync_token } = req.params;
        const { items: incomingItems = [] } = req.body;

        await connection.beginTransaction();

        // Satırı kilitle (FOR UPDATE)
        const [rows] = await connection.query(
            `SELECT id, items, version, expires_at 
             FROM shared_lists 
             WHERE sync_token = ? AND expires_at > NOW() 
             FOR UPDATE`,
            [sync_token]
        );

        if (rows.length === 0) {
            await connection.rollback();
            return res.status(410).json({ error: 'Canlı senkronizasyon oturumu bulunamadı veya süresi doldu.' });
        }

        const currentList = rows[0];
        const currentItems = typeof currentList.items === 'string' ? JSON.parse(currentList.items) : currentList.items;

        // Item-Level LWW birleştirmesini çalıştır
        const mergedItems = mergeItemsLWW(currentItems, incomingItems);
        const newVersion = currentList.version + 1;

        await connection.query(
            `UPDATE shared_lists 
             SET items = ?, version = ?, updated_at = NOW() 
             WHERE id = ?`,
            [JSON.stringify(mergedItems), newVersion, currentList.id]
        );

        await connection.commit();

        res.setHeader('ETag', newVersion.toString());
        return res.status(200).json({
            version: newVersion,
            items: mergedItems
        });
    } catch (error) {
        await connection.rollback();
        console.error('Mutasyon uygulama hatası:', error);
        return res.status(500).json({ error: 'Değişiklikler senkronize edilemedi.' });
    } finally {
        connection.release();
    }
});

module.exports = router;
