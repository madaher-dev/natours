const express = require('express');

const reviewController = require('../controlers/reviewControler');
const authControler = require('../controlers/authControler');

//Allow nested route with review to get tour id
const router = express.Router({ mergeParams: true });
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authControler.protect,
    authControler.restrictTo('user'),
    reviewController.createReview
  );

module.exports = router;
