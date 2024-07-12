const Cart = require('./../models/cartModel');
const AppError = require('./../utils/appError');
const Product = require('./../models/productModels');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/Usermodels');

const calculateDiscountedPrice = (price, discountPercentage) => {
  if (isNaN(price) || isNaN(discountPercentage)) {
    throw new Error('Invalid price or discountPercentage');
  }

  const discountMultiplier = (100 - discountPercentage) / 100;
  return price * discountMultiplier;
};

// const calculateDiscountedPrice = (price, discountPercentage) => {
//   const discountMultiplier = (100 - discountPercentage) / 100;
//   return price * discountMultiplier;
// };

exports.addItemToCart = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { productId, productQuantity } = req.body;
  if (!productId || !productQuantity) {
    return res.status(400).json({
      status: 'fail',
      message: 'All product details must be provided',
    });
  }
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      status: 'fail',
      message: 'Product not found',
    });
  }
  if (product.quantityAvailable < productQuantity) {
    return next(new AppError('Not Enogh Stock Avaialable.\nThanks!', 400));
  }

  let cart = await Cart.findOne({ userId }).populate('items.productId');
  if (!cart) {
    // Create a new cart if it doesn't exist
    cart = new Cart({
      userId,
      items: [],
      subTotal: 0,
      TotalDiscount: 0,
    });
  }
  const cartItem = cart.items.find(
    (item) => item.productId.toString() === productId,
  );
  if (cartItem) {
    cartItem.productQuantity += productQuantity;
  } else {
    cart.items.push({
      productId: product._id,
      productName: product.name,
      productPrice: product.price,
      productQuantity,
      discountPercentage: product.discountPercentage,
    });
  }
  cart.subTotal = cart.items.reduce((total, item) => {
    const productPrice = calculateDiscountedPrice(
      item.productPrice,
      product.discountPercentage,
    );
    return total + productPrice * item.productQuantity;
  }, 0);

  cart.TotalDiscount = cart.items.reduce((totalDiscount, item) => {
    const originalPrice = item.productPrice * item.productQuantity;
    const discountedPrice =
      calculateDiscountedPrice(item.productPrice, product.discountPercentage) *
      item.productQuantity;
    return totalDiscount + (originalPrice - discountedPrice);
  }, 0);
  await cart.save();

  res.status(200).json({
    status: 'success',
    data: cart,
  });
});

// Removing Item From Cart
exports.emptyCart = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { productId } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User Not Found', 404));
  }
  console.log(user);

  const cart = await Cart.findOne({ userId }).populate('items.productId');
  if (!cart) {
    return next(new AppError('Cart Not Found', 404));
  }
  console.log(cart);
  cart.items = cart.items.filter(
    (item) => item.productId && item.productId.toString() !== productId,
  );

  cart.subTotal = cart.items.reduce((total, item) => {
    const productPrice = calculateDiscountedPrice(
      item.productPrice,
      item.discountPercentage,
    );
    return total + productPrice * item.productQuantity;
  }, 0);

  cart.TotalDiscount = cart.items.reduce((totalDiscount, item) => {
    const originalPrice = item.productPrice * item.productQuantity;
    const discountedPrice =
      calculateDiscountedPrice(item.productPrice, item.discountPercentage) *
      item.productQuantity;
    return totalDiscount + (originalPrice - discountedPrice);
  }, 0);

  if (cart.items.length === 0) {
    cart.subTotal = 0;
    cart.TotalDiscount = 0;
  }
  try {
    await cart.save();

    res.status(200).json({
      status: 'success',
      data: cart,
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
});

exports.updateItemQuantity = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { productId, productQuantity } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User Not Found', 404));
  }

  if (!productId || !productQuantity) {
    return next(
      new AppError(
        'Please provide all details: userId, productId, productQuantity',
        400,
      ),
    );
  }
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  if (product.quantityAvailable < productQuantity) {
    return next(new AppError('Not enough stock available', 400));
  }

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  const cartItem = cart.items.find(
    (item) => item.productId.toString() === productId,
  );

  if (cartItem) {
    cartItem.productQuantity = productQuantity;
    cartItem.discountPercentage = product.discountPercentage;
  } else {
    return next(new AppError('Product not found in cart', 404));
  }

  cart.subTotal = cart.items.reduce((total, item) => {
    const discountPercentage = item.discountPercentage || 0;
    if (isNaN(item.productPrice) || isNaN(discountPercentage)) {
      throw new Error('Invalid product price or discount percentage');
    }
    const productPrice = calculateDiscountedPrice(
      item.productPrice,
      discountPercentage,
    );
    return total + productPrice * item.productQuantity;
  }, 0);

  cart.TotalDiscount = cart.items.reduce((totalDiscount, item) => {
    const discountPercentage = item.discountPercentage || 0;
    const originalPrice = item.productPrice * item.productQuantity;
    const discountedPrice =
      calculateDiscountedPrice(item.productPrice, discountPercentage) *
      item.productQuantity;
    return totalDiscount + (originalPrice - discountedPrice);
  }, 0);

  console.log('TotalDiscount:', cart.TotalDiscount);

  await cart.save();
  res.status(200).json({
    status: 'success',
    data: cart,
  });
});

exports.getCart = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    return next(new AppError('Cart Not Found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: cart,
  });
});
