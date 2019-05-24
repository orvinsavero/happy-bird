const routes = require('express').Router()

//models
const User = require("../models").User;
const Character = require("../models").Character;

//helpers
const sortArr = require('../helpers/sortArr.js')

//load chart
routes.get("/", (req, res) => {
    let top = null
    let mny = null
    let acc = null
    //class method
    User.getLeaderboard()
    .then((result) => {
        mny = result
    })
    .then(() => {
        return User.findOne({
            where: {
                id: req.session.userId
            }
        })
    })
    .then((result)=>{
        acc = result.dataValues
        //another class method..
        return User.getLeaderboard()
    })
    .then((result) => {
        top = result
        return Character.findAll()
    })
    .then((result) => {
        let output = []
        result.map((x) => {
            output.push(x.dataValues)
        })
        let money1 = []
        let score1 = []
        let name1 = []
        money1.push(acc.money)
        score1.push(acc.top_score)
        name1.push('YOU')

        top.forEach((x) => {
            if (x.id !== acc.id){
                money1.push(x.money)
                score1.push(x.score)
                name1.push(x.fullName)
            }
        })
        res.render('performance', {
            user: top,
            char: output,
            money: mny,
            status: req.session.userId,
            name: req.session.full_name,
            acc: acc,
            money1: money1,
            score1: score1,
            name1: name1
        })
    })
    .catch(err => {
        res.render("error", { err: err });
    });
});

module.exports = routes