const routes = require('express').Router()
const middleware = require('../middleware/middleware.js')
const bcrypt = require('bcryptjs') 

//models
const User = require("../models").User;
const Character = require("../models").Character;
const Transaction = require("../models").Transaction;

//for middleware
const home = require('./home.js')
const hacktiv = require('./game-hacktiv.js')
const normal = require('./game-normal.js')
const store = require('./store.js')
const performance = require('./performance.js')

//helpers
const sortArr = require('../helpers/sortArr.js')

//routes with middleware
routes.use('/home', middleware, home)
routes.use('/store', middleware, store)
routes.use('/normal', middleware, normal)
routes.use('/hacktiv', middleware, hacktiv)
routes.use('/store', middleware, store)
routes.use('/performance', middleware, performance)


//<-- no middleware here -->

//home-page login
routes.get('/', (req,res) => {
    let error = req.query.error
    res.render('home-page', {
        error: error
    })
})
routes.post('/', (req, res) => {
    User.findOne({
        where: {
            email: req.body.email
        }
    })
    .then((response) => {
        if (response !== null){
            //check password
            let check = bcrypt.compareSync(req.body.password, response.password)
            if (check == true){
                //session
                req.session.userId = response.dataValues.id
                req.session.first_name = response.dataValues.first_name
                req.session.last_name = response.dataValues.last_name
                req.session.email = response.dataValues.email
                //instance method
                req.session.full_name = response.getFullName()

                res.redirect("/home");
            } else {
                let msg = "Invalid password!"
                res.redirect(`/?error=${msg}`);
            }
        } else {
            throw "Invalid email!"
        }
      })
    .catch(err => {
        let msg = "Invalid email!"
        res.redirect(`/?error=${msg}`);
    });
});

//registration
routes.get("/register", (req, res) => {
    let err = req.query.message
    res.render("home-register", {
        error: err
    });
});
routes.post("/register", (req, res) => {
    User.create({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      age: req.body.age,
      email: req.body.email,
      password: req.body.password,
      avatar: 12,
      top_score: 0,
      money: 100
    })
    .then((result) => {
        return Transaction.create({
            UserId: result.dataValues.id,
            CharacterId: 12
        })
    })
    .then((result) => {
        res.redirect("/");
    })
    .catch(err => {
        res.redirect(`/register?message=${err.message}`);
    });
});

//logout
routes.get('/logout', (req, res) => {
    req.session.userId = null
    req.session.first_name = null
    req.session.last_name = null
    req.session.full_name = null
    req.session.email = null
    req.session.avatar = null
    res.redirect('/')
})

//leaderboard
routes.get("/leaderboard", (req, res) => {
    let top = null
    let mny = null
    //class method
    User.getLeaderboard()
    .then((result) => {
        mny = result
    })
    .then(()=>{
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

        //helpers
        top = sortArr(top, 'big', 'score')
        mny = sortArr(mny, 'big', 'money')

        res.render('leaderboard', {
            user: top,
            char: output,
            money: mny,
            status: req.session.userId
        })
    })
    .catch(err => {
        res.render("error", { err: err });
    });
});

module.exports = routes