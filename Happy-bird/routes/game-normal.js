const routes = require('express').Router()

//models
const User = require("../models").User;
const Character = require("../models").Character;

//load game
routes.get('/', (req,res) => {
  User.findOne({
    where: {
      email: req.session.email
    }
  })
  .then((result) => {
    return Character.findOne({
      where: {
        id: result.dataValues.avatar
      }
    })
  })
  .then((result) => {
      res.render('game-normal', {
      first_name: req.session.first_name,
      last_name: req.session.last_name,
      full_name: req.session.full_name,
      email: req.session.email,
      avatar: result.dataValues.data
      })
    })
  .catch(err => {
    res.render("error", { err: err });
  });
});

//update score
routes.post('/', (req,res) => {
  User.findOne({
    where: {
      email: req.session.email
    }
  })
  .then((result) => {
    //check top score
    let myScore = null
    if (result.dataValues.top_score < req.body.score){
      myScore = req.body.score
    } else {
      myScore = result.dataValues.top_score
    }
    User.update({
      top_score: myScore
    },{
        where: {email: req.session.email}
    })
  })
  .then(() => {
    if (req.body.do == 'play'){
      res.redirect('/normal')
    } else {
      res.redirect('/home')
    }
  })
  .catch(err => {
    res.render("error", { err: err });
  });
})

module.exports = routes