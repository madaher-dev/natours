const express = require('express');
const viewsControler = require('../controlers/viewsControler');
const authControler = require('../controlers/authControler');

const router = express.Router();

router.use(authControler.isAuthenticated);
router.get('/', viewsControler.getOverview);
router.get('/tour/:slug', viewsControler.getTour);
router.get('/login', viewsControler.getLoginForm);

module.exports = router;
