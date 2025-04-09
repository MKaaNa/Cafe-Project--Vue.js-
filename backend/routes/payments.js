const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const auth = require('../middleware/auth');

// Yeni ödeme oluştur
router.post('/', auth, async (req, res) => {
    try {
        const { orderId, amount, method } = req.body;

        // Siparişi kontrol et
        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Sipariş bulunamadı' });
        }

        // Ödeme tutarını kontrol et
        if (amount !== order.total) {
            return res.status(400).json({ message: 'Ödeme tutarı sipariş tutarı ile eşleşmiyor' });
        }

        // Yeni ödeme oluştur
        const payment = await Payment.create({
            orderId,
            amount,
            method,
            status: 'completed',
            timestamp: new Date()
        });

        // Sipariş durumunu güncelle
        await order.update({ status: 'paid' });

        res.status(201).json(payment);
    } catch (error) {
        console.error('Ödeme oluşturulurken hata:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Ödeme geçmişini getir
router.get('/', auth, async (req, res) => {
    try {
        const payments = await Payment.findAll({
            include: [{
                model: Order,
                attributes: ['table', 'items', 'total']
            }],
            order: [['timestamp', 'DESC']]
        });
        res.json(payments);
    } catch (error) {
        console.error('Ödeme geçmişi alınırken hata:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Belirli bir ödemeyi getir
router.get('/:id', auth, async (req, res) => {
    try {
        const payment = await Payment.findByPk(req.params.id, {
            include: [{
                model: Order,
                attributes: ['table', 'items', 'total']
            }]
        });
        
        if (!payment) {
            return res.status(404).json({ message: 'Ödeme bulunamadı' });
        }
        
        res.json(payment);
    } catch (error) {
        console.error('Ödeme detayı alınırken hata:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

module.exports = router; 