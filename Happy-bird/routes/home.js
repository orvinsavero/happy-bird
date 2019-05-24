const routes = require('express').Router()

//models
const Transaction = require("../models").Transaction;
const Character = require("../models").Character;
const User = require("../models").User;

//profile and inventory
routes.get('/', (req,res) => {
  let name = req.query.name
  let sell = req.query.sell
  if (sell != undefined){
    sell = sell.split(',')
  }
  User.findAll({
    include: [Character]
  })
  .then((result) => {
    let userData = null
    let fn = null
    result.forEach((x) =>{
      if (x.dataValues.id == req.session.userId){
        userData = x.dataValues
        fn = x.getFullName()
      }
    })
    let avtr = null
    let charData = []
    userData.Characters.forEach((x) => {

      if(x.dataValues.id == userData.avatar){
        avtr = x.dataValues
      } else {
        charData.push(x.dataValues)
      }
    })
    req.session.avatar = userData.avatar
    console.log(avtr)
    res.render('home', {
      first_name: userData.first_name,
      last_name: userData.last_name,
      full_name: fn,
      email: req.session.email,
      user: userData,
      char: charData,
      avatar: avtr.data,
      name: name,
      sell: sell
    })
  })
  .catch(err => {
    res.render("error", { err: err });
  });
})

//set a character as default 
routes.get('/use/:id', (req, res) => {
  User.update({
    avatar: req.params.id
  },{
    where: {
      id:req.session.userId
    }
  })
  .then(() => {
    return Character.findOne({
      where: {
        id: req.params.id
      }
    })
  })
  .then((result) => {
    let name = result.dataValues.name
    res.redirect(`/home?name=${name}`)
  })
  .catch(err => {
    res.render("error", { err: err });
  });
})

//sell a character
routes.get('/sell/:id', (req, res) => {
  let sell = null
  let nm = null
  Character.findOne({
    where: {
      id: req.params.id
    }
  })
  .then((result) => {
    nm = result.dataValues.name
    sell = result.dataValues.price / 2
  })
  .then(() => {
    return User.findOne({
      where: {
        id:req.session.userId
      }
    })
  })
  .then((result) => {
    User.update({
      money: result.dataValues.money + sell
    },{
      where: {
        id:req.session.userId
      }
    })
  })
  .then(() => {
    return Transaction.destroy({
      where: {
        UserId: req.session.userId,
        CharacterId: req.params.id
      }
    })
  })
  .then(() => {
    let result = []
    result.push(nm)
    result.push(sell)
    res.redirect(`/home?sell=${result}`)
  })
  .catch(err => {
    res.render("error", { err: err });
  });
})

//edit profile
routes.get('/edit', (req,res) => {
  let userData = null
  User.findOne({
    where: {
      id: req.session.userId
    }
  })
  .then((result) => {
    userData = result.dataValues
    return Character.findOne({
      where: {
        id: result.dataValues.avatar
      }
    })
  })
  .then((result) => {
    let avtr = result.dataValues.data
    res.render('user-edit', {
      avatar: avtr,
      user: userData
    })
  })
})
routes.post('/edit', (req,res) => {
  User.findOne({
    where: {
      id: req.session.userId
    }
  })
  .then((result) => {
    //update session
    req.session.first_name = req.body.first_name
    req.session.last_name = req.body.last_name
    req.session.full_name = req.body.first_name + ' ' + req.body.last_name
    req.session.email = req.body.email

    //update database
    result.first_name = req.body.first_name
    result.last_name = req.body.last_name
    result.age = req.body.age
    result.email = req.body.email
    result.password = req.body.password
    return result.save()
  })
  res.redirect('/home')
})

module.exports = routes