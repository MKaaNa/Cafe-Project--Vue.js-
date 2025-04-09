module.exports = (sequelize, DataTypes) => {
    const Order = sequelize.define('Order', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        table: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('onay bekliyor', 'hazırlanıyor', 'hazır', 'teslim edildi', 'iptal edildi'),
            defaultValue: 'onay bekliyor'
        },
        createdBy: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    Order.associate = (models) => {
        Order.belongsTo(models.User, {
            foreignKey: 'createdBy',
            as: 'creator'
        });
        Order.hasMany(models.OrderItem, {
            foreignKey: 'orderId',
            as: 'OrderItems'
        });
    };

    return Order;
}; 