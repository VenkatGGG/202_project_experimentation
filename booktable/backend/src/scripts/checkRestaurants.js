require('dotenv').config();
const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurant');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const checkRestaurants = async () => {
  try {
    const restaurants = await Restaurant.find();
    console.log('Total restaurants:', restaurants.length);
    console.log('Approved restaurants:', restaurants.filter(r => r.approved).length);
    console.log('Unapproved restaurants:', restaurants.filter(r => !r.approved).length);
    process.exit(0);
  } catch (error) {
    console.error('Error checking restaurants:', error);
    process.exit(1);
  }
};

checkRestaurants();
