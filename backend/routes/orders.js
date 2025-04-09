const express = require('express');
const router = express.Router();
const { Order, User } = require('../models');
const PDFDocument = require('pdfkit');
const auth = require('../middleware/auth');

// ... existing code ...

// Fatura oluşturma
router.get('/:id/invoice', auth, async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            include: [{
                model: User,
                attributes: ['name', 'email']
            }]
        });

        if (!order) {
            return res.status(404).json({ error: 'Sipariş bulunamadı' });
        }

        // PDF oluştur
        const doc = new PDFDocument();
        const buffers = [];
        
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=fatura-${order.id}.pdf`);
            res.send(pdfData);
        });

        // Fatura başlığı
        doc.fontSize(20).text('FATURA', { align: 'center' });
        doc.moveDown();
        
        // Restoran bilgileri
        doc.fontSize(12).text('RESTORAN ADI', { align: 'center' });
        doc.fontSize(10).text('Adres: Örnek Mahallesi, Örnek Sokak No:1', { align: 'center' });
        doc.fontSize(10).text('Telefon: (555) 123 45 67', { align: 'center' });
        doc.moveDown();

        // Sipariş bilgileri
        doc.fontSize(12).text(`Sipariş No: ${order.id}`);
        doc.text(`Tarih: ${new Date(order.timestamp).toLocaleString('tr-TR')}`);
        doc.text(`Masa No: ${order.table}`);
        doc.text(`Garson: ${order.User.name}`);
        doc.moveDown();

        // Ürünler tablosu
        const tableTop = doc.y;
        doc.fontSize(10);
        
        // Tablo başlıkları
        doc.text('Ürün', 50, tableTop);
        doc.text('Adet', 250, tableTop);
        doc.text('Fiyat', 300, tableTop);
        doc.text('Toplam', 350, tableTop);
        
        // Ürünler
        let y = tableTop + 20;
        order.items.forEach(item => {
            doc.text(item.name, 50, y);
            doc.text(item.quantity.toString(), 250, y);
            doc.text(`${item.price}₺`, 300, y);
            doc.text(`${item.price * item.quantity}₺`, 350, y);
            y += 20;
        });

        // Toplam
        doc.moveDown();
        doc.fontSize(12).text(`Toplam: ${order.total}₺`, { align: 'right' });
        
        // Teşekkür mesajı
        doc.moveDown(2);
        doc.fontSize(10).text('Bizi tercih ettiğiniz için teşekkür ederiz!', { align: 'center' });
        
        doc.end();
    } catch (error) {
        console.error('Fatura oluşturulurken hata:', error);
        res.status(500).json({ error: 'Fatura oluşturulurken bir hata oluştu' });
    }
});

module.exports = router; 