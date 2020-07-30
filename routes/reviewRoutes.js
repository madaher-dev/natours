const express = require('express');
const reviewController = require('../controlers/reviewControler');
const authControler = require('../controlers/authControler');

//Allow nested route with review to get tour id
const router = express.Router({ mergeParams: true });

// Protect all routes belwo this point
router.use(authControler.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authControler.restrictTo('user'),
    reviewController.setData,
    reviewController.createReview
  );
router
  .route('/:id')
  .get(reviewController.getReview)
  .delete(
    authControler.restrictTo('user', 'admin'),
    reviewController.deleteReview
  )
  .patch(
    authControler.restrictTo('user', 'admin'),
    reviewController.updateReview
  );

module.exports = router;
