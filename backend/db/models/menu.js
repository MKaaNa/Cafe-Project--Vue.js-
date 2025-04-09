module.exports = (sequelize, DataTypes) => {
    const Menu = sequelize.define('Menu', {
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
        }
    });

    Menu.associate = (models) => {
        Menu.hasMany(models.Product, {
            foreignKey: 'menuId',
            as: 'products'
        });
    };

    return Menu;
}; 