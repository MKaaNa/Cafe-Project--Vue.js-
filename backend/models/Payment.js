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
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    method: {
        type: DataTypes.ENUM('qr', 'cash', 'card'),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('completed', 'failed', 'pending'),
        defaultValue: 'completed'
    },
    givenAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    change: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    cardLastFour: {
        type: DataTypes.STRING,
        allowNull: true
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

module.exports = Payment; 