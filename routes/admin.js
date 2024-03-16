const express = require('express');
const route = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const Product = require('../models/Product');

const FILE_TYPE_MAP = {
  'image/png': 'png',
  'image/jpg': 'jpg',
  'image/imeg': 'imeg'
};

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
    const fileName = file.originalname.split(' ').join('-');
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null,`${fileName.slice(0, fileName.length - 4)}-${Math.random()*1e10}.${extension}`);
  }
});

const upload = multer({ storage: storage });

route.post('/', upload.single('image'), async (req, res) => {
  
  const fileName = req.file.filename;
  const basePath = `${req.protocol}://${req.get('host')}/public/uploads`;

  let product = new Product({
    name: req.body.name,
    image: `${basePath}/${fileName}`,
    size: req.body.size,
    color: req.body.color,
    category: req.body.category,
    description: req.body.description,
    oldPrice: req.body.oldPrice,
    newPrice: req.body.newPrice,
    totalNumber: req.body.totalNumber
  });

  product = await product.save();
  if(!product){
    res.status(500).send('Product cant be created.')
  }

  res.send(product);
});

route.put('/:id', upload.single('image'), async (req, res) => {
  if(!mongoose.isValidObjectId(req.params.id)){
    res.status(404).send('Product doesnt exist.')
  }
  
  const fileName = req.file.filename;
  const basePath = `${req.protocol}://${req.get('host')}/public/uploads`;

  let product = new Product.findByIdAndUpdate({
    name: req.body.name,
    image: `${basePath}/${fileName}`,
    size: req.body.size,
    color: req.body.color,
    category: req.body.category,
    description: req.body.description,
    oldPrice: req.body.oldPrice,
    newPrice: req.body.newPrice,
    totalNumber: req.body.totalNumber
  });

  product = await product.save();
  if(!product){
    res.status(500).send('Product cant be updated.')
  }

  res.send(product);
});

route.get('/', async (req, res) => {
  const products = await Product.find();
  res.send(products);
});


module.exports = route;