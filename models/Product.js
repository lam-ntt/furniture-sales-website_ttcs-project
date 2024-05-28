const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  size: { // length 3
    length: {
      type: Number,
      required: true
    },
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    }
  },
  color: { // enum
    type: String,
    required: true
  },
  category: { // enum
    type: String, 
    required: true
  },
  description: {
    type: String,
    required: true
  },
  oldPrice: {
    type: Number,
    required: true
  },
  newPrice: {
    type: Number,
    required: true
  },
  totalNumber: {
    type: Number,
    required: true
  },
  soldNumber: {
    type: Number,
    default: 0
  },
  rate: {
    type: Number,
    default: 0
  },
  updateAt: {
    type: Date,
    default: Date.now
  }
})

const Product = mongoose.model('Product', productSchema)

module.exports = Product

