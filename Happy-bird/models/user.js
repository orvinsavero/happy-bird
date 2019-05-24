'use strict';
let bcrypt = require('bcryptjs');
let salt = bcrypt.genSaltSync(10);
const sequelize = require('sequelize')
const Op = sequelize.Op

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    age: DataTypes.INTEGER,
    email: {
      type:DataTypes.STRING,
      validate:{
          notEmpty: true,
          isEmail: true,
          isUnique: function(value, cb) {
              User.findOne({
                  where: {
                      email: value, 
                      id:{
                        [Op.ne]: this.id
                      }
                   }
              })
              .then((result) => {
                  if(result){
                      cb('email already used')
                  } else {
                      cb()
                  }
              })
              .catch((err) => {
                  throw new Error(err)
              })
          }
        }
  },
    password: {
      type: DataTypes.STRING,
      validate: {
        len:[8]
      }
    },
    avatar: DataTypes.STRING,
    money: DataTypes.INTEGER,
    top_score: DataTypes.INTEGER
  }, {
    hooks: {
      beforeCreate: (user, options) => {
        user.password = bcrypt.hashSync(user.password, salt)
      },
      beforeUpdate: (user, options) => {
        user.password = bcrypt.hashSync(user.password, salt)
      }
    },
    sequelize
});
  User.prototype.getFullName = function(){
  return `${this.first_name} ${this.last_name}`;
}
  User.getLeaderboard = function(){
    return User.findAll()
    .then((result) => {
      let temp = []
      result.forEach((t) => {
        let a = t.dataValues
        if (a.top_score != 0){
          let obj = {
            id: a.id,
            fullName: t.getFullName(),
            avatar: a.avatar,
            score: a.top_score,
            money: a.money
          }
          temp.push(obj)
        }
      })
      return temp
    })
  }
  User.associate = function(models) {
    User.hasMany(models.Transaction);
		User.belongsToMany(models.Character, {
      through: "Transaction", 
      foreignKey: 'UserId'
    });
  };
  return User;
};