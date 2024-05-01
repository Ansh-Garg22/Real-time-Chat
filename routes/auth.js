const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

router.get('/signup', authController.renderSignupForm);
router.get('/', authController.renderLoginForm);
router.post('/signup', authController.signup);
router.post('/', authController.login);
router.get('/logout', authController.logout);

module.exports = router;
