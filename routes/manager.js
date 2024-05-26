const express = require('express');
const route = express.Router();
const multer = require('multer');

const Product = require('../models/Product');
const adminLayout = '../views/layout/manager'

const FILE_TYPE_MAP = {
  'image/png': 'png',
  'image/jpg': 'jpg',
  'image/imeg': 'imeg'
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error('False to upload.');
    if(isValid){
      uploadError = null;
    }
    cb(uploadError, 'public/uploads')
  },
  filename: function (req, file, cb) {
    const filename = file.originalname.split(' ').join('-');
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null,`${filename.slice(0, filename.length - 4)}-${Math.random()*1e10}.${extension}`);
  }
})

const upload = multer({ storage: storage });

route.get('/', (req, res) => {
  return res.render('./manager/home', {layout: adminLayout})
})

route.get('/add-product', async (req, res) => {
  res.render('./manager/add-product', {layout: adminLayout})
})

route.post('/add-product', upload.single('image'), async (req, res) => {
  const {name, category, color, length, width, height, oldPrice, newPrice, totalNumber, description} = req.body

  const image = req.file.filename

  await Product.create({name, category, color, size: {length, width, height}, oldPrice, newPrice, totalNumber, description, image})

  res.redirect('/admin')
})

route.get('/search-update-product', async (req, res) => {
  const {id} = req.query
  const product = await Product.findOne({_id: id})

  res.render('./manager/search-update-product', {layout: adminLayout, product})
})

route.get('/update-product/:id', async (req, res) => {
  const {id} = req.params
  const product = await Product.findOne({_id: id})

  res.render('./manager/update-product', {layout: adminLayout, product})
})

route.post('/update-product/:id', upload.single('image'), async (req, res) => {
  const {id} = req.params
  const {name, category, color, length, width, height, oldPrice, newPrice, totalNumber, description} = req.body

  let image = ''
  if(req.file){
    image = req.file.filename
  }else{
    const product = await Product.findOne({_id: id})
    image = product.image
  }

  await Product.findByIdAndUpdate({_id: id}, {name, category, color, size: {length, width, height}, oldPrice, newPrice, totalNumber, description, image})

  res.redirect('/admin')
});

route.get('/search-delete-product', async (req, res) => {
  const {id} = req.query
  const product = await Product.findOne({_id: id})

  res.render('./manager/search-delete-product', {layout: adminLayout, product})
})

route.get('/delete-product/:id', async (req, res) => {
  const {id} = req.params
  await Product.findByIdAndDelete({_id: id})

  res.redirect('/admin')
})




route.get('/view-product', async (req, res) => {
  const products = await Product.find();
  res.render('./manager/view-product', {layout: adminLayout, products});
});


module.exports = route;