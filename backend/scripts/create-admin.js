const { sequelize } = require('../db');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function createAdmin() {
    try {
        // Veritabanı bağlantısını senkronize et
        await sequelize.sync();
        
        // Admin kullanıcısının var olup olmadığını kontrol et
        const existingAdmin = await User.findOne({ where: { email: 'admin@resto.com' } });
        
        if (existingAdmin) {
            console.log('Admin kullanıcısı zaten mevcut!');
            console.log('Email: admin@resto.com');
            console.log('Şifre: admin123');
        } else {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            
            await User.create({
                name: 'Admin',
                email: 'admin@resto.com',
                password: hashedPassword,
                role: 'admin'
            });
            
            console.log('Admin kullanıcısı başarıyla oluşturuldu!');
            console.log('Email: admin@resto.com');
            console.log('Şifre: admin123');
        }
    } catch (error) {
        console.error('Admin kullanıcısı oluşturulurken hata:', error);
    } finally {
        process.exit();
    }
}

createAdmin(); 