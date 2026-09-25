require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const sharesRouter = require('./routes/shares');
const { initCleanupCron } = require('./cron/cleanup');
const { initDB } = require('./db');

const app = express();
const PORT = parseInt(process.env.PORT || '8080', 10);

// Ters vekil sunucusu (Nginx) arkasında gerçek IP tespiti
app.set('trust proxy', 1);

// Gizlilik odaklı istek loglama (Yalnızca metod, yol ve IP loglanır; liste içeriği ve gövde ASLA loglanmaz)
app.use((req, res, next) => {
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.log(`[HTTP] ${req.method} ${req.path} - IP: ${clientIp}`);
    next();
});

// Ara Katmanlar (Middlewares)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'If-None-Match']
}));

// Girdi Sınırları: express.json({ limit: '100kb' })
app.use(express.json({ limit: '100kb' }));

// İstek Sınırı (Rate Limit): IP başına dakikada en fazla 60 istek
const shareRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 dakika
    max: 60, // Dakika başına 60 istek
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Çok fazla istek gönderildi. Lütfen bir dakika sonra tekrar deneyin.' }
});

// Sistem Sağlık Kontrolü (Healthcheck)
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'listify-api', timestamp: new Date().toISOString() });
});

// API Rotaları (Rate Limiter ile korumalı)
app.use('/api/v1', shareRateLimiter, sharesRouter);

// 404 Yakalayıcı
app.use((req, res) => {
    res.status(404).json({ error: 'Uç nokta bulunamadı.' });
});

// Sunucuyu Başlat
app.listen(PORT, '0.0.0.0', async () => {
    console.log(`[Listify API] Servis port ${PORT} üzerinde aktif.`);
    await initDB();
    initCleanupCron(process.env.CLEANUP_CRON_SCHEDULE);
});

