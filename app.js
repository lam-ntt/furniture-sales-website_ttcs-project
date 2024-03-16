require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const authJwt = require('./helpers/jwt');
// const expressLayout = require('express-ejs-layouts');



const app = express();
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(authJwt());


// app.use(express.static('public'))
// app.use(expressLayout);
// app.set('view engine', 'ejs');
// app.set('layout', './layouts/user');

mongoose.connect(process.env.DATABASE_URL)
  .then(() => console.log('Database connecting...'))
  .catch((err) => console.log(err));

app.use('/', require('./routes/main'));
app.use('/admin', require('./routes/admin'));

app.listen(3000, () => {
  console.log('App listening on port 3000...');
});