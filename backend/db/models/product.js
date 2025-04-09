module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define('Product', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    Product.associate = (models) => {
        Product.hasMany(models.OrderItem, {
            foreignKey: 'productId',
            as: 'orderItems'
        });
        Product.belongsTo(models.Menu, {
            foreignKey: 'menuId',
            as: 'menu'
        });
    };

    return Product;
}; 