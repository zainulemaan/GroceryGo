const mongoose = require('mongoose');
const Review = require('./../models/reviewsmodels');
const Product = require('./../models/productModels');
const User = require('./../models/Usermodels');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Filter = require('bad-words');

const filter = new Filter();
// Creating Reviews

exports.createReview = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { productId, rating, comment } = req.body;
  //   if (!mongoose.Types.ObjectId.isValid(userId)) {
  //     return next(new AppError('Invalid User ID', 400));
  //   }
  //   if (!mongoose.Types.ObjectId.isValid(productId)) {
  //     return next(new AppError('Invalid Product ID', 400));
  //   }

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Product Not Found'), 404);
  }

  const reviewAlreadyExist = await Review.findOne({
    user: userId,
    product: productId,
  });
  if (reviewAlreadyExist) {
    return next(new AppError('You have already reviewed this product', 400));
  }
  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return next(new AppError('Rating must be a number between 1 and 5', 400));
  }

  if (!comment || comment.length < 10 || comment.length > 1000) {
    return next(
      new AppError('Comment must be between 10 and 1000 characters', 400),
    );
  }

  if (filter.isProfane(comment)) {
    return next(
      new AppError('Inappropriate language detected in comment', 400),
    );
  }

  const newReview = new Review({
    user: userId,
    product: productId,
    rating,
    comment,
  });

  await newReview.save();
  res.status(201).json({
    status: 'succes',
    data: newReview,
  });
});

// Getting All Reviews
exports.getAllReveiws = catchAsync(async (req, res, next) => {
  const reviews = await Review.find();
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

// Getting One Review Based On Review ID
exports.getReview = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid review ID', 400));
  }

  const review = await Review.findById(id);

  if (!review) {
    return next(
      new AppError('There Is No Review Based On This ID.\nThanks!', 404),
    );
  }

  res.status(200).json({
    status: 'succes',
    data: {
      review,
    },
  });
});

// Getting Reviews By Users
exports.getReviewsByUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return next(new AppError('Invalid user ID', 400));
  }

  const reviews = await Review.find({ user: userId });
  if (reviews.length === 0) {
    return next(new AppError('No reviews found for this user', 404));
  }

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});
exports.getReviewsByProduct = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return next(new AppError('Inavlid product ID', 400));
  }
  const reviews = await Review.find({ product: productId });
  if (reviews.length === 0) {
    return next(new AppError('No reviews found for this user', 404));
  }

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

// Deleting Review
exports.deleteReview = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid review ID', 400));
  }

  const review = await Review.findByIdAndDelete(id);

  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
