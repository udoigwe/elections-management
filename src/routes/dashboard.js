const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const validators = require('../middleware/validators');
const checkAuth = require('../middleware/checkAuth');

router.get('/dashboard', checkAuth.verifyToken, dashboardController.dashboard);
router.get('/chart-data/:election_id', checkAuth.verifyToken, validators.getDashboardChartData, dashboardController.getPollsChartData);

module.exports = router;