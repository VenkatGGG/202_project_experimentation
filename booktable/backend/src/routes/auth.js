const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { register, login, getProfile, resetPassword } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Temporary route for debugging
router.get('/check-user/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).select('-password');
    if (!user) {
      return res.status(404).json({ exists: false });
    }
    res.json({ 
      exists: true,
      user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/register', register);
router.post('/login', login);
router.get('/profile', auth, getProfile);
router.post('/reset-password', resetPassword);

module.exports = router;
