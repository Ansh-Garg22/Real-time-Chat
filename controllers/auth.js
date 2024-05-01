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
    const { username, password, confirmPassword } = req.body;
    
    // Check if passwords match
    if (password !== confirmPassword) {
      const error = "Passwords do not match"; // Set error message
      return res.render('signup', { error }); // Render signup page with error message
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.redirect('/'); // Redirect to chat page after successful signup
  } catch (error) {
    next(error);
  }
};


exports.login = async function (req, res, next) {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      const error = "User not found"; // Set error message
      return res.render('login', { error }); // Render login page with error message
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      const error = "Incorrect password"; // Set error message
      return res.render('login', { error }); // Render login page with error message
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

  res.redirect('/');
};
