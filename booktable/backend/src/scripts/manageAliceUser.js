const path = require('path'); // Import path module
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') }); // Use path.resolve

console.log('Attempting to load MONGODB_URI from .env...');
console.log('Loaded MONGODB_URI:', process.env.MONGODB_URI); // Log the loaded URI

const mongoose = require('mongoose');
const User = require('../models/User'); // Adjust path to User model

const manageAlice = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI); // Corrected to MONGODB_URI
    console.log('MongoDB connected for user management...');

    const userEmail = 'alice@example.com';
    const userData = {
      firstName: 'Alice',
      lastName: 'Customer', // Using 'Customer' as last name
      email: userEmail,
      password: 'Customer@123', // Plain password, will be hashed by pre-save hook
      role: 'customer'
    };

    // Attempt to delete existing user
    const deleteResult = await User.deleteOne({ email: userEmail });
    if (deleteResult.deletedCount > 0) {
      console.log(`Successfully deleted existing user: ${userEmail}`);
    } else {
      console.log(`No existing user found with email: ${userEmail}. Proceeding to create.`);
    }

    // Create new user
    const newUser = new User(userData);
    await newUser.save(); // pre-save hook in User model will hash the password
    console.log(`Successfully created new user: ${newUser.email} with ID: ${newUser._id}`);
    console.log('Password has been hashed by the model.');

  } catch (error) {
    console.error('Error managing Alice user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
};

manageAlice();
