const express = require('express');
const route = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Product = require('../models/Product');

route.post('/register', async (req, res) => {
  // For rendering register page
  const hashPassword = bcrypt.hashSync(req.body.password, 10);

  let user = new User({
    name: req.body.name,
    password: hashPassword,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address,
    idAdmin: req.body.isAdmin
  });

  user = await user.save();
  if(!user){
    res.status(500).send('Account cant be created.')
  }

  res.send(user);
});

route.post('/login', async (req, res) => {
  // For rendering login page
  let user = await User.findOne({email: req.body.email});

  if(!user){
    res.status(404).send('Account doesnt exist.')
  }

  if(user && bcrypt.compareSync(req.body.password, user.password)){
    const token = jwt.sign({
      userId: user._id,
      isAdmin: user.isAdmin
    }, process.env.SECRET_KEY, {
      expiresIn: '1d'
    });
    res.send({token});
  }else{
    res.status(400).send('Wrong password.');
  }
});

route.post('/send-request', async (req, res) => {
  // For rendering requestpage
  let user = await User.findOne({email: req.body.email});

  if(!user){
    res.status(404).send('Account doesnt exist.')
  }
  res.send(user);
});

route.post('/reset-password/:id', async (req, res) => {
  // For rendering resetpage
  let user = await User.findByIdAndUpdate(req.params.id, {
    password: bcrypt.hashSync(req.body.password)
  }, {
    new: true
  });

  if(!user){
    res.status(404).send('Account doesnt exist.')
  }
  res.send(user);
});

route.get('/', async (req, res) => {
  // For rendering homepage
});

route.get('/shop', async (req, res) => {
  // For rendering shoppage
  const searchPatern = new RegExp(/[A-Za-z0-9 ]/, 'g'); //

  const filters = {};
  if(req.query.search){
    filters['name'] = {$regex: searchPatern};
  }
  if(req.query.category){
    filters['category'] = req.query.category.split(',');
  }
  if(req.query.size){
    filters['size'] = req.query.size.split(',');
  }
  if(req.query.minPrice){
    console.log(req.query.minPrice, req.query.maxPrice);
    filters['newPrice'] = {
      $gte: Number(req.query.minPrice), 
      $lte: Number(req.query.maxPrice)
    };
  }

  // const sequence = {};
  // if(req.query.sort){
  //   switch(req.query.sort){
  //     case 'PriceDecrease': 
  //       sequence['newPrice'] = -1;
  //       break;
  //     case 'PriceIncrease': 
  //       sequence['newPrice'] = 1;
  //       break;
  //     case 'Newest':
  //       sequence['createAt'] = -1;
  //       break;
  //     case 'Oldest':
  //       sequence['newPrice'] = 1;
  //       break;
  //     case 'Bestseller':
  //       sequence['soldNumber'] = 1;
  //       break;
  //   }
  // }
  // console.log(sequence);
  // ?

  const products = await Product.find(filters);
  const count = products.length;

  const perPape = 2;
  const currentPage = Number(req.query.page) || 1;

  if(currentPage > 0 
    && (currentPage - 1) * perPape < count){
    const products = await Product.find(filters)
      .skip((currentPage - 1) * perPape)
      .limit(perPape);

    if(!products){
      res.status(404).send('Product list is empty.');
    }
    res.send(products);
  }else{
    res.status(404).send('Page not found.');
  }
});

route.get('/contact', async (req, res) => {
  // For rendering contactpage
});

route.get('/cart', async (req, res) => {
  // For rendering cartpage
});

route.get('/checkout', async (req, res) => {
  // For rendering checkoutpage
});

route.get('/account', async (req, res) => {
  // For rendering accountppage
});

module.exports = route;