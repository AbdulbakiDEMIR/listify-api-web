require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sharesRouter = require('./routes/shares');
const { initCleanupCron } = require('./cron/cleanup');

const app = express();
const PORT = parseInt(process.env.PORT || '8080', 10);

// Ara Katmanlar (Middlewares)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'If-None-Match']
}));

app.use(express.json({ limit: '5mb' }));

// Sistem Sağlık Kontrolü (Healthcheck)
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'listify-api', timestamp: new Date().toISOString() });
});

// API Rotaları
app.use('/api/v1', sharesRouter);

// 404 Yakalayıcı
app.use((req, res) => {
    res.status(404).json({ error: 'Uç nokta bulunamadı.' });
});

// Sunucuyu Başlat
app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Listify API] Servis port ${PORT} üzerinde aktif.`);
    initCleanupCron(process.env.CLEANUP_CRON_SCHEDULE);
});
