module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM('admin', 'user'),
            defaultValue: 'user'
        }
    });

    User.associate = (models) => {
        User.hasMany(models.Order, {
            foreignKey: 'createdBy',
            as: 'orders'
        });
    };

    return User;
}; 