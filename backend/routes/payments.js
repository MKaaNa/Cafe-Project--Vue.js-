const express = require('express');
const router = express.Router();
const { Payment, Order } = require('../models');
const auth = require('../middleware/auth');

// Yeni ödeme oluştur
router.post('/', auth, async (req, res) => {
    try {
        const { orderId, amount, method, givenAmount, change, cardLastFour } = req.body;

        // Siparişi kontrol et
        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Sipariş bulunamadı' });
        }

        // Ödeme oluştur
        const payment = await Payment.create({
            orderId,
            amount,
            method,
            givenAmount,
            change,
            cardLastFour,
            status: 'completed'
        });

        // Sipariş durumunu güncelle
        await order.update({ status: 'teslim edildi' });

        res.status(201).json(payment);
    } catch (error) {
        console.error('Ödeme oluşturulurken hata:', error);
        res.status(500).json({ error: 'Ödeme işlemi sırasında bir hata oluştu' });
    }
});

// Ödeme geçmişini getir
router.get('/', auth, async (req, res) => {
    try {
        const payments = await Payment.findAll({
            include: [{
                model: Order,
                attributes: ['table', 'total', 'status']
            }],
            order: [['timestamp', 'DESC']]
        });
        res.json(payments);
    } catch (error) {
        console.error('Ödemeler getirilirken hata:', error);
        res.status(500).json({ error: 'Ödemeler getirilirken bir hata oluştu' });
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