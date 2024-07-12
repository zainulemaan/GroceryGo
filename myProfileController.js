const Profile = require('../models/myProfileModels');
const User = require('./../models/Usermodels');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const WishList = require('./../models/wishListModel');

exports.getProfile = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  let wishlist = await WishList.findOne({ userId: userId });
  if (!wishlist) {
    wishlist = { items: [] };
  }
  console.log(wishlist);

  let profile = await Profile.findOne({ user: userId }).populate({
    path: 'wishlist',
    populate: {
      path: 'items.productId',
      model: 'Product',
    },
  });
  console.log('Profile before creation:', profile);
  if (!profile) {
    profile = await Profile.create({
      userid: userId,
      wishlist: [wishlist._id], // Link the fetched wishlist to the profile
    });
    console.log('Profile after creation:', profile); // Debugging: Check if profile is created correctly
  } else {
    // If profile exists, ensure wishlist is linked (in case it wasn't previously)
    if (!profile.wishlist.includes(wishlist._id)) {
      profile.wishlist.push(wishlist._id);
      await profile.save();
      console.log('Updated Profile with Wishlist:', profile); // Debugging: Check if profile is updated correctly
    }
  }

  profile = await Profile.findOne({ user: userId }).populate({
    path: 'wishlist',
    populate: {
      path: 'items.productId',
      model: 'Product',
      select: '_id',
    },
  });
  console.log('Final Profile:', profile);

  res.status(200).json({
    status: 'success',
    data: {
      profile,
      user: {
        name: user.name,
        email: user.email,
      },
    },
  });
});
