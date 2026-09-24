const cron = require('node-cron');
const pool = require('../db');

/**
 * TTL Süresi Dolan Listeleri Temizleme Görevi
 * Varsayılan: Her saat başı çalışır ('0 * * * *')
 */
function initCleanupCron(schedule = '0 * * * *') {
    cron.schedule(schedule, async () => {
        try {
            console.log(`[TTL Cron] [${new Date().toISOString()}] Süresi dolan listeler temizleniyor...`);
            const [result] = await pool.query(
                `DELETE FROM shared_lists WHERE expires_at < NOW()`
            );
            if (result.affectedRows > 0) {
                console.log(`[TTL Cron] Başarıyla ${result.affectedRows} adet süresi dolmuş liste temizlendi.`);
            }
        } catch (error) {
            console.error('[TTL Cron] Temizlik işlemi sırasında hata oluştu:', error);
        }
    });

    console.log(`[TTL Cron] Temizlik zamanlayıcısı başlatıldı (Takvim: ${schedule}).`);
}

module.exports = {
    initCleanupCron
};
