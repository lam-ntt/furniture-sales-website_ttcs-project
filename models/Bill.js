const mongoose = require('mongoose');

const billSchema = mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  addedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AddedProduct',
    required: true
  }],
  totalPrice: { // limit
    type: Number,
    require: true
  },
  note: {
    type: String,
  },
  updateAt: {
    type: Date,
    default: Date.now
  },
});

const Bill = mongoose.model('Bill', billSchema);

module.exports = Bill;

