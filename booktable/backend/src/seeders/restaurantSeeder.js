const Restaurant = require('../models/Restaurant');
const mongoose = require('mongoose');
require('dotenv').config(); // Ensure environment variables are loaded
const { restaurants: seedDataRestaurants } = require('../seed/seedData'); // IMPORTED DATA

// Specific Manager ID for 'restaurantmanager@example.com'
const specificManagerId = new mongoose.Types.ObjectId('681fe63f8375a77ab70a1457');

// Generate a placeholder Manager ID (replace later if needed)
const placeholderManagerId = new mongoose.Types.ObjectId();

const seedRestaurants = async () => {
  // Map over the imported restaurants from seedData.js to ensure schema consistency
  const restaurantsToSeed = seedDataRestaurants.map(r => ({
    ...r, // Spread all properties from seedData restaurant object
    managerId: r.managerId || placeholderManagerId, // Use managerId from seedData if present, else placeholder
    isApproved: typeof r.isApproved === 'boolean' ? r.isApproved : true, // Default to true
    isPending: typeof r.isPending === 'boolean' ? r.isPending : false,   // Default to false
    photos: Array.isArray(r.photos) ? r.photos : (r.photos ? [r.photos] : ['default.jpg']), // Ensure photos is an array
    // Ensure other required fields have defaults if not in seedData
    address: r.address || { street: 'N/A', city: 'N/A', state: 'N/A', zip: 'N/A', country: 'USA' },
    cuisineType: r.cuisineType || 'Undefined',
    costRating: typeof r.costRating === 'number' ? r.costRating : 0,
    availableTables: Array.isArray(r.availableTables) ? r.availableTables : [],
    // Add any other fields from your Restaurant model that might need defaults
  }));

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      // useNewUrlParser: true, // Deprecated
      // useUnifiedTopology: true, // Deprecated
    });
    console.log('MongoDB connected for seeding...');

    await Restaurant.deleteMany({});
    console.log('Existing restaurants cleared.');

    await Restaurant.insertMany(restaurantsToSeed); // USE restaurantsToSeed
    console.log('Restaurants seeded successfully FROM SEEDDATA.JS'); // UPDATED LOG

  } catch (error) {
    console.error('Error seeding restaurants:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
};

// This function is just to centralize the call if needed elsewhere, or for direct script execution
const runSeeder = async () => {
  console.log('Starting restaurant seeder...');
  await seedRestaurants();
  console.log('Restaurant seeder finished.');
};

// Check if the script is run directly
if (require.main === module) {
  runSeeder();
} else {
  // This allows the seeder to be required and run programmatically if needed
  module.exports = runSeeder;
}