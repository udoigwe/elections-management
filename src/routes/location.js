const express = require('express');
const router = express.Router();
const locationController = require('../controllers/location.controller');

router.get('/states', locationController.getAllStates);
router.get('/local-governments', locationController.getLocalGovernments);
router.get('/wards', locationController.getWards);
router.get('/polling-units', locationController.getPollingUnits);

module.exports = router;