const express = require('express');
const viewsControler = require('../controlers/viewsControler');

const router = express.Router();

router.get('/', viewsControler.getOverview);
router.get('/tour/:slug', viewsControler.getTour);

module.exports = router;
