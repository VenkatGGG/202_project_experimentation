require('dotenv').config();
const mongoose = require('mongoose');
const moment = require('moment');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI;

const predefinedRestaurantImages = Array.from({ length: 10 }, (_, i) => `/restaurant_pictures/restaurant_${i + 1}.jpg`);

const getRandomImage = () => predefinedRestaurantImages[Math.floor(Math.random() * predefinedRestaurantImages.length)];

// Helper function to generate available times for a day
const generateAvailableTimes = (openingHour, closingHour) => {
  const times = [];
  let currentTime = moment().hour(openingHour).minute(0);
  const endTime = moment().hour(closingHour).minute(0);

  while (currentTime.isBefore(endTime)) {
    // Add some randomness: 50% chance to include a time slot
    if (Math.random() < 0.7) { // Increased density for more options
      times.push(currentTime.format('HH:mm'));
    }
    currentTime.add(30, 'minutes');
  }
  return times;
};

// Helper function to generate available tables for a restaurant for a period
const generateRestaurantAvailability = (days, openingHour = 17, closingHour = 22) => {
  const availability = [];
  const tableSizes = [2, 4, 6, 8];

  for (let i = 0; i < days; i++) {
    const date = moment().add(i, 'days').toDate();
    const tablesForDay = [];

    tableSizes.forEach(size => {
      // Vary if tables of this size are offered on a given day
      if (Math.random() < 0.8) { // 80% chance to offer this table size
        const availableTimes = generateAvailableTimes(openingHour, closingHour);
        if (availableTimes.length > 0) {
          tablesForDay.push({
            tableSize: size,
            availableTimes: availableTimes,
          });
        }
      }
    });

    if (tablesForDay.length > 0) {
      availability.push({
        date,
        tables: tablesForDay,
      });
    }
  }
  return availability;
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI, { });
    console.log('MongoDB connected for seeding detailed restaurants...');

    const managerUser = await User.findOne({ email: 'restaurantmanager@example.com' });
    if (!managerUser) {
      console.error('Manager user (restaurantmanager@example.com) not found. Please create this user first.');
      return;
    }
    const managerId = managerUser._id;

    console.log(`Using manager ID: ${managerId}`);

    // --- Define Restaurants to be Pending Approval (for Admin Dashboard) ---
    const pendingRestaurantsData = [
      {
        name: 'The Gourmet Nook (Pending)',
        description: 'A cozy spot awaiting your approval to delight customers with exquisite dishes.',
        cuisineType: 'French',
        costRating: 4,
        address: { street: '101 Pending Ln', city: 'Approvalville', state: 'CA', zip: '90211' },
        contactInfo: { phone: '555-0101', email: 'pending1@example.com' },
        hours: { opening: '18:00', closing: '23:00' },
        capacity: 30,
        photos: [getRandomImage()],
        managerId: managerId,
        // isApproved: false, isPending: true (defaults from model)
      },
      {
        name: 'Spice Route Test (Pending)',
        description: 'Authentic Indian flavors ready to go live once approved.',
        cuisineType: 'Indian',
        costRating: 2,
        address: { street: '202 Test St', city: 'Approvalville', state: 'CA', zip: '90212' },
        contactInfo: { phone: '555-0102', email: 'pending2@example.com' },
        hours: { opening: '12:00', closing: '22:00' },
        capacity: 60,
        photos: [getRandomImage()],
        managerId: managerId,
      },
    ];

    // --- Define Approved Restaurants with Availability (for Customer View) ---
    const daysUntilEndOfMonth = moment().endOf('month').diff(moment(), 'days') + 1;

    const approvedRestaurantsData = [
      {
        name: 'The Daily Feast',
        description: 'Farm-to-table goodness, serving fresh meals daily.',
        cuisineType: 'American',
        costRating: 3,
        address: { street: '123 Main St', city: 'Foodie City', state: 'CA', zip: '90210' },
        contactInfo: { phone: '555-1234', email: 'dailyfeast@example.com' },
        hours: { opening: '17:00', closing: '22:00' },
        capacity: 70,
        photos: [getRandomImage()],
        managerId: managerId,
        isApproved: true, 
        isPending: false,
        availableTables: generateRestaurantAvailability(daysUntilEndOfMonth, 17, 22),
      },
      {
        name: 'Ocean Blue Grill',
        description: 'Fresh seafood with a stunning ocean view.',
        cuisineType: 'Mediterranean',
        costRating: 4,
        address: { street: '456 Ocean Ave', city: 'Foodie City', state: 'CA', zip: '90210' },
        contactInfo: { phone: '555-5678', email: 'oceanblue@example.com' },
        hours: { opening: '16:00', closing: '21:00' },
        capacity: 90,
        photos: [getRandomImage()],
        managerId: managerId,
        isApproved: true, 
        isPending: false,
        availableTables: generateRestaurantAvailability(daysUntilEndOfMonth, 16, 21),
      },
      {
        name: 'Pasta Paradise',
        description: 'Authentic Italian pasta dishes, a true taste of Italy.',
        cuisineType: 'Italian',
        costRating: 2,
        address: { street: '789 Pasta Pl', city: 'Foodie City', state: 'CA', zip: '90210' },
        contactInfo: { phone: '555-9012', email: 'pasta@example.com' },
        hours: { opening: '11:00', closing: '23:00' },
        capacity: 120,
        photos: [getRandomImage()],
        managerId: managerId,
        isApproved: true, 
        isPending: false,
        availableTables: generateRestaurantAvailability(daysUntilEndOfMonth, 11, 23),
      },
    ];

    // Clear existing restaurants with these specific names to avoid duplicates on re-run
    const allRestaurantNames = [
      ...pendingRestaurantsData.map(r => r.name),
      ...approvedRestaurantsData.map(r => r.name)
    ];
    await Restaurant.deleteMany({ name: { $in: allRestaurantNames } });
    console.log('Cleared existing sample restaurants with the same names.');

    // Insert new restaurants
    const pendingRestaurants = await Restaurant.insertMany(pendingRestaurantsData);
    console.log(`${pendingRestaurants.length} pending restaurants seeded.`);

    const approvedRestaurants = await Restaurant.insertMany(approvedRestaurantsData);
    console.log(`${approvedRestaurants.length} approved restaurants with availability seeded.`);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
};

seedDatabase();
