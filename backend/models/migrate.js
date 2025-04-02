const sequelize = require('../models/index'); // Doğru yol
const User = require('./User'); // Doğru yol
const Order = require('./Order'); // Doğru yol
const Menu = require('./Menu'); // Doğru yol
const fs = require('fs');
const path = require('path');

(async () => {
    try {
        // Veritabanını senkronize et
        await sequelize.sync({ force: true }); // `force: true` tabloları sıfırlar ve yeniden oluşturur
        console.log('Veritabanı senkronize edildi!');

        const dbPath = path.join(__dirname, '../../db/db.json'); // JSON dosyasının doğru yolu
        const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

        // Kullanıcıları ekle
        for (const user of data.users) {
            await User.create(user);
        }

        // Siparişleri ekle
        for (const order of data.orders) {
            await Order.create(order);
        }

        // Menü öğelerini ekle
        for (const menuItem of data.menu) {
            await Menu.create(menuItem);
        }

        console.log('Veriler SQLite veritabanına başarıyla aktarıldı!');
        process.exit(0);
    } catch (error) {
        console.error('Veri aktarımı sırasında hata oluştu:', error);
        process.exit(1);
    }
})();