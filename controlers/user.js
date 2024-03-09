const express = require('express');
const route = express.Router();

route.get('/', (req, res) => {
  res.render('user-pages/home');
});

module.exports = route;