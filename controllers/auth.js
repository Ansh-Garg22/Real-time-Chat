// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.renderSignupForm = function (req, res) {
  res.render('signup');
};

exports.renderLoginForm = function (req, res) {
  res.render('login');
};

exports.signup = async function (req, res, next) {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.redirect('/auth/login'); // Redirect to chat page after successful signup
  } catch (error) {
    next(error);
  }
};

exports.login = async function (req, res, next) {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Authentication failed' });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Authentication failed' });
    }
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      'your_secret_key',
      { expiresIn: '1h' }
    );
    // Set the token as a cookie
    res.cookie('authToken', token, { httpOnly: true });
    // Redirect to the chat room
    res.redirect('/chat');
  } catch (error) {
    next(error);
  }
};

exports.logout = function (req, res) {
  res.clearCookie('authToken');

  res.redirect('/auth/login');
};
