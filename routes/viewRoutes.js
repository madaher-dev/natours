const express = require('express');
const viewsControler = require('../controlers/viewsControler');
const authControler = require('../controlers/authControler');

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

module.exports = router;
