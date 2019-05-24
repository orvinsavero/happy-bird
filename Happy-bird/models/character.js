'use strict';
module.exports = (sequelize, DataTypes) => {
  const Character = sequelize.define('Character', {
    name: DataTypes.STRING,
    price: DataTypes.INTEGER,
    data: DataTypes.STRING
  }, {});
  Character.associate = function(models) {
    // associations can be defined here
    Character.hasMany(models.Transaction);
    Character.belongsToMany(models.User, {
      through: "Transaction", 
      foreignKey: 'CharacterId'
    });
  };
  return Character;
};