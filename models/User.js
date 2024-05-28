const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  name: {  // length
    type: String,
    required: true
  },
  password: { // length
    type: String,
    required: true
  },
  email: { // format
    type: String,
    required: true,
    unique: true
  },
  phone: { // format
    type: String,
    required: true
  },
  address: { // maybe api
    type: String,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User