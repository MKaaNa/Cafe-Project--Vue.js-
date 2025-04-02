const { Sequelize } = require('sequelize');
const path = require('path');

// SQLite veritabanı bağlantısı
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../db/database.sqlite') // Veritabanı dosyası
});

// Veritabanı bağlantısını test et
sequelize.authenticate()
    .then(() => console.log('SQLite bağlantısı başarılı!'))
    .catch(err => console.error('SQLite bağlantısı başarısız:', err));

module.exports = sequelize;