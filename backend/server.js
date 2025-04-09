const express = require('express');
const cors = require('cors');
const { sequelize } = require('./db');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const menuRoutes = require('./routes/menu');
const paymentRoutes = require('./routes/payments');

const app = express();

app.use(cors());
app.use(express.json());

// Route'ları ekle
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/payments', paymentRoutes);

// Veritabanı bağlantısını kontrol et
sequelize.authenticate()
    .then(() => {
        console.log('SQLite bağlantısı başarılı!');
        return sequelize.sync();
    })
    .then(() => {
        console.log('Veritabanı senkronize edildi!');
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Veritabanı bağlantı hatası:', err);
    }); 