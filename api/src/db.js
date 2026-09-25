const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_USER || 'listify_user',
    password: process.env.MYSQL_PASSWORD || 'listify_user_secure_pass',
    database: process.env.MYSQL_DATABASE || 'listify',
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
});

/**
 * Veritabanı şema güncelliğini kontrol eder ve gerekirse eksik sütunları ekler.
 */
async function initDB() {
    try {
        const [columns] = await pool.query(
            `SHOW COLUMNS FROM shared_lists LIKE 'title_updated_at'`
        );
        if (columns.length === 0) {
            await pool.query(
                `ALTER TABLE shared_lists ADD COLUMN title_updated_at BIGINT NULL DEFAULT NULL AFTER title`
            );
            console.log('[Listify DB] title_updated_at kolonu başarıyla eklendi.');
        }
    } catch (err) {
        // Tablo henüz init.sql ile oluşturulmamışsa veya ilk başlangıçtaysa hata normal olabilir
        console.warn('[Listify DB] Şema kontrolü uyarısı:', err.message);
    }
}

module.exports = pool;
module.exports.initDB = initDB;

