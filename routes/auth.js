const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

router.get('/signup', authController.renderSignupForm);
router.get('/login', authController.renderLoginForm);
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

module.exports = router;
