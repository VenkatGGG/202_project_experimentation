require('dotenv').config();
const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurant');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const approveAllRestaurants = async () => {
  try {
    const result = await Restaurant.updateMany(
      { approved: false },
      { $set: { approved: true } }
    );
    
    console.log(`Updated ${result.modifiedCount} restaurants`);
    process.exit(0);
  } catch (error) {
    console.error('Error approving restaurants:', error);
    process.exit(1);
  }
};

approveAllRestaurants();
