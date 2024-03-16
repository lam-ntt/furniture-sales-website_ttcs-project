const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrderItem',
    required: true
  }],
  createAt: {
    type: String,
    required: true 
  },
  shipTo: {
    type: String,
    required: true 
  },
  state: {
    type: String,
    required: 'Pending'
  }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

