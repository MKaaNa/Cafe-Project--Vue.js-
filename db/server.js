const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sequelize = require('../backend/models/index'); // Doğru yol
const User = require('../backend/models/User'); // Doğru yol
const Order = require('../backend/models/Order'); // Doğru yol
const Menu = require('../backend/models/Menu'); // Doğru yol
const jwt = require('jsonwebtoken'); // JWT kütüphanesi
const SECRET_KEY = 'your_secret_key'; // Gizli anahtar

const app = express();
app.use(cors());
app.use(bodyParser.json());

const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ message: 'Token eksik. Lütfen giriş yapın.' });
    }

    try {
        const decoded = jwt.verify(token.split(' ')[1], SECRET_KEY); // Bearer token doğrulama
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token doğrulama hatası:', error.message);
        return res.status(401).json({ message: 'Geçersiz veya süresi dolmuş token. Lütfen tekrar giriş yapın.' });
    }
};

// Veritabanını senkronize et
sequelize.sync({ force: false }) // `force: true` tüm tabloları sıfırlar
    .then(() => console.log('Veritabanı senkronize edildi!'))
    .catch(err => console.error('Veritabanı senkronizasyon hatası:', err));

// API Rotaları
app.get('/users', authMiddleware, async (req, res) => {
    const users = await User.findAll();
    res.json(users);
});

app.post('/users', authMiddleware, async (req, res) => {
    const user = await User.create(req.body);
    res.json(user);
});

app.get('/orders', authMiddleware, async (req, res) => {
    const orders = await Order.findAll();
    res.json(orders);
});

app.post('/orders', authMiddleware, async (req, res) => {
    const order = await Order.create(req.body);
    res.json(order);
});

app.get('/menu', authMiddleware, async (req, res) => {
    const menu = await Menu.findAll();
    res.json(menu);
});

app.post('/menu', authMiddleware, async (req, res) => {
    const menuItem = await Menu.create(req.body);
    res.json(menuItem);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});