const routes = require('express').Router()
const User = require("../models").User;
const Character = require("../models").Character;

//choose map
routes.get("/", (req,res) => {
  res.render("game-map")
})

//loag game
routes.get('/game', (req,res) => {
  //kind of middleware here..
  let map = req.query.name
  if (map == undefined){
    res.redirect("/hacktiv")
  }
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
      res.render('game-hacktiv', {
      first_name: req.session.first_name,
      last_name: req.session.last_name,
      full_name: req.session.full_name,
      email: req.session.email,
      avatar: result.dataValues.data,
      map: map
      })
    })
  .catch(err => {
    res.render("error", { err: err });
  });
});

//update score and money
routes.post('/game', (req,res) => {
  User.findOne({
    where: {
      email: req.session.email
    }
  })
  .then((result) => {
    //calculation goes here..
    let myScore = null
    let myMoney = result.dataValues.money + Number(req.body.money)
    if (result.dataValues.top_score < req.body.score){
      myScore = req.body.score
    } else {
      myScore = result.dataValues.top_score
    }
    User.update({
      money: myMoney,
      top_score: myScore
    },{
        where: {email: req.session.email}
    })
  })
  .then(() => {
    //redirect
    if (req.body.do == 'play'){
      res.redirect('/hacktiv')
    } else {
      res.redirect('/home')
    }
  })
  .catch(err => {
    res.render("error", { err: err });
  });
})

module.exports = routes