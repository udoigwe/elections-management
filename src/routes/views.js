const express = require('express');
const router = express.Router();
const viewsController = require('../controllers/views.controller');

router.get('/', viewsController.home);
router.get('/signin', viewsController.signin);
router.get('/register', viewsController.register);

/* Admin Routes */
router.get('/admin/dashboard', viewsController.adminDashboard);
router.get('/admin/users', viewsController.users);
router.get('/admin/elections', viewsController.elections);
router.get('/admin/candidates', viewsController.candidates);
router.get('/admin/score-sheet', viewsController.scoreSheet);
router.get('/admin/polls', viewsController.polls);

/* Observer Routes */
router.get('/observer/dashboard', viewsController.observerDashboard);
router.get('/observer/score-sheet', viewsController.observerScoreSheet);
router.get('/observer/polls', viewsController.observerPolls);

/* Visitor Routes */
router.get('/visitor/dashboard', viewsController.visitorDashboard);
router.get('/visitor/polls', viewsController.visitorPolls);

module.exports = router;