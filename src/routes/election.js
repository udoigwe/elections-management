const express = require('express');
const router = express.Router();
const electionController = require('../controllers/election.controller');
const validators = require('../middleware/validators');
const checkAuth = require('../middleware/checkAuth');

router.post('/elections', checkAuth.isAdminCheck, validators.createElection, electionController.create);
router.get('/elections', checkAuth.verifyToken, electionController.readAll);
router.get('/elections/:election_id', checkAuth.verifyToken, validators.readSingleElection, electionController.readOne);
router.put('/elections/:election_id', checkAuth.isAdminCheck, validators.updateElection, electionController.update);
router.delete('/elections/:election_id', checkAuth.isAdminCheck, validators.deleteElection, electionController.deleteOne);
router.get('/elections/datatable/fetch', checkAuth.isAdminCheck, electionController.getForDataTable);

module.exports = router;