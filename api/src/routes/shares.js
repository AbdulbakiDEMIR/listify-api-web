const express = require('express');
const crypto = require('crypto');
const pool = require('../db');
const { mergeItemsLWW } = require('../services/mergeService');

const router = express.Router();
const TTL_HOURS = parseInt(process.env.TTL_HOURS || '48', 10);
const MAX_FUTURE_OFFSET_MS = 5 * 60 * 1000; // 5 dakika sınırı
const HEX_32_REGEX = /^[a-f0-9]{32}$/i;

/**
 * 32 Karakter Hex Token Doğrulama Yardımcısı
 */
function isValidHex32Token(token) {
    return typeof token === 'string' && HEX_32_REGEX.test(token);
}

/**
 * Madde ve alan uzunluğu doğrulama yardımcısı
 */
function validateListInput(title, items) {
    if (title !== undefined) {
        if (typeof title !== 'string' || title.length === 0) {
            return 'Liste başlığı boş olamaz.';
        }
        if (title.length > 100) {
            return 'Liste başlığı en fazla 100 karakter olabilir.';
        }
    }

    if (items !== undefined) {
        if (!Array.isArray(items)) {
            return 'Maddeler liste (array) biçiminde olmalıdır.';
        }
        if (items.length > 500) {
            return 'Bir kerede en fazla 500 madde gönderilebilir.';
        }
        for (const item of items) {
            if (item) {
                if (item.name && typeof item.name === 'string' && item.name.length > 200) {
                    return 'Madde adı en fazla 200 karakter olabilir.';
                }
                if (item.category && typeof item.category === 'string' && item.category.length > 50) {
                    return 'Kategori adı en fazla 50 karakter olabilir.';
                }
            }
        }
    }

    return null;
}

/**
 * POST /api/v1/shares
 * Yeni bir paylaşım oluşturur veya mevcut aktif linki döner (Idempotency)
 */
router.post('/shares', async (req, res) => {
    try {
        const { 
            local_list_id, 
            owner_client_id, 
            title, 
            title_updated_at, 
            type = 'shopping', 
            items = [] 
        } = req.body;

        if (!local_list_id || !owner_client_id || !title) {
            return res.status(400).json({ error: 'local_list_id, owner_client_id ve title zorunludur.' });
        }

        const validationError = validateListInput(title, items);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }

        // Idempotency kontrolü: Bu yerel liste için süresi dolmamış aktif paylaşım var mı?
        const [existing] = await pool.query(
            `SELECT sync_token, clone_token, expires_at, title, title_updated_at 
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
                expires_at: existing[0].expires_at,
                title: existing[0].title,
                title_updated_at: existing[0].title_updated_at ? Number(existing[0].title_updated_at) : null
            });
        }

        // Zaman damgası manipülasyonu engeli (şimdi + 5 dk tavanı)
        const maxAllowedTime = Date.now() + MAX_FUTURE_OFFSET_MS;
        const safeTitleUpdatedAt = Math.min(Number(title_updated_at) || Date.now(), maxAllowedTime);

        // Maddeleri beyaz liste ve sıra (order) korumasıyla temizle
        const sanitizedItems = items.map((item, index) => ({
            id: item.id || crypto.randomUUID(),
            name: String(item.name || '').slice(0, 200),
            category: String(item.category || 'Genel').slice(0, 50),
            is_completed: Boolean(item.is_completed),
            updated_at: Math.min(Number(item.updated_at) || Date.now(), maxAllowedTime),
            is_deleted: Boolean(item.is_deleted),
            order: item.order !== undefined && item.order !== null ? Number(item.order) : index
        }));

        // Yeni paylaşım oluştur
        const id = crypto.randomUUID();
        const sync_token = crypto.randomBytes(16).toString('hex');
        const clone_token = crypto.randomBytes(16).toString('hex');
        const itemsJson = JSON.stringify(sanitizedItems);

        await pool.query(
            `INSERT INTO shared_lists 
             (id, local_list_id, owner_client_id, title, title_updated_at, type, sync_token, clone_token, items, version, expires_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, DATE_ADD(NOW(), INTERVAL ? HOUR))`,
            [id, local_list_id, owner_client_id, title, safeTitleUpdatedAt, type, sync_token, clone_token, itemsJson, TTL_HOURS]
        );

        const [created] = await pool.query(
            `SELECT expires_at FROM shared_lists WHERE id = ?`,
            [id]
        );

        return res.status(201).json({
            id,
            sync_token,
            clone_token,
            expires_at: created[0].expires_at,
            title,
            title_updated_at: safeTitleUpdatedAt
        });
    } catch (error) {
        console.error('[POST /shares] Hata:', error.message);
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

        // 32 karakter hex format kontrolü (DB sorgusuna gitmeden 404 döner)
        if (!isValidHex32Token(clone_token)) {
            return res.status(404).json({ error: 'Geçersiz klonlama bağlantısı.' });
        }

        const [rows] = await pool.query(
            `SELECT title, type, items, expires_at 
             FROM shared_lists 
             WHERE clone_token = ? 
             LIMIT 1`,
            [clone_token]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Paylaşım bağlantısı bulunamadı.' });
        }

        // Süre kontrolü sorgu anında
        if (new Date(rows[0].expires_at).getTime() <= Date.now()) {
            return res.status(410).json({ error: 'Paylaşım bağlantısının süresi doldu.' });
        }

        const rawItems = typeof rows[0].items === 'string' ? JSON.parse(rows[0].items) : rows[0].items;

        // Klonlanan maddelerin tamamlanma durumlarını sıfırla, silinmişleri hariç tut, madde sırasını (order) koru
        const clonedItems = (rawItems || [])
            .filter(item => !item.is_deleted)
            .map((item, index) => ({
                id: crypto.randomUUID(), // Yeni bağımsız madde ID'si
                name: item.name,
                category: item.category,
                is_completed: false,
                updated_at: Date.now(),
                is_deleted: false,
                order: item.order !== undefined && item.order !== null ? Number(item.order) : index
            }));

        return res.status(200).json({
            title: rows[0].title,
            type: rows[0].type,
            expires_at: rows[0].expires_at,
            items: clonedItems
        });
    } catch (error) {
        console.error('[GET /shares/clone] Hata:', error.message);
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

        // 32 karakter hex format kontrolü (DB sorgusuna gitmeden 404 döner)
        if (!isValidHex32Token(sync_token)) {
            return res.status(404).json({ error: 'Geçersiz senkronizasyon bağlantısı.' });
        }

        const clientVersion = parseInt(req.headers['if-none-match'] || req.query.version || '0', 10);

        const [rows] = await pool.query(
            `SELECT id, title, title_updated_at, type, sync_token, clone_token, items, version, expires_at, updated_at 
             FROM shared_lists 
             WHERE sync_token = ? 
             LIMIT 1`,
            [sync_token]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Canlı senkronizasyon oturumu bulunamadı.' });
        }

        const list = rows[0];

        // Süre kontrolü sorgu anında
        if (new Date(list.expires_at).getTime() <= Date.now()) {
            return res.status(410).json({ error: 'Canlı senkronizasyon oturumunun süresi doldu.' });
        }

        // Değişiklik yoksa 304 dönebiliriz
        if (clientVersion > 0 && clientVersion === list.version) {
            return res.status(304).end();
        }

        const items = typeof list.items === 'string' ? JSON.parse(list.items) : list.items;

        res.setHeader('ETag', list.version.toString());
        return res.status(200).json({
            id: list.id,
            title: list.title,
            title_updated_at: list.title_updated_at ? Number(list.title_updated_at) : null,
            type: list.type,
            version: list.version,
            clone_token: list.clone_token, // Sync linkiyle katılan kişi için klonlama jetonu
            expires_at: list.expires_at,
            updated_at: list.updated_at,
            items: items || []
        });
    } catch (error) {
        console.error('[GET /shares/sync] Hata:', error.message);
        return res.status(500).json({ error: 'Senkronizasyon verisi alınamadı.' });
    }
});

/**
 * PATCH /api/v1/shares/sync/:sync_token
 * Değişen maddeleri (mutasyonları) ve liste adı güncellemelerini iletir. Item-Level LWW ile birleştirir.
 */
router.patch('/shares/sync/:sync_token', async (req, res) => {
    const { sync_token } = req.params;

    // 32 karakter hex format kontrolü (DB sorgusuna gitmeden 404 döner)
    if (!isValidHex32Token(sync_token)) {
        return res.status(404).json({ error: 'Geçersiz senkronizasyon bağlantısı.' });
    }

    const { items: incomingItems = [], title: incomingTitle, title_updated_at: incomingTitleUpdatedAt } = req.body;

    const validationError = validateListInput(incomingTitle, incomingItems);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Satırı kilitle (FOR UPDATE)
        const [rows] = await connection.query(
            `SELECT id, title, title_updated_at, items, version, expires_at 
             FROM shared_lists 
             WHERE sync_token = ? 
             FOR UPDATE`,
            [sync_token]
        );

        if (rows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Canlı senkronizasyon oturumu bulunamadı.' });
        }

        const currentList = rows[0];

        // Süre kontrolü sorgu anında
        if (new Date(currentList.expires_at).getTime() <= Date.now()) {
            await connection.rollback();
            return res.status(410).json({ error: 'Canlı senkronizasyon oturumunun süresi doldu.' });
        }

        const maxAllowedTime = Date.now() + MAX_FUTURE_OFFSET_MS;

        // 1. Liste Adı Senkronizasyonu (Last-Write-Wins)
        let finalTitle = currentList.title;
        let finalTitleUpdatedAt = currentList.title_updated_at ? Number(currentList.title_updated_at) : null;

        if (incomingTitle !== undefined && typeof incomingTitle === 'string') {
            const safeTitleUpdatedAt = Math.min(Number(incomingTitleUpdatedAt) || Date.now(), maxAllowedTime);
            const currentTitleTime = Number(currentList.title_updated_at) || 0;

            if (safeTitleUpdatedAt >= currentTitleTime) {
                finalTitle = incomingTitle.slice(0, 100);
                finalTitleUpdatedAt = safeTitleUpdatedAt;
            }
        }

        // 2. Madde Düzeyinde LWW Birleştirmesi (order ve timestamp clamping korumalı)
        const currentItems = typeof currentList.items === 'string' ? JSON.parse(currentList.items) : (currentList.items || []);
        const mergedItems = mergeItemsLWW(currentItems, incomingItems);
        const newVersion = currentList.version + 1;

        await connection.query(
            `UPDATE shared_lists 
             SET title = ?, title_updated_at = ?, items = ?, version = ?, updated_at = NOW() 
             WHERE id = ?`,
            [finalTitle, finalTitleUpdatedAt, JSON.stringify(mergedItems), newVersion, currentList.id]
        );

        await connection.commit();

        res.setHeader('ETag', newVersion.toString());
        return res.status(200).json({
            version: newVersion,
            title: finalTitle,
            title_updated_at: finalTitleUpdatedAt,
            expires_at: currentList.expires_at, // Sayaç senkronizasyonu için
            items: mergedItems
        });
    } catch (error) {
        await connection.rollback();
        console.error('[PATCH /shares/sync] Hata:', error.message);
        return res.status(500).json({ error: 'Değişiklikler senkronize edilemedi.' });
    } finally {
        connection.release();
    }
});

module.exports = router;
