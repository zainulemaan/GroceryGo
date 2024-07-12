const mongoose = require('mongoose');

const myProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WishList',
    },
  ],
});

const Profile = mongoose.model('Profile', myProfileSchema);
module.exports = Profile;
