const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurant');
require('dotenv').config();

// Sample addresses for restaurants
const sampleAddresses = [
  {
    street: '123 Main St',
    city: 'San Jose',
    state: 'CA',
    zip: '95112',
    country: 'USA'
  },
  {
    street: '456 Park Ave',
    city: 'San Francisco',
    state: 'CA',
    zip: '94102',
    country: 'USA'
  },
  {
    street: '789 Market St',
    city: 'San Jose',
    state: 'CA',
    zip: '95113',
    country: 'USA'
  },
  {
    street: '101 University Ave',
    city: 'Palo Alto',
    state: 'CA',
    zip: '94301',
    country: 'USA'
  },
  {
    street: '202 Castro St',
    city: 'Mountain View',
    state: 'CA',
    zip: '94041',
    country: 'USA'
  },
  {
    street: '303 Santana Row',
    city: 'San Jose',
    state: 'CA',
    zip: '95128',
    country: 'USA'
  }
];

// Function to get a random address from the sample list
const getRandomAddress = () => {
  const randomIndex = Math.floor(Math.random() * sampleAddresses.length);
  return sampleAddresses[randomIndex];
};

// Function to update all restaurants with address information
const updateRestaurantsWithAddresses = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for address seeding...');

    // Find all restaurants
    const restaurants = await Restaurant.find({});
    console.log(`Found ${restaurants.length} restaurants to update with addresses`);

    // Update each restaurant with an address if it doesn't have one
    let updatedCount = 0;
    for (const restaurant of restaurants) {
      if (!restaurant.address || !restaurant.address.street) {
        restaurant.address = getRandomAddress();
        await restaurant.save();
        updatedCount++;
      }
    }

    console.log(`Successfully updated ${updatedCount} restaurants with address information`);
  } catch (error) {
    console.error('Error updating restaurant addresses:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

// Run the seeder if this script is executed directly
if (require.main === module) {
  updateRestaurantsWithAddresses();
} else {
  // Export for use in other files
  module.exports = {
    updateRestaurantsWithAddresses
  };
}
