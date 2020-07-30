const express = require('express');

const router = express.Router();

const userControler = require('../controlers/userControler');
const authControler = require('../controlers/authControler');

// Routes

router.post('/signup', authControler.signup);
router.post('/login', authControler.login);
router.post('/forgotPassword', authControler.forgotPassword);
router.patch('/resetPassword/:token', authControler.resetPassword);

// Protect all routes after this point
router.use(authControler.protect);

router.patch(
  '/updateMyPassword',

  authControler.updatePassword
);
router.get(
  '/me',

  userControler.getMe,
  userControler.getUser
);
router.patch('/updateMe', userControler.updateMe);
router.delete('/deleteMe', userControler.deleteMe);

// Restrict all routes after this point
router.use(authControler.restrictTo('admin'));

router.route('/').get(userControler.getAllUsers).post(userControler.addUser);
router
  .route('/:id')
  .get(userControler.getUser)
  .patch(userControler.updateUser)
  .delete(userControler.deleteUser);

module.exports = router;
