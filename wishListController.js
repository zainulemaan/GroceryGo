const WishList = require('./../models/wishListModel');
const AppError = require('./../utils/appError');
const Product = require('./../models/productModels');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/Usermodels');

exports.createWishList = catchAsync(async (req, res, next) => {
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
    return next(
      new AppError(
        'Not Enogh Stock Avaialable.\nWe Will Let You Know If we Have This Later.\nThanks!',
        400,
      ),
    );
  }

  let wishList = await WishList.findOne({ userId }).populate('items.productId');
  if (!wishList) {
    wishList = new WishList({
      userId,
      items: [],
    });
  }
  const WishListItem = wishList.items.find(
    (item) => item.productId.toString() === productId,
  );
  if (WishListItem) {
    WishListItem.productQuantity += productQuantity;
  } else {
    wishList.items.push({
      productId: product._id,
      productName: product.name,
      productPrice: product.price,
      productQuantity,
    });
  }
  await wishList.save();
  const populatedWishList = await WishList.findById(wishList._id).populate({
    path: 'items.productId',
    model: 'Product',
    select: '_id',
  });

  res.status(200).json({
    status: 'success',
    data: populatedWishList,
  });
});

exports.getWishList = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const wishList = await WishList.findOne({ userId });
  if (!wishList) {
    return next(new AppError('Cart Not Found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: wishList,
  });
});
