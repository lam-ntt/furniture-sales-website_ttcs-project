const express = require('express');
const route = express.Router();

const {authClient} = require("../helpers/authJwt");

const User = require('../models/User');
const Product = require('../models/Product');
const AddedProduct = require('../models/AddedProduct');
const Bill = require('../models/Bill');
const Response = require('../models/Response')

route.use(authClient)

route.get('/', (req, res) => {
  return res.render('./client/home')
})

route.get('/shop', async (req, res) => {
  if(!res.locals.isAuth) res.redirect('/login')

  const {search, category, color, size, sort} = req.query
  let condition = {};
  if(search){
    const patern = new RegExp(`\\b\\w*${search}\\w*\\b`, 'i');
    condition['name'] = {$regex: patern};
  }
  if(category){
    condition['category'] = category.split(',').map((e) => {
      return e.charAt(0).toUpperCase() + e.slice(1)
    });
  }
  if(color){
    condition['color'] = color.split(',').map((e) => {
      return e.charAt(0).toUpperCase() + e.slice(1)
    });
  }

  let filtt; 
  if(size){
    filtt = (e) => {
      const f1 = (e.size.length + e.size.width + e.size.height) / 3 >= 30
      const f2 = (e.size.length + e.size.width + e.size.height) / 3 < 30 && (e.size.length + e.size.width + e.size.height) / 3 >= 15
      const f3 = (e.size.length + e.size.width + e.size.height) / 3 < 15

      let f = false
      if(size.includes('large')) f = f || f1
      if(size.includes('medium')) f = f || f2
      if(size.includes('small')) f = f || f3
      return f
    }
  }
  
  let sortt;
  if(sort) {
    if(sort === 'decrease') {
      sortt = (e, f) => -(e.newPrice - f.newPrice)
    } else if(sort === 'increase') {
      sortt = (e, f) => e.newPrice - f.newPrice
    } else if(sort === 'newest') {
      sortt = (e, f) => e.updateAt - f.updateAt
    } else {
      sortt = (e, f) => -(e.updateAt - f.updateAt)
    }
  }

  let products = await Product.find(condition);
  if(size) products = products.filter(filtt);
  if(sort) products = products.sort(sortt);
  const count = products.length;

  const perPape = 4;
  const numberOfPage = Math.ceil(count / perPape)
  const currentPage = Number(req.query.page) || 1;

  let subProducts = products.slice(
    (currentPage - 1) * perPape, 
    (currentPage - 1) * perPape + perPape
  );

  return res.render('./client/shop', {products:subProducts, currentPage, numberOfPage})
})

route.get('/product/:id', async (req, res) => {
  if(!res.locals.isAuth) res.redirect('/login')

  const {id} = req.params
  const product = await Product.findOne({_id: id})

  if(product) {
    let addedProducts = await AddedProduct.find(
      {product:product._id}
    ).populate('client')

    addedProducts = addedProducts.filter(
      (addedProduct) => (addedProduct.comment !== "")
    )

    return res.render('./client/product', {product, addedProducts})
  } else {
    return res.render('./error')
  }

})

route.get('/cart', async (req, res) => {
  const addedProducts = await AddedProduct.find(
    {client: req.userId, state: 'Added'}
  ).populate('product')

  return res.render('./client/cart', {addedProducts})
})

route.post('/addToCart', async (req, res) => {
  const {product, quantity} = req.body

  const checkProduct = await AddedProduct.findOne({
    client: req.userId, 
    product: product._id
  })

  if(checkProduct) {
    checkProduct.quantity += quantity
    checkProduct.save()
  } else {
    await AddedProduct.create({
      client: req.userId, 
      product: product._id, 
      quantity: quantity
    })
  }

  req.flash('success', 'Product has been added to cart successfully!')
  return res.redirect('/cart')
})

route.post('/removeFromCart/:id', async (req, res) => {
  const {id} = req.params

  await AddedProduct.findByIdAndDelete({_id: id})

  req.flash('success', 'Product has been removed from cart successfully!')
  return res.redirect('/cart')
})

route.post('/justifyCart', async (req, res) => {
  const {quantityArr} = req.body

  const addedProducts = await AddedProduct.find({client: req.userId, state: 'Added'})

  for(let i = 0; i < addedProducts.length; i++){
    addedProducts[i].quantity = Number(quantityArr[i])
    addedProducts[i].save()
  }

  req.flash('success', 'Cart has been updated successfully!')
  return res.redirect('/cart')
})

route.get('/checkout', async (req, res) => {
  const client = await User.findOne({_id: req.userId})
  const addedProducts = await AddedProduct.find(
    {client: req.userId, state: 'Added'}
  ).populate('product')

  return res.render('./client/checkout', {client, addedProducts})
})

route.post('/checkout', async (req, res) => {
  const {note, totalPrice} = req.body

  const client = await User.findOne({_id: req.userId})

  const addedProducts = await AddedProduct.find({client: req.userId, state: 'Added'}).populate({path: 'product'})

  for(let i = 0; i < addedProducts.length; i++){
    addedProducts[i].state = 'Ordered'
    await addedProducts[i].save()

    await Product.findByIdAndUpdate({_id: addedProducts[i].product._id}, {soldNumber: addedProducts[i].quantity})
  }

  await Bill.create({client, addedProducts, totalPrice, note})

  res.redirect('/cart')
})

route.get('/bill', async (req, res) => {
  const bills = await Bill.find({client: req.userId}).populate({path: 'addedProducts', populate: {path: 'product'}})
  res.render('./client/bill', {bills})
})

route.get('/cancel/:id', async (req, res) => {
  const {id} = req.params
  await AddedProduct.findByIdAndUpdate({_id: id}, {state: 'Canceled'})
  res.redirect('/bill')
})

route.get('/review/:id', async (req, res) => {
  res.render('./client/review')
})

route.post('/review/:id', async (req, res) => {
  const {id} = req.params
  const {rate, comment} = req.body
  await AddedProduct.findByIdAndUpdate({_id: id}, {rate, comment})
  res.redirect('/bill')
})


route.get('/contact', async (req, res) => {
  res.render('./client/contact')
})

route.post('/contact', async (req, res) => {
  const {title, content} = req.body
  await Response.create({client: req.userId, title, content})
  res.redirect('/contact')
})


module.exports = route;