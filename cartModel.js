const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        refrence: 'Product',
        required: true,
      },
      productName: {
        type: String,
        required: true,
      },
      productPrice: {
        type: Number,
        required: true,
      },
      productQuantity: {
        type: Number,
        required: true,
      },
    },
  ],
  TotalDiscount: {
    type: Number,
    validate: {
      validator: Number.isFinite,
      message: '{VALUE} is not a valid number for TotalDiscount',
    },
    default: 0,
  },
  subTotal: {
    type: Number,
    required: true,
    validate: {
      validator: Number.isFinite,
      message: '{VALUE} is not a valid number for subTotal',
    },
    default: 0,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
