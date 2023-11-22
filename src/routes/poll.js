const express = require('express');
const router = express.Router();
const pollController = require('../controllers/poll.controller');
const validators = require('../middleware/validators');
const checkAuth = require('../middleware/checkAuth');

router.post('/polls', checkAuth.verifyToken, validators.submitScoreSheet, pollController.submitPolls);
router.get('/polls/datatable/fetch', checkAuth.verifyToken, pollController.getPollsForDataTable);
router.get('/polls/score-sheet/:election_id/:polling_station_id', checkAuth.verifyToken, validators.getScoreSheet, pollController.getScoreSheetForDataTable);

module.exports = router;