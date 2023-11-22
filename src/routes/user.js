const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const validators = require('../middleware/validators');
const checkAuth = require('../middleware/checkAuth');

router.post('/users', checkAuth.isAdminCheck, validators.createUser, userController.create);
router.get('/users', checkAuth.isAdminCheck, userController.readAll);
router.get('/users/:user_id', checkAuth.verifyToken, validators.readSingleUser, userController.readOne);
router.put('/users/:user_id', checkAuth.isAdminCheck, validators.updateUser, userController.update);
router.delete('/users/:user_id', checkAuth.isAdminCheck, validators.deleteOneUser, userController.deleteOne);
router.get('/users/datatable/fetch', checkAuth.isAdminCheck, userController.getForDataTable);

module.exports = router;