const express = require('express');
const router = express.Router();
const { Menu } = require('../models');
const auth = require('../middleware/auth');

// Tüm menü öğelerini getir
router.get('/', async (req, res) => {
    try {
        const menuItems = await Menu.findAll();
        res.json(menuItems);
    } catch (error) {
        console.error('Menü öğeleri getirilirken hata:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Yeni menü öğesi oluştur (sadece admin)
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
        }
        const { name, price, image, description } = req.body;
        const menuItem = await Menu.create({ name, price, image, description });
        res.status(201).json(menuItem);
    } catch (error) {
        console.error('Menü öğesi oluşturulurken hata:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Menü öğesi güncelle (sadece admin)
router.put('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
        }
        const { id } = req.params;
        const { name, price, image, description } = req.body;
        const menuItem = await Menu.findByPk(id);
        if (!menuItem) {
            return res.status(404).json({ message: 'Menü öğesi bulunamadı' });
        }
        await menuItem.update({ name, price, image, description });
        res.json(menuItem);
    } catch (error) {
        console.error('Menü öğesi güncellenirken hata:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Menü öğesi sil (sadece admin)
router.delete('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
        }
        const { id } = req.params;
        const menuItem = await Menu.findByPk(id);
        if (!menuItem) {
            return res.status(404).json({ message: 'Menü öğesi bulunamadı' });
        }
        await menuItem.destroy();
        res.json({ message: 'Menü öğesi başarıyla silindi' });
    } catch (error) {
        console.error('Menü öğesi silinirken hata:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

module.exports = router; 