const express = require('express');
const userController = require('./../controllers/userControllers');
const authenticationController = require('./../controllers/authenticationControllers');

const router = express.Router();

router.post('/signup', authenticationController.signup);
router.post('/login', authenticationController.login);
// router.patch('/Update-Password', authenticationController.updatePassword);
router.post('/forgotPassword', authenticationController.forgotPassword);
router.patch('/resetPassword/:token', authenticationController.resetPassword);

router.patch(
  '/UpdateMyPassword',
  authenticationController.protect,
  authenticationController.updateUserPassword,
);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
