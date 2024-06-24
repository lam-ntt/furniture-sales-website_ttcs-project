const express = require('express');
const mongoose = require('mongoose')
const route = express.Router();

const upload = require('../helpers/upload')

const Product = require('../models/Product');
const AddedProduct = require('../models/AddedProduct')
const adminLayout = '../views/layout/manager'

route.get('/', (req, res) => {
  return res.render('./manager/home', {layout: adminLayout})
})

route.get('/add-product', async (req, res) => {
  return res.render('./manager/add-product', {layout: adminLayout})
})

route.post('/add-product', upload.single('image'), async (req, res) => {
  let {name, category, color, length, width, height, 
        oldPrice, newPrice, totalNumber, description} = req.body
  let {file} = req

  let error = {}, ok = true
  if(isNaN(length) || isNaN(width) || isNaN(height) || isNaN(oldPrice) || isNaN(newPrice) || isNaN(totalNumber)) {
    if(isNaN(length)) {
      error.length = 'Invalid number format!'
      length = ''
    }
    if(isNaN(width)) {
      error.width = 'Invalid number format!'
      width = ''
    }
    if(isNaN(height)) {
      error.height = 'Invalid number format!'
      height = ''
    }
    if(isNaN(oldPrice)) {
      error.oldPrice = 'Invalid number format!'
      oldPrice = ''
    }
    if(isNaN(newPrice)) {
      error.newPrice = 'Invalid number format!'
      newPrice = ''
    }
    if(isNaN(totalNumber)) {
      error.totalNumber = 'Invalid number format!'
      totalNumber = ''
    }
    ok = false
  }

  if(!isNaN(length) && length === 0) {
    error.length = 'Length must be positive number!'
    length = ''
    ok = false
  }

  if(!isNaN(width) && width === 0) {
    error.width = 'Width must be positive number!'
    width = ''
    ok = false
  }

  if(!isNaN(height) && height === 0) {
    error.height = 'Height must be positive number!'
    height = ''
    ok = false
  }

  if(!isNaN(totalNumber) && totalNumber === 0) {
    error.totalNumber = 'Total number must be positive number!'
    totalNumber = ''
    ok = false
  }

  const mimetype = file.mimetype
  if(!mimetype.endsWith('png') && !mimetype.endsWith('jpg') && !mimetype.endsWith('imeg')) {
    error.image = 'File type must be png, jpg or imeg!'
    ok = false
  }

  if(ok) {
    await Product.create({
      name, category, color, size: {length, width, height}, 
      oldPrice, newPrice, totalNumber, description, image: file.filename
    })
    req.flash('success', 'Product has been added successfully!')
    return res.redirect('/admin')
  } else {
    const product = {name, category, color, length, width, height, 
                      oldPrice, newPrice, totalNumber, description, image: file.filename}
    return res.render('./manager/add-product', {layout: adminLayout, product, error})
  }
})

route.get('/search-product', async (req, res) => {
  const {id} = req.query
  let products
  if(id !== 'all') {
    products = await Product.find({_id: id})
  } else {
    products = await Product.find()
  }

  return res.render('./manager/search-product', {layout: adminLayout, products})
})

route.get('/update-product/:id', async (req, res) => {
  const {id} = req.params
  if(!mongoose.isValidObjectId(id)) {
    return res.render('./error')
  }

  const product = await Product.findOne({_id: id})
  res.render('./manager/update-product', {layout: adminLayout, product})
})

route.post('/update-product/:id', upload.single('image'), async (req, res) => {
  const {id} = req.params
  const oldProduct = await Product.findOne({_id: id})

  let {name, category, color, length, width, height, 
      oldPrice, newPrice, totalNumber, description} = req.body
  let {file} = req

  let error = {}, ok = true
  if(isNaN(length) || isNaN(width) || isNaN(height) || isNaN(oldPrice) || isNaN(newPrice) || isNaN(totalNumber)) {
    if(isNaN(length)) {
      error.length = 'Invalid number format!'
      length = ''
    }
    if(isNaN(width)) {
      error.width = 'Invalid number format!'
      width = ''
    }
    if(isNaN(height)) {
      error.height = 'Invalid number format!'
      height = ''
    }
    if(isNaN(oldPrice)) {
      error.oldPrice = 'Invalid number format!'
      oldPrice = ''
    }
    if(isNaN(newPrice)) {
      error.newPrice = 'Invalid number format!'
      newPrice = ''
    }
    if(isNaN(totalNumber)) {
      error.totalNumber = 'Invalid number format!'
      totalNumber = ''
    }
    ok = false
  }

  if(!isNaN(length) && length === 0) {
    error.length = 'Length must be positive number!'
    length = ''
    ok = false
  }

  if(!isNaN(width) && width === 0) {
    error.width = 'Width must be positive number!'
    width = ''
    ok = false
  }

  if(!isNaN(height) && height === 0) {
    error.height = 'Height must be positive number!'
    height = ''
    ok = false
  }

  if(!isNaN(totalNumber) && totalNumber === 0) {
    error.totalNumber = 'Total number must be positive number!'
    totalNumber = ''
    ok = false
  }

  if(file) {
    const mimetype = file.mimetype
    if(!mimetype.endsWith('png') && !mimetype.endsWith('jpg') && !mimetype.endsWith('imeg')) {
      error.image = 'File type must be png, jpg or imeg!'
      ok = false
    }
  }

  if(ok) {
    if(file) {
      await Product.findByIdAndUpdate({_id: id}, {
        name, category, color, size: {length, width, height}, 
        oldPrice, newPrice, totalNumber, description, image: file.filename
      })
    } else {
      await Product.findByIdAndUpdate({_id: id}, {
        name, category, color, size: {length, width, height}, 
        oldPrice, newPrice, totalNumber, description
      })
    }

    req.flash('success', 'Product has been updated successfully!')
    res.redirect('/admin')
  } else {
    const product = {_id: oldProduct._id, name, category, color, size: {length, width, height}, 
                      oldPrice, newPrice, totalNumber, description, image: oldProduct.image}
    return res.render('./manager/update-product', {layout: adminLayout, product, error})
  }
});

route.get('/delete-product/:id', async (req, res) => {
  const {id} = req.params
  if(!mongoose.isValidObjectId(id)) {
    return res.render('./error')
  }

  await Product.findByIdAndDelete({_id: id})
  req.flash('success', 'Product has been deleted successfully!')
  return res.redirect('/admin')
})

route.get('/search-bill', async (req, res) => {
  const {id} = req.query
  const states = ['Ordered', 'Processing', 'Delivering', 'Received', 'Canceled']
  let addedProducts
  if(id !== 'all') {
    addedProducts = await AddedProduct.find({_id: id, state: {$in: states}}).populate('client product')
  } else {
    addedProducts = await AddedProduct.find({state: {$in: states}}).populate('client product')
  }

  return res.render('./manager/search-bill', {layout: adminLayout, addedProducts})
})

route.post('/update-bill/:id', async (req, res) => {
  const {id} = req.params
  if(!mongoose.isValidObjectId(id)) {
    return res.render('./error')
  }

  const {state} = req.body
  await AddedProduct.findByIdAndUpdate({_id: id}, {state: state})
  return res.redirect('/search-bill')
})

module.exports = route;