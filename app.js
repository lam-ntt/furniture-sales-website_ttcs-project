require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');

const app = express();
const port = 3000;

app.use(express.static('public'))
app.use(expressLayout);
app.set('view engine', 'ejs');
app.set('layout', './layouts/user');

app.use('/', require('./controlers/user'));

app.listen(port, () => {
  console.log(`App listening on port ${port}...`);
});