const express = require('express')
const mongoose = require('mongoose')
const route = express.Router()

const {authClient:auth} = require("../helpers/auth")
const check = require("../helpers/check")

const User = require('../models/User')
const Product = require('../models/Product')
const AddedProduct = require('../models/AddedProduct')
const Bill = require('../models/Bill')
const Response = require('../models/Response')

route.use(auth)

route.get('/', (req, res) => {
  return res.render('./client/home')
})

route.get('/shop', async (req, res) => {
  if(!res.locals.isAuth) {
    return res.redirect('/login')
  }

  const {search, category, color, size, sort} = req.query
  let condition = {}
  if(search){
    const patern = new RegExp(`\\b\\w*${search}\\w*\\b`, 'i')
    condition['name'] = {$regex: patern}
  }
  if(category){
    condition['category'] = category.split(',').map((e) => {
      return e.charAt(0).toUpperCase() + e.slice(1)
    })
  }
  if(color){
    condition['color'] = color.split(',').map((e) => {
      return e.charAt(0).toUpperCase() + e.slice(1)
    })
  }

  let condition2; 
  if(size){
    condition2 = (e) => {
      const f1 = (e.size.length + e.size.width + e.size.height) / 3 >= 30
      const f2 = (e.size.length + e.size.width + e.size.height) / 3 < 30 
                  && (e.size.length + e.size.width + e.size.height) / 3 >= 15
      const f3 = (e.size.length + e.size.width + e.size.height) / 3 < 15

      let f = false
      if(size.includes('large')) f = f || f1
      if(size.includes('medium')) f = f || f2
      if(size.includes('small')) f = f || f3
      return f
    }
  }
  
  let condition3;
  if(sort) {
    if(sort === 'decrease') {
      condition3 = (e, f) => -(e.newPrice - f.newPrice)
    } else if(sort === 'increase') {
      condition3 = (e, f) => e.newPrice - f.newPrice
    } else if(sort === 'newest') {
      condition3 = (e, f) => e.updateAt - f.updateAt
    } else {
      condition3 = (e, f) => -(e.updateAt - f.updateAt)
    }
  }

  let products = await Product.find(condition);
  if(size) products = products.filter(condition2);
  if(sort) products = products.sort(condition3);
  const count = products.length;

  const perPape = 5;
  const numberOfPage = Math.ceil(count / perPape)
  const currentPage = Number(req.query.page) || 1;

  let subProducts = products.slice(
    (currentPage - 1) * perPape, 
    (currentPage - 1) * perPape + perPape
  );

  return res.render('./client/shop', {
    products:subProducts, 
    currentPage, numberOfPage
  })
})

route.get('/product/:id', async (req, res) => {
  if(!res.locals.isAuth) {
    return res.redirect('/login')
  }

  const {id} = req.params
  if(!mongoose.isValidObjectId(id)) {
    return res.render('./error')
  }

  const product = await Product.findOne({_id: id})
  const addedProducts = await AddedProduct.find({
    product:product._id, 
    state: 'Received'
  })
  .populate('client')

  return res.render('./client/product', {product, addedProducts})
})

route.get('/cart', async (req, res) => {
  if(!res.locals.isAuth) {
    return res.redirect('/login')
  }

  const addedProducts = await AddedProduct.find({
    client: req.userId, 
    state: 'Added'
  })
  .populate('product')

  req.session.isReferred = true
  return res.render('./client/cart', {addedProducts})
})

route.post('/addToCart', async (req, res) => {
  const {product, quantity} = req.body

  if(product.totalNumber === product.soldNumber) {
    return res.send({'fail': 'Not enough quantity!'})
  }

  const checkProduct = await AddedProduct.findOne({
    client: req.userId, 
    product: product._id,
    state: 'Added'
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

  return res.send({'success': 'Product has been added to your cart sucessfully!'})
})

route.post('/removeFromCart/:id', async (req, res) => {
  const {id} = req.params
  if(!mongoose.isValidObjectId(id)) {
    return res.render('./error')
  }

  await AddedProduct.findByIdAndDelete({_id: id})
  return res.redirect('/cart')
})

route.post('/justifyCart', async (req, res) => {
  const {quantityArr} = req.body
  const addedProducts = await AddedProduct.find({
    client: req.userId, 
    state: 'Added'
  })

  for(let i = 0; i < addedProducts.length; i++){
    addedProducts[i].quantity = Number(quantityArr[i])
    addedProducts[i].save()
  }
  return res.redirect('/cart')
})

route.get('/checkout', check, async (req, res) => {
  delete req.session.isReferred

  const client = await User.findOne({_id: req.userId})
  const addedProducts = await AddedProduct.find({
    client: req.userId, 
    state: 'Added'
  })
  .populate('product')

  return res.render('./client/checkout', {client, addedProducts})
})

route.post('/checkout', async (req, res) => {
  const {note} = req.body
  const addedProducts = await AddedProduct.find({
    client: req.userId, 
    state: 'Added'
  })
  .populate({path: 'product'})

  for(let i = 0; i < addedProducts.length; i++){
    addedProducts[i].state = 'Ordered'
    addedProducts[i].save()

    const product = Product.findOne({_id: addedProducts[i].product._id})
    product.soldNumber = product.soldNumber + addedProducts.quantity
    product.save()
  }

  await Bill.create({client: req.userId, addedProducts, note})

  req.flash('success', 'Your bill has been created successfully!')
  return res.redirect('/bill')
})

route.get('/bill', async (req, res) => {
  if(!res.locals.isAuth) {
    return res.redirect('/login')
  }

  const bills = await Bill.find({
    client: req.userId
  })
  .populate({
    path: 'addedProducts', 
    populate: {path: 'product'}
  })

  return res.render('./client/bill', {bills})
})

route.get('/cancel/:id', async (req, res) => {
  const {id} = req.params
  if(!mongoose.isValidObjectId(id)) {
    return res.render('./error')
  }

  await AddedProduct.findByIdAndUpdate({_id: id}, {state: 'Canceled'})
  return res.redirect('/bill')
})

route.get('/review/:id', async (req, res) => {
  const {id} = req.params
  if(!mongoose.isValidObjectId(id)) {
    return res.render('./error')
  }

  return res.render('./client/review')
})

route.post('/review/:id', async (req, res) => {
  const {id} = req.params
  if(!mongoose.isValidObjectId(id)) {
    return res.render('./error')
  }

  const {rate, comment} = req.body
  await AddedProduct.findByIdAndUpdate({_id: id}, {
    rate, comment, 
    state: 'Reviewed'
  })

  const product = await Product.findOne({_id: id})
  const oldRate = product.rate
  const numOfRate = await AddedProduct.countDocuments({
    product: product._id,
    state: 'Reviewed'
  })

  const newRate = (oldRate * (numOfRate - 1) + rate) / numOfRate
  product.rate = newRate
  product.save()

  return res.redirect('/bill')
})


route.get('/contact', async (req, res) => {
  if(!res.locals.isAuth) {
    return res.redirect('/login')
  }
  return res.render('./client/contact')
})

route.post('/contact', async (req, res) => {
  const {title, content} = req.body

  let error = {}, ok = true
  if(title === '' || content === '') {
    if(title === '') error.title = 'Please fill out this field!'
    if(content === '') error.content = 'Please fill out this field!'
    ok = false
  }

  if(ok) {
    await Response.create({client: req.userId, title, content})
    return res.redirect('/contact')
  } else {
    const response = {title, content}
    return res.render('./client/contact', {response, error})
  }
})

module.exports = route;