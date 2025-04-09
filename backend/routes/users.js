const express = require('express');
const router = express.Router();
const { User } = require('../models');
const auth = require('../middleware/auth');

// Tüm kullanıcıları getir (sadece admin)
router.get('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
        }
        const users = await User.findAll({
            attributes: ['id', 'name', 'email', 'role', 'createdAt']
        });
        res.json(users);
    } catch (error) {
        console.error('Kullanıcılar getirilirken hata:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Yeni kullanıcı oluştur (sadece admin)
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
        }
        const { name, email, password, role } = req.body;
        const user = await User.create({ name, email, password, role });
        res.status(201).json(user);
    } catch (error) {
        console.error('Kullanıcı oluşturulurken hata:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Kullanıcı güncelle (sadece admin)
router.put('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
        }
        const { id } = req.params;
        const { name, email, role } = req.body;
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }
        await user.update({ name, email, role });
        res.json(user);
    } catch (error) {
        console.error('Kullanıcı güncellenirken hata:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Kullanıcı sil (sadece admin)
router.delete('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
        }
        const { id } = req.params;
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }
        await user.destroy();
        res.json({ message: 'Kullanıcı başarıyla silindi' });
    } catch (error) {
        console.error('Kullanıcı silinirken hata:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

module.exports = router; 