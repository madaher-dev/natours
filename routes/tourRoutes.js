const express = require('express');
const tourControler = require('../controlers/tourControler');
const authControler = require('../controlers/authControler');
const reviewRouter = require('../routes/reviewRoutes');

const router = express.Router();

// router.param('id', tourControler.checkId);

// router
//   .route('/:id/reviews')
//   .post(
//     authControler.protect,
//     authControler.restrictTo('user'),
//     reviewControler.createReview
//   );

router.use('/:id/reviews/', reviewRouter);

// Routes
router.route('/monthly-plan/:year').get(tourControler.getMonthlyPlan);
router.route('/tour-stats').get(tourControler.getTourStats);
router
  .route('/top-5-cheap')
  .get(tourControler.aliasTopTours, tourControler.getAllTours);
router
  .route('/')
  .get(authControler.protect, tourControler.getAllTours)
  .post(tourControler.createTour);
router
  .route('/:id')
  .get(tourControler.getTour)
  .patch(tourControler.updateTour)
  .delete(
    authControler.protect,
    authControler.restrictTo('admin', 'lead-guide'),
    tourControler.deleteTour
  );

module.exports = router;
