const mongoose = require('mongoose')

const addedProductSchema = mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  state: { //enum: added, ordered, processing, delivering, received, canceled, reviewed
    type: String,
    default: 'Added'
  }, 
  rate: {
    type: Number,
  },
  comment: {
    type: String
  }
})

const AddedProduct = mongoose.model('AddedProduct', addedProductSchema)

module.exports = AddedProduct

