const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sequelize = require('../models/index');
const User = require('../models/User');
const Order = require('../models/Order');
const Menu = require('../models/Menu');
const { Sequelize, DataTypes } = require('sequelize');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(cors());

// Body-parser limitini artır
app.use(bodyParser.json({ limit: '10mb' })); // JSON verileri için 10MB sınırı
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true })); // URL-encoded veriler için 10MB sınırı

const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';

// Email gönderimi için transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Middleware: JWT doğrulama
const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ 
            message: 'Yetkilendirme token\'ı bulunamadı. Lütfen giriş yapın.' 
        });
    }

    try {
        const decoded = jwt.verify(token.split(' ')[1], SECRET_KEY);
        
        // Token süresini kontrol et
        if (decoded.exp < Date.now() / 1000) {
            return res.status(401).json({ 
                message: 'Oturum süreniz dolmuştur. Lütfen tekrar giriş yapın.' 
            });
        }
        
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token doğrulama hatası:', error.message);
        return res.status(401).json({ 
            message: 'Geçersiz veya süresi dolmuş token. Lütfen tekrar giriş yapın.' 
        });
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
sequelize.sync({ force: false })
    .then(() => console.log('Veritabanı senkronize edildi!'))
    .catch(err => {
        console.error('Veritabanı senkronizasyon hatası:', err);
        process.exit(1); // Kritik hata durumunda uygulamayı sonlandır
    });

// API Rotaları
app.get('/users', async (req, res) => {
    const users = await User.findAll();
    res.json(users);
});

// Kullanıcı giriş
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ 
            message: 'Email ve şifre alanları zorunludur.' 
        });
    }

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ 
                message: 'Email veya şifre hatalı.' 
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                message: 'Email veya şifre hatalı.' 
            });
        }

        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                role: user.role 
            }, 
            SECRET_KEY, 
            { expiresIn: '1h' }
        );

        res.json({ 
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }, 
            token 
        });
    } catch (error) {
        console.error('Giriş sırasında hata oluştu:', error);
        res.status(500).json({ 
            message: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.' 
        });
    }
});

// Kullanıcı kaydı
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ 
            message: 'Tüm alanlar zorunludur.' 
        });
    }

    try {
        // Email kontrolü
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ 
                message: 'Bu email adresi zaten kullanımda.' 
            });
        }

        // Şifreyi hashle
        const hashedPassword = await bcrypt.hash(password, 10);

        // Kullanıcıyı oluştur
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'user'
        });

        // Hassas bilgileri çıkar
        const userResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        res.status(201).json(userResponse);
    } catch (error) {
        console.error('Kullanıcı kaydı sırasında hata:', error);
        res.status(500).json({ 
            message: 'Kayıt işlemi sırasında bir hata oluştu.' 
        });
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
        let orders;
        if (req.user.role === 'admin') {
            // Admin tüm siparişleri görebilir
            orders = await Order.findAll();
        } else {
            // Normal kullanıcı sadece kendi siparişlerini görebilir
            orders = await Order.findAll({
                where: { createdBy: req.user.email }
            });
        }
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

// Sipariş durumu güncelleme
app.put('/orders/:id/status', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await Order.findByPk(id);
        if (!order) {
            return res.status(404).json({ message: 'Sipariş bulunamadı.' });
        }

        await order.update({ status });
        res.json(order);
    } catch (error) {
        console.error('Sipariş durumu güncellenirken hata:', error);
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

// Şifre sıfırlama token'ları için model
const PasswordResetToken = sequelize.define('PasswordResetToken', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
});

// Şifre sıfırlama isteği endpoint'i
app.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        // Kullanıcıyı bul
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'Bu email ile kayıtlı kullanıcı bulunamadı.' });
        }

        // Eski token'ları temizle
        await PasswordResetToken.destroy({ where: { email } });

        // Yeni token oluştur
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000); // 1 saat geçerli

        // Token'ı kaydet
        await PasswordResetToken.create({
            email,
            token,
            expiresAt
        });

        // Şifre sıfırlama bağlantısını oluştur
        const resetLink = `http://localhost:8080/forgot-password?token=${token}`;

        // Email içeriğini oluştur
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Şifre Sıfırlama İsteği',
            html: `
                <h2>Şifre Sıfırlama İsteği</h2>
                <p>Merhaba ${user.name},</p>
                <p>Hesabınız için bir şifre sıfırlama isteği aldık. Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
                <p><a href="${resetLink}">${resetLink}</a></p>
                <p>Bu bağlantı 1 saat süreyle geçerlidir.</p>
                <p>Eğer bu isteği siz yapmadıysanız, bu emaili görmezden gelebilirsiniz.</p>
                <p>Saygılarımızla,<br>Restoran Yönetim Sistemi</p>
            `
        };

        // Email gönder
        await transporter.sendMail(mailOptions);

        res.json({ 
            message: 'Şifre sıfırlama bağlantısı email adresinize gönderildi.',
            success: true
        });
    } catch (error) {
        console.error('Şifre sıfırlama hatası:', error);
        res.status(500).json({ 
            message: 'Email gönderilirken bir hata oluştu.',
            success: false
        });
    }
});

// Şifre sıfırlama endpoint'i
app.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // Token'ı bul
        const resetToken = await PasswordResetToken.findOne({ 
            where: { 
                token,
                expiresAt: { [Sequelize.Op.gt]: new Date() } // Süresi dolmamış token
            }
        });

        if (!resetToken) {
            return res.status(400).json({ message: 'Geçersiz veya süresi dolmuş token.' });
        }

        // Kullanıcıyı bul
        const user = await User.findOne({ where: { email: resetToken.email } });
        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        }

        // Şifreyi güncelle
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await user.update({ password: hashedPassword });

        // Token'ı sil
        await resetToken.destroy();

        res.json({ message: 'Şifreniz başarıyla güncellendi.' });
    } catch (error) {
        console.error('Şifre güncelleme hatası:', error);
        res.status(500).json({ message: 'Bir hata oluştu.' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});