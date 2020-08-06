const express = require('express');
const viewsControler = require('../controlers/viewsControler');
const authControler = require('../controlers/authControler');
const bookingController = require('../controlers/bookingControler');

const router = express.Router();

router.get('/', authControler.isAuthenticated, viewsControler.getOverview);
router.get(
  '/tour/:slug',
  authControler.isAuthenticated,
  viewsControler.getTour
);
router.get(
  '/login',
  authControler.isAuthenticated,
  viewsControler.getLoginForm
);
router.get('/me', authControler.protect, viewsControler.getAccount);

router.post(
  '/submit-user-data',
  authControler.protect,
  viewsControler.updateUserData
);

router.get(
  '/my-tours',
  bookingController.createBookingCheckout,
  authControler.protect,
  viewsControler.getTour
);

module.exports = router;
