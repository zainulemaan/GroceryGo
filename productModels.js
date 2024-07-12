const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A product must have a name'],
    unique: true,
    trim: true,
  },
  brand: {
    type: String,
    required: [true, 'A product must have a brand'],
  },
  price: {
    type: Number,
    required: [true, 'A product must have a price'],
  },
  description: {
    type: String,
    trim: true,
  },
  category: String,
  quantityAvailable: {
    type: Number,
    default: 0,
  },
  expiryDate: Date,
  discountPercentage: {
    type: Number,
    default: 0,
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    validate: {
      validator: function (value) {
        return value <= 5.0;
      },
      message: 'Ratings average cannot exceed 5.0',
    },
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  size: String,
  photo: {
    type: String,
    required: true,
  },
  // images: [String],
  // returnPolicy: String,
  // createdAt: {
  //   type: Date,
  //   default: Date.now(),
  //   select: false,
  // },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
