require('dotenv').config()
const express = require('express')
const expressLayout = require('express-ejs-layouts')
const morgan = require('morgan') // for showing http request
const mongoose = require('mongoose')
const bodyParser = require('body-parser') // for using req.body...
const cookieParser = require('cookie-parser') // for using req.cookie...
const cors = require('cors')
const session = require('express-session')
const flash = require('connect-flash')

mongoose.connect(process.env.DATABASE_URL)
  .then((res) => console.log('Database connecting...'))
  .catch((err) => console.log(err))

const app = express()

app.use(express.static('public'))
app.use(express.json())
app.use(expressLayout);
app.set('layout', './layout/client')
app.set('view engine', 'ejs')

app.use(morgan('tiny'))
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json()) 
app.use(cookieParser())

app.use(session({ 
  cookie: { maxAge: 60000 }, 
  secret: process.env.SECRET_KEY,
  resave: false, 
  saveUninitialized: false
}));

app.use(flash())
app.use((req, res, next) => {
  res.locals.successMessages = req.flash('success')
  res.locals.failMessages = req.flash('fail')
  next()
})

app.use('/', require('./routes/auth'))
app.use('/', require('./routes/client'))
app.use('/admin', require('./routes/manager'))

app.listen(3000, () => {
  console.log('App listening on port 3000...')
})