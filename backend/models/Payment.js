const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Orders',
            key: 'id'
        }
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    method: {
        type: DataTypes.ENUM('cash', 'card', 'qr'),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed'),
        defaultValue: 'pending'
    },
    transactionId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

module.exports = Payment; 