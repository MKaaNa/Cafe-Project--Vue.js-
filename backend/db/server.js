const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sequelize = require('../models/index');
const User = require('../models/User');
const Order = require('../models/Order');
const Menu = require('../models/Menu');

const app = express();
app.use(cors());

// Body-parser limitini artır
app.use(bodyParser.json({ limit: '10mb' })); // JSON verileri için 10MB sınırı
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true })); // URL-encoded veriler için 10MB sınırı

// Veritabanını senkronize et
sequelize.sync({ force: false }) // `force: true` tüm tabloları sıfırlar
    .then(() => console.log('Veritabanı senkronize edildi!'))
    .catch(err => console.error('Veritabanı senkronizasyon hatası:', err));

// API Rotaları
app.get('/users', async (req, res) => {
    const users = await User.findAll();
    res.json(users);
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    console.log('Gelen veriler:', req.body); // Gelen veriyi kontrol edin

    try {
        const user = await User.findOne({ where: { email, password } });

        if (!user) {
            return res.status(401).json({ message: 'Email veya şifre hatalı.' });
        }

        res.json(user);
    } catch (error) {
        console.error('Giriş sırasında hata oluştu:', error);
        res.status(500).json({ message: 'Bir hata oluştu.' });
    }
});

app.post('/users', async (req, res) => {
    const user = await User.create(req.body);
    res.json(user);
});

app.post('/check-email', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (user) {
            return res.status(200).json({ exists: true });
        }

        res.status(200).json({ exists: false });
    } catch (error) {
        console.error('E-posta kontrolü sırasında hata oluştu:', error);
        res.status(500).json({ message: 'Bir hata oluştu.' });
    }
});

app.get('/orders', async (req, res) => {
    const orders = await Order.findAll();
    res.json(orders);
});

app.post('/orders', async (req, res) => {
    const order = await Order.create(req.body);
    res.json(order);
});

app.put('/orders/:id', async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Sipariş bulunamadı.' });
        }
        await order.update(req.body);
        res.json(order);
    } catch (error) {
        console.error('Sipariş güncellenirken hata oluştu:', error);
        res.status(500).json({ message: 'Bir hata oluştu.' });
    }
});

app.get('/menu', async (req, res) => {
    const menu = await Menu.findAll();
    res.json(menu);
});

app.post('/menu', async (req, res) => {
    const menuItem = await Menu.create(req.body);
    res.json(menuItem);
});

// Ürün güncelleme
app.put('/menu/:id', async (req, res) => {
    try {
        const menuItem = await Menu.findByPk(req.params.id);
        if (!menuItem) {
            return res.status(404).json({ message: 'Ürün bulunamadı.' });
        }
        await menuItem.update(req.body);
        res.json(menuItem);
    } catch (error) {
        console.error('Ürün güncellenirken hata oluştu:', error);
        res.status(500).json({ message: 'Bir hata oluştu.' });
    }
});

// Ürün silme
app.delete('/menu/:id', async (req, res) => {
    try {
        const menuItem = await Menu.findByPk(req.params.id);
        if (!menuItem) {
            return res.status(404).json({ message: 'Ürün bulunamadı.' });
        }
        await menuItem.destroy();
        res.json({ message: 'Ürün başarıyla silindi.' });
    } catch (error) {
        console.error('Ürün silinirken hata oluştu:', error);
        res.status(500).json({ message: 'Bir hata oluştu.' });
    }
});

// Kullanıcı silme
app.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        }
        await user.destroy();
        res.json({ message: 'Kullanıcı başarıyla silindi.' });
    } catch (error) {
        console.error('Kullanıcı silinirken hata oluştu:', error);
        res.status(500).json({ message: 'Bir hata oluştu.' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});