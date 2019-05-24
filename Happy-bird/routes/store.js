const routes = require('express').Router()

//models
const User = require("../models").User;
const Character = require("../models").Character;
const Transaction = require("../models").Transaction;

//helpers
const sortArr = require('../helpers/sortArr.js')

//store - character list
routes.get("/", (req, res) => {
    let sorting = req.query.nameSort
    let name = req.query.name
    let error = req.query.error
    let userData = null
    let charData = []
    let transData = []
    User.findOne({
        where: {
            id: req.session.userId
        }
    })
    .then((result) => {
        userData = result.dataValues
        return Character.findAll()
    })
    .then((result) => {
        result.map((x)=>{
            charData.push(x.dataValues)
        })
    })
    .then(() => {
        return Transaction.findAll({
            where: {
                UserId: req.session.userId
            }
        })
    })
    .then((result) => {
        result.map((x)=>{
            transData.push(x.dataValues)
        })
    })
    .then(() => {
        //remove characters in user inventory
        transData.forEach((x) => {
            charData.forEach((t, i) => {
                if (x.CharacterId == t.id){
                    charData.splice(i,1)
                }
            })
        })
        //helpers for sorting
        if (sorting == 'high'){
            charData = sortArr(charData, 'big', 'price')
        } else if (sorting == 'low'){
            charData = sortArr(charData, 'small', 'price')
        } else if (sorting == 'A'){
            charData = sortArr(charData, 'small', 'name')
        } else if (sorting == 'Z'){
            charData = sortArr(charData, 'big', 'name')
        }
        res.render('store', {
            data: charData,
            error: error,
            name: name,
            user:userData
        })
    })
    .catch(err => {
        res.render("error", { err: err });
    });
});

//buy character
routes.get("/buy/:id", (req, res) => {
    let charData = null
    let userData = null
    Character.findOne({
        where: {
            id: req.params.id
        }
    })
    .then((result) => {
        charData = result.dataValues
    })
    .then(() => {
        return User.findOne({
            where: {
                id: req.session.userId
            }
        })
    })
    .then((result) => {
        userData = result.dataValues

        //validation money
        if (userData.money >= charData.price ){
            User.update({
                money: userData.money - charData.price
            },{
                where: { 
                    id: req.session.userId 
                }
            })
            .then(() => {
                Transaction.create({ 
                    CharacterId: req.params.id, 
                    UserId: req.session.userId
                })
            })
            .then(() => {
                let name = charData.name
                res.redirect(`/store?name=${name}`);
              })
        } else {
            res.redirect(`/store?error=${charData.name}`);
        }
    })
      .catch(err => {
        res.render("error", { err: err });
      });
  });

module.exports = routes