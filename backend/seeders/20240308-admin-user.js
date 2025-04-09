const bcrypt = require('bcryptjs');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        return queryInterface.bulkInsert('Users', [{
            name: 'Admin',
            email: 'admin@resto.com',
            password: hashedPassword,
            role: 'admin',
            createdAt: new Date(),
            updatedAt: new Date()
        }]);
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('Users', { email: 'admin@resto.com' });
    }
}; 