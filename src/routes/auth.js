const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validators = require('../middleware/validators');

router.post('/sign-up', validators.signUp, authController.signUp);
router.post('/login', validators.login, authController.login);

module.exports = router;