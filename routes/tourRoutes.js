const express = require('express');
const tourControler = require('../controlers/tourControler');
const authControler = require('../controlers/authControler');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// router.param('id', tourControler.checkId);

router.use('/:id/reviews/', reviewRouter);

// Routes
router
  .route('/monthly-plan/:year')
  .get(
    authControler.protect,
    authControler.restrictTo('admin', 'lead-guide', 'guide'),
    tourControler.getMonthlyPlan
  );
router.route('/tour-stats').get(tourControler.getTourStats);
router
  .route('/top-5-cheap')
  .get(tourControler.aliasTopTours, tourControler.getAllTours);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourControler.getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(tourControler.getDistances);

router
  .route('/')
  .get(tourControler.getAllTours)
  .post(
    authControler.protect,
    authControler.restrictTo('admin', 'lead-guide'),
    tourControler.createTour
  );
router
  .route('/:id')
  .get(tourControler.getTour)
  .patch(
    authControler.protect,
    authControler.restrictTo('admin', 'lead-guide'),
    tourControler.uploadTourImages,
    tourControler.resizeTourImages,
    tourControler.updateTour
  )
  .delete(
    authControler.protect,
    authControler.restrictTo('admin', 'lead-guide'),
    tourControler.deleteTour
  );

module.exports = router;
