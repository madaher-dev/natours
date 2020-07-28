const express = require('express');

const router = express.Router();

const userControler = require('../controlers/userControler');
const authControler = require('../controlers/authControler');

// Routes

router.post('/signup', authControler.signup);
router.post('/login', authControler.login);
router.post('/forgotPassword', authControler.forgotPassword);
router.patch('/resetPassword/:token', authControler.resetPassword);
router.patch(
  '/updateMyPassword',
  authControler.protect,
  authControler.updatePassword
);
router.patch('/updateMe', authControler.protect, userControler.updateMe);
router.delete('/deleteMe', authControler.protect, userControler.deleteMe);

router.route('/').get(userControler.getAllUsers).post(userControler.addUser);
router
  .route('/:id')
  .get(userControler.getUser)
  .patch(userControler.updateUser)
  .delete(userControler.deleteUser);

module.exports = router;
