const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sequelize = require('../models/index');
const User = require('../models/User');
const Order = require('../models/Order');
const Menu = require('../models/Menu');

const app = express();
app.use(cors());

// Body-parser limitini artır
app.use(bodyParser.json({ limit: '10mb' })); // JSON verileri için 10MB sınırı
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true })); // URL-encoded veriler için 10MB sınırı

const SECRET_KEY = 'your_secret_key'; // Daha güvenli bir ortam değişkeni kullanın

// Middleware: JWT doğrulama
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

// Middleware: Admin yetkilendirme
const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Bu işlem için yetkiniz yok.' });
    }
    next();
};

// Veritabanını senkronize et
sequelize.sync({ force: false }) // `force: true` tüm tabloları sıfırlar
    .then(() => console.log('Veritabanı senkronize edildi!'))
    .catch(err => console.error('Veritabanı senkronizasyon hatası:', err));

// API Rotaları
app.get('/users', async (req, res) => {
    const users = await User.findAll();
    res.json(users);
});

// Kullanıcı giriş
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ message: 'Email veya şifre hatalı.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Email veya şifre hatalı.' });
        }

        // JWT token oluştur
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: '1h' });

        res.json({ user, token });
    } catch (error) {
        console.error('Giriş sırasında hata oluştu:', error);
        res.status(500).json({ message: 'Bir hata oluştu.' });
    }
});

// Kullanıcı oluşturma (şifre hash'leme)
app.post('/users', async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword, role });
        res.json(user);
    } catch (error) {
        console.error('Kullanıcı oluşturulurken hata oluştu:', error);
        res.status(500).json({ message: 'Bir hata oluştu.' });
    }
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

app.get('/orders', authMiddleware, async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { createdBy: req.user.email } // Sadece giriş yapan kullanıcının siparişlerini getir
        });
        res.json(orders);
    } catch (error) {
        console.error('Siparişler alınırken hata oluştu:', error);
        res.status(500).json({ message: 'Bir hata oluştu.' });
    }
});

// Sipariş oluşturma (herkes erişebilir)
app.post('/orders', authMiddleware, async (req, res) => {
    const order = await Order.create(req.body);
    res.json(order);
});

app.put('/orders/:id', authMiddleware, async (req, res) => {
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

// Menü öğesi ekleme (sadece admin)
app.post('/menu', authMiddleware, adminMiddleware, async (req, res) => {
    const menuItem = await Menu.create(req.body);
    res.json(menuItem);
});

// Ürün güncelleme
app.put('/menu/:id', authMiddleware, adminMiddleware, async (req, res) => {
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

// Menü öğesi silme (sadece admin)
app.delete('/menu/:id', authMiddleware, adminMiddleware, async (req, res) => {
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

// Kullanıcı silme (sadece admin)
app.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
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