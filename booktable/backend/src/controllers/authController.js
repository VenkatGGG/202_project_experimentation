const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  console.log('[REGISTER] Attempting to register user...'); 
  try {
    const { firstName, lastName, email, password, role } = req.body;
    console.log('[REGISTER] Request body:', { firstName, lastName, email, role }); 

    // Check if user already exists
    console.log(`[REGISTER] Checking if user exists: ${email}`); 
    let user = await User.findOne({ email });
    if (user) {
      console.log(`[REGISTER] User already exists: ${email}`); 
      return res.status(400).json({ message: 'User already exists' });
    }
    console.log(`[REGISTER] User does not exist, proceeding: ${email}`); 

    // Create new user instance
    user = new User({
      firstName,
      lastName,
      email,
      role: role || 'customer'
    });
    console.log('[REGISTER] New User instance created:', user.email); 

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();
    console.log('[REGISTER] User saved successfully:', user.email, 'ID:', user._id); 

    // Create and send JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    console.log('[REGISTER] JWT token created for:', user.email); 

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    console.log('[REGISTER] Sending success response for:', user.email); 
    res.status(201).json({
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('[REGISTER] Error during registration:', error.message, error.stack);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    console.log('Stored password hash:', user.password);
    const isMatch = await user.comparePassword(password);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create and send JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('Generated token for user:', email);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
};

// Temporary password reset (remove after use)
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error getting profile' });
  }
};
