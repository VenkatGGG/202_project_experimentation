const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');

const usersToManage = [
  {
    firstName: 'Restaurant',
    lastName: 'Manager',
    email: 'restaurantmanager@example.com',
    password: 'Manager@123',
    role: 'manager'
  },
  {
    firstName: 'Site',
    lastName: 'Admin',
    email: 'admin@example.com',
    password: 'Admin@123',
    role: 'admin'
  }
];

const manageUsers = async () => {
  try {
    console.log('Attempting to load MONGODB_URI from .env...');
    const mongoUri = process.env.MONGODB_URI;
    console.log('Loaded MONGODB_URI:', mongoUri);
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in .env file or not loaded correctly.');
    }
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected for user management...');

    for (const userData of usersToManage) {
      console.log(`\nProcessing user: ${userData.email}`);
      const userToCreateData = { ...userData };

      // If the user is a manager, find a restaurant to assign
      if (userToCreateData.role === 'manager') {
        const firstRestaurant = await Restaurant.findOne().sort({ createdAt: 1 });
        if (firstRestaurant) {
          userToCreateData.managedRestaurant = firstRestaurant._id;
          console.log(`Assigning restaurant ${firstRestaurant.name} (ID: ${firstRestaurant._id}) to manager ${userToCreateData.email}`);
        } else {
          console.warn(`Warning: No restaurants found in the database. Manager ${userToCreateData.email} will not be assigned a restaurant. This might cause issues if 'managedRestaurant' is required.`);
        }
      }

      const deleteResult = await User.deleteOne({ email: userToCreateData.email });
      if (deleteResult.deletedCount > 0) {
        console.log(`Successfully deleted existing user: ${userToCreateData.email}`);
      } else {
        console.log(`No existing user found with email: ${userToCreateData.email}. Proceeding to create.`);
      }
      const newUser = new User(userToCreateData);
      await newUser.save();
      console.log(`Successfully created new user: ${newUser.email} with ID: ${newUser._id} and role: ${newUser.role}`);
      if (newUser.role === 'manager' && newUser.managedRestaurant) {
        console.log(`Manager ${newUser.email} is managing restaurant ID: ${newUser.managedRestaurant}`);
      }
      console.log('Password has been hashed by the model.');
    }
  } catch (error) {
    console.error('Error managing users:', error.message);
    if (error.stack) {
        console.error(error.stack);
    }
  } finally {
    if (mongoose.connection.readyState === 1) { // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
        await mongoose.disconnect();
        console.log('MongoDB disconnected.');
    } else {
        console.log('MongoDB was not connected, no need to disconnect.');
    }
  }
};

manageUsers();
