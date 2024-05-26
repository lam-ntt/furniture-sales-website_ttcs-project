const mongoose = require('mongoose');

const responseSchema = mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createAt: {
    type: Date,
    default: Date.now
  }
});

const Response = mongoose.model('Response', responseSchema);

module.exports = Response;


// const mongoose = require('mongoose');

// const reviewSchema = mongoose.Schema({
//   clientId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   productId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Product',
//     required: true
//   },
//   rate: {
//     type: Number,
//     required: true
//   },
//   comment: {
//     type: String,
//     required: true
//   },
//   createAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// const Review = mongoose.model('Review', reviewSchema);

// module.exports = Review;

