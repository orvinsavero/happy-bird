const express = require('express')
const routes = require('./routes')
const session = require('express-session')
let app = express()
let port = 3000

app.set("view engine", "ejs")

app.use(express.static(__dirname + '/game'))
app.use(session({
    secret: 'keyboard cat'
  }))
app.use(express.urlencoded({extended: false}))
app.use('/', routes)

app.listen(port, () => {
    console.log(`Running at port: ${port}`)
})