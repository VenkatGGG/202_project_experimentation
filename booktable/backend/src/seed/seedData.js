const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Review = require('../models/Review');
const Booking = require('../models/Booking');

const users = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    password: 'Admin@123',
    phone: '1234567890',
    role: 'admin'
  },
  {
    firstName: 'John',
    lastName: 'Manager',
    email: 'restaurantmanager@example.com',
    password: 'Manager@123',
    phone: '1234567891',
    role: 'manager'
  },
  {
    firstName: 'Sarah',
    lastName: 'Manager',
    email: 'manager2@booktable.com',
    password: 'Manager@123',
    phone: '1234567892',
    role: 'manager'
  },
  {
    firstName: 'Alice',
    lastName: 'Customer',
    email: 'alice@example.com',
    password: 'Customer@123',
    phone: '1234567893',
    role: 'customer'
  },
  {
    firstName: 'Bob',
    lastName: 'Customer',
    email: 'bob@example.com',
    password: 'Customer@123',
    phone: '1234567894',
    role: 'customer'
  }
];

const restaurants = [
  {
    name: 'La Bella Italia',
    description: 'Authentic Italian cuisine in a romantic setting',
    cuisineType: 'Italian',
    costRating: 3,
    address: {
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105'
    },
    contactInfo: {
      phone: '415-555-0101',
      email: 'labella@example.com'
    },
    hours: {
      opening: '11:00',
      closing: '22:00'
    },
    capacity: 80,
    photos: [
      'https://202restaurantpictures.s3.us-east-2.amazonaws.com/restaurant_pictures/restaurant_1.jpg'
    ],
    availableTables: [
      {
        date: new Date('2025-05-15T00:00:00.000Z'),
        tables: [
          { tableId: new mongoose.Types.ObjectId(), tableSize: 2, availableTimes: ['18:00', '18:30', '20:00', '20:30'] },
          { tableId: new mongoose.Types.ObjectId(), tableSize: 4, availableTimes: ['19:00', '19:30', '21:00'] },
          { tableId: new mongoose.Types.ObjectId(), tableSize: 3, availableTimes: ['17:00', '17:30', '21:30'] }
        ]
      },
      {
        date: new Date('2025-05-16T00:00:00.000Z'),
        tables: [
          { tableId: new mongoose.Types.ObjectId(), tableSize: 2, availableTimes: ['17:30', '19:30', '20:00'] },
          { tableId: new mongoose.Types.ObjectId(), tableSize: 4, availableTimes: ['18:00', '20:30'] },
          { tableId: new mongoose.Types.ObjectId(), tableSize: 5, availableTimes: ['19:00', '21:00', '21:30'] }
        ]
      },
      {
        date: new Date('2025-05-13T00:00:00.000Z'),
        tables: [
          { tableId: new mongoose.Types.ObjectId(), tableSize: 2, availableTimes: ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'] },
          { tableId: new mongoose.Types.ObjectId(), tableSize: 3, availableTimes: ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'] },
          { tableId: new mongoose.Types.ObjectId(), tableSize: 4, availableTimes: ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30'] },
          { tableId: new mongoose.Types.ObjectId(), tableSize: 5, availableTimes: ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'] },
          { tableId: new mongoose.Types.ObjectId(), tableSize: 6, availableTimes: ['19:00', '19:30', '20:00', '20:30', '21:00', '21:30'] }
        ]
      }
    ]
  },
  {
    name: 'Sushi Master',
    description: 'Premium Japanese sushi and sashimi',
    cuisineType: 'Japanese',
    costRating: 4,
    address: {
      street: '456 Market St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105'
    },
    contactInfo: {
      phone: '415-555-0102',
      email: 'sushimaster@example.com'
    },
    hours: {
      opening: '12:00',
      closing: '23:00'
    },
    capacity: 60,
    photos: [
      'https://202restaurantpictures.s3.us-east-2.amazonaws.com/restaurant_pictures/restaurant_2.jpg'
    ],
    availableTables: [
      {
        date: new Date('2025-05-20T00:00:00.000Z'),
        tables: [
          { tableId: new mongoose.Types.ObjectId(), tableSize: 2, availableTimes: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'] },
          { tableId: new mongoose.Types.ObjectId(), tableSize: 4, availableTimes: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'] },
          { tableId: new mongoose.Types.ObjectId(), tableSize: 6, availableTimes: ['10:30', '11:30', '12:30', '17:30', '18:30', '19:30', '20:30', '21:30'] },
          { tableId: new mongoose.Types.ObjectId(), tableSize: 8, availableTimes: ['11:00', '12:00', '18:00', '19:00', '20:00', '21:00'] },
          { tableId: new mongoose.Types.ObjectId(), tableSize: 10, availableTimes: ['11:30', '12:30', '18:30', '19:30', '20:30'] },
          { tableId: new mongoose.Types.ObjectId(), tableSize: 15, availableTimes: ['12:00', '19:00', '20:00'] },
          { tableId: new mongoose.Types.ObjectId(), tableSize: 20, availableTimes: ['12:00', '19:30'] }
        ]
      }
    ]
  },
  {
    name: 'Taco Fiesta',
    description: 'Authentic Mexican street food',
    cuisineType: 'Mexican',
    costRating: 2,
    address: {
      street: '789 Mission St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105'
    },
    contactInfo: {
      phone: '415-555-0103',
      email: 'tacofiesta@example.com'
    },
    hours: {
      opening: '10:00',
      closing: '22:00'
    },
    capacity: 50,
    photos: [
      'https://202restaurantpictures.s3.us-east-2.amazonaws.com/restaurant_pictures/restaurant_3.jpg'
    ],
    availableTables: [
      {
        date: new Date('2025-05-20T00:00:00.000Z'),
        tables: [
          { tableId: new mongoose.Types.ObjectId(), tableSize: 2, availableTimes: ['10:00', '10:30', '11:00', '11:30', '12:00', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'] },
          { tableId: new mongoose.Types.ObjectId(), tableSize: 4, availableTimes: ['10:00', '10:30', '11:00', '11:30', '12:00', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'] },
          { tableId: new mongoose.Types.ObjectId(), tableSize: 5, availableTimes: ['10:30', '11:30', '17:30', '18:30', '19:30', '20:30'] },
          { tableId: new mongoose.Types.ObjectId(), tableSize: 7, availableTimes: ['11:00', '12:00', '18:00', '19:00', '20:00'] },
          { tableId: new mongoose.Types.ObjectId(), tableSize: 10, availableTimes: ['11:30', '18:30', '19:30'] },
          { tableId: new mongoose.Types.ObjectId(), tableSize: 16, availableTimes: ['12:00', '19:00'] },
          { tableId: new mongoose.Types.ObjectId(), tableSize: 18, availableTimes: ['12:00', '19:00'] }
        ]
      }
    ]
  },
  {
    name: 'The Golden Dragon',
    description: 'Traditional Chinese cuisine',
    cuisineType: 'Chinese',
    costRating: 2,
    address: {
      street: '101 Grant Ave',
      city: 'San Francisco',
      state: 'CA',
      zip: '94108'
    },
    contactInfo: {
      phone: '415-555-0104',
      email: 'goldendragon@example.com'
    },
    hours: {
      opening: '11:00',
      closing: '23:00'
    },
    capacity: 100,
    photos: [
      'https://202restaurantpictures.s3.us-east-2.amazonaws.com/restaurant_pictures/restaurant_4.jpg'
    ],
    availableTables: [
      {
        date: new Date('2025-05-20T00:00:00.000Z'),
        tables: [
          { tableId: new mongoose.Types.ObjectId(), tableSize: 2, availableTimes: ['11:00', '11:30', '12:00', '12:30', '13:00', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30'] },
          { tableId: new mongoose.Types.ObjectId(), tableSize: 4, availableTimes: ['11:00', '11:30', '12:00', '12:30', '13:00', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30'] },
          { tableId: new mongoose.Types.ObjectId(), tableSize: 6, availableTimes: ['11:30', '12:30', '17:30', '18:30', '19:30', '20:30', '21:30', '22:30'] },
          { tableId: new mongoose.Types.ObjectId(), tableSize: 8, availableTimes: ['12:00', '13:00', '18:00', '19:00', '20:00', '21:00', '22:00'] },
          { tableId: new mongoose.Types.ObjectId(), tableSize: 12, availableTimes: ['12:30', '18:30', '19:30', '20:30', '21:30'] },
          { tableId: new mongoose.Types.ObjectId(), tableSize: 18, availableTimes: ['12:00', '19:00', '20:00'] },
          { tableId: new mongoose.Types.ObjectId(), tableSize: 20, availableTimes: ['12:30', '19:30', '20:30'] }
        ]
      }
    ]
  },
  {
    name: 'Le Petit Bistro',
    description: 'Classic French cuisine in an intimate setting',
    cuisineType: 'French',
    costRating: 4,
    address: {
      street: '202 Powell St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94102'
    },
    contactInfo: {
      phone: '415-555-0105',
      email: 'lepetit@example.com'
    },
    hours: {
      opening: '17:00',
      closing: '23:00'
    },
    capacity: 40,
    photos: [
      'https://202restaurantpictures.s3.us-east-2.amazonaws.com/restaurant_pictures/restaurant_5.jpg'
    ],
    availableTables: [
      {
        date: new Date('2025-05-20T00:00:00.000Z'),
        tables: [
          { tableId: new mongoose.Types.ObjectId(), tableSize: 1, availableTimes: ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'] },
          { tableId: new mongoose.Types.ObjectId(), tableSize: 2, availableTimes: ['10:00', '10:30', '11:00', '11:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'] },
          { tableId: new mongoose.Types.ObjectId(), tableSize: 3, availableTimes: ['10:30', '11:30', '17:30', '18:30', '19:30', '20:30', '21:30'] },
          { tableId: new mongoose.Types.ObjectId(), tableSize: 4, availableTimes: ['10:00', '11:00', '12:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'] },
          { tableId: new mongoose.Types.ObjectId(), tableSize: 10, availableTimes: ['11:30', '18:30', '19:30', '20:30'] },
          { tableId: new mongoose.Types.ObjectId(), tableSize: 14, availableTimes: ['12:00', '19:00', '20:00'] },
          { tableId: new mongoose.Types.ObjectId(), tableSize: 19, availableTimes: ['12:00', '19:00'] }
        ]
      }
    ]
  },
  {
    name: 'Spice Route',
    description: 'Authentic Indian cuisine with modern twists',
    cuisineType: 'Indian',
    costRating: 3,
    address: {
      street: '303 Valencia St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94103'
    },
    contactInfo: {
      phone: '415-555-0106',
      email: 'spiceroute@example.com'
    },
    hours: {
      opening: '11:30',
      closing: '22:30'
    },
    capacity: 70,
    photos: [
      'https://202restaurantpictures.s3.us-east-2.amazonaws.com/restaurant_pictures/restaurant_6.jpg'
    ]
  },
  {
    name: 'Mediterranean Oasis',
    description: 'Fresh Mediterranean cuisine and mezze',
    cuisineType: 'Mediterranean',
    costRating: 3,
    address: {
      street: '404 Hayes St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94102'
    },
    contactInfo: {
      phone: '415-555-0107',
      email: 'medoasis@example.com'
    },
    hours: {
      opening: '11:00',
      closing: '22:00'
    },
    capacity: 60,
    photos: [
      'https://202restaurantpictures.s3.us-east-2.amazonaws.com/restaurant_pictures/restaurant_7.jpg'
    ]
  },
  {
    name: 'Seoul Kitchen',
    description: 'Modern Korean BBQ and traditional dishes',
    cuisineType: 'Korean',
    costRating: 3,
    address: {
      street: '505 Geary St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94102'
    },
    contactInfo: {
      phone: '415-555-0108',
      email: 'seoulkitchen@example.com'
    },
    hours: {
      opening: '12:00',
      closing: '23:00'
    },
    capacity: 80,
    photos: [
      'https://202restaurantpictures.s3.us-east-2.amazonaws.com/restaurant_pictures/restaurant_8.jpg'
    ]
  },
  {
    name: 'The Steakhouse',
    description: 'Premium steaks and fine wines',
    cuisineType: 'American',
    costRating: 4,
    address: {
      street: '606 Union St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94133'
    },
    contactInfo: {
      phone: '415-555-0114',
      email: 'steakhouse@example.com'
    },
    hours: {
      opening: '17:00',
      closing: '23:00'
    },
    capacity: 75,
    photos: [
      'https://202restaurantpictures.s3.us-east-2.amazonaws.com/restaurant_pictures/restaurant_9.jpg'
    ],
    isApproved: true,
    isPending: false,
    availableTables: [
      {
        date: new Date('2025-05-15T00:00:00.000Z'),
        tables: [
          { tableId: new mongoose.Types.ObjectId(), tableSize: 2, availableTimes: ['18:00', '18:30', '20:00', '20:30', '22:00'] },
          { tableId: new mongoose.Types.ObjectId(), tableSize: 4, availableTimes: ['19:00', '19:30', '21:00', '21:30'] },
          { tableId: new mongoose.Types.ObjectId(), tableSize: 6, availableTimes: ['17:00', '17:30', '22:30'] }
        ]
      },
      {
        date: new Date('2025-05-16T00:00:00.000Z'),
        tables: [
          { tableId: new mongoose.Types.ObjectId(), tableSize: 2, availableTimes: ['17:30', '19:30'] },
          { tableId: new mongoose.Types.ObjectId(), tableSize: 3, availableTimes: ['18:00', '20:30', '21:00'] },
          { tableId: new mongoose.Types.ObjectId(), tableSize: 4, availableTimes: ['19:00', '21:00'] },
          { tableId: new mongoose.Types.ObjectId(), tableSize: 5, availableTimes: ['20:00', '22:00'] }
        ]
      },
      {
        date: new Date('2025-05-13T00:00:00.000Z'),
        tables: [
          { tableId: new mongoose.Types.ObjectId(), tableSize: 2, availableTimes: ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00'] },
          { tableId: new mongoose.Types.ObjectId(), tableSize: 3, availableTimes: ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'] },
          { tableId: new mongoose.Types.ObjectId(), tableSize: 4, availableTimes: ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00'] },
          { tableId: new mongoose.Types.ObjectId(), tableSize: 5, availableTimes: ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'] },
          { tableId: new mongoose.Types.ObjectId(), tableSize: 6, availableTimes: ['19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30'] },
          { tableId: new mongoose.Types.ObjectId(), tableSize: 8, availableTimes: ['19:00', '19:30', '20:00', '20:30', '21:00'] }
        ]
      }
    ]
  },
  {
    name: 'Thai Orchid',
    description: 'Authentic Thai cuisine in a modern setting',
    cuisineType: 'Thai',
    costRating: 2,
    address: {
      street: '707 Fillmore St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94117'
    },
    contactInfo: {
      phone: '415-555-0110',
      email: 'thaiorchid@example.com'
    },
    hours: {
      opening: '11:00',
      closing: '22:00'
    },
    capacity: 55,
    photos: [
      'https://202restaurantpictures.s3.us-east-2.amazonaws.com/restaurant_pictures/restaurant_10.jpg'
    ]
  },
  {
    name: "Manager's Cafe",
    description: 'A cozy cafe perfect for quick bites and coffee.',
    cuisineType: 'Cafe',
    costRating: 2,
    address: {
      street: '789 University Ave',
      city: 'Palo Alto',
      state: 'CA',
      zip: '94301'
    },
    contactInfo: {
      phone: '650-555-0111',
      email: 'managers_cafe@example.com'
    },
    hours: {
      opening: '08:00',
      closing: '18:00'
    },
    capacity: 30,
    photos: [
      'https://202restaurantpictures.s3.us-east-2.amazonaws.com/restaurant_pictures/restaurant_1.jpg'
    ],
    isApproved: true,
    isPending: false
  },
  {
    name: "Captain's Table",
    description: 'Seafood restaurant with a nautical theme.',
    cuisineType: 'Seafood',
    costRating: 3,
    address: {
      street: '1 Ocean View',
      city: 'Santa Cruz',
      state: 'CA',
      zip: '95060'
    },
    contactInfo: {
      phone: '831-555-0112',
      email: 'captains_table@example.com'
    }, 
    hours: {
      opening: '12:00',
      closing: '22:00'
    },
    capacity: 70,
    photos: [
      'https://202restaurantpictures.s3.us-east-2.amazonaws.com/restaurant_pictures/restaurant_2.jpg'
    ],
    isApproved: true,
    isPending: false
  },
  {
    name: 'Santana Row Bistro',
    description: 'Modern American cuisine in an upscale setting',
    cuisineType: 'American',
    costRating: 4,
    address: {
      street: '377 Santana Row',
      city: 'San Jose',
      state: 'CA',
      zip: '95128'
    },
    contactInfo: {
      phone: '408-555-0101',
      email: 'santanarow@example.com'
    },
    hours: {
      opening: '11:00',
      closing: '23:00'
    },
    capacity: 90,
    photos: [
      'https://202restaurantpictures.s3.us-east-2.amazonaws.com/restaurant_pictures/restaurant_3.jpg'
    ]
  },
  {
    name: 'Japantown Sushi',
    description: 'Traditional Japanese sushi and sake bar',
    cuisineType: 'Japanese',
    costRating: 3,
    address: {
      street: '170 Jackson St',
      city: 'San Jose',
      state: 'CA',
      zip: '95112'
    },
    contactInfo: {
      phone: '408-555-0102',
      email: 'jtownsushi@example.com'
    },
    hours: {
      opening: '11:30',
      closing: '22:00'
    },
    capacity: 50,
    photos: [
      'https://202restaurantpictures.s3.us-east-2.amazonaws.com/restaurant_pictures/restaurant_4.jpg'
    ]
  },
  {
    name: 'Little Saigon Pho',
    description: 'Authentic Vietnamese pho and street food',
    cuisineType: 'Vietnamese',
    costRating: 2,
    address: {
      street: '969 Story Rd',
      city: 'San Jose',
      state: 'CA',
      zip: '95122'
    },
    contactInfo: {
      phone: '408-555-0103',
      email: 'littlesaigon@example.com'
    },
    hours: {
      opening: '10:00',
      closing: '21:00'
    },
    capacity: 60,
    photos: [
      'https://202restaurantpictures.s3.us-east-2.amazonaws.com/restaurant_pictures/restaurant_5.jpg'
    ]
  },
  {
    name: 'San Pedro Tapas',
    description: 'Spanish tapas and wine bar',
    cuisineType: 'Spanish',
    costRating: 3,
    address: {
      street: '163 W Santa Clara St',
      city: 'San Jose',
      state: 'CA',
      zip: '95113'
    },
    contactInfo: {
      phone: '408-555-0104',
      email: 'sanpedro@example.com'
    },
    hours: {
      opening: '16:00',
      closing: '23:00'
    },
    capacity: 70,
    photos: [
      'https://202restaurantpictures.s3.us-east-2.amazonaws.com/restaurant_pictures/restaurant_6.jpg'
    ]
  },
  {
    name: 'Downtown Curry House',
    description: 'Modern Indian cuisine with a twist',
    cuisineType: 'Indian',
    costRating: 3,
    address: {
      street: '98 S First St',
      city: 'San Jose',
      state: 'CA',
      zip: '95113'
    },
    contactInfo: {
      phone: '408-555-0105',
      email: 'curryhouse@example.com'
    },
    hours: {
      opening: '11:30',
      closing: '22:30'
    },
    capacity: 65,
    photos: [
      'https://202restaurantpictures.s3.us-east-2.amazonaws.com/restaurant_pictures/restaurant_7.jpg'
    ]
  },
  {
    name: 'Burger Bliss',
    description: 'Classic American burgers and shakes',
    cuisineType: 'American',
    costRating: 2,
    address: {
      street: '505 Embarcadero Rd',
      city: 'Palo Alto',
      state: 'CA',
      zip: '94301'
    },
    contactInfo: {
      phone: '650-555-0117',
      email: 'burgerbliss@example.com'
    },
    hours: {
      opening: '11:00',
      closing: '22:00'
    },
    capacity: 60,
    photos: [
      'https://202restaurantpictures.s3.us-east-2.amazonaws.com/restaurant_pictures/restaurant_8.jpg'
    ],
    isApproved: true,
    isPending: false
  },
  {
    name: 'Mediterranean Delights',
    description: 'Fresh and flavorful Mediterranean cuisine',
    cuisineType: 'Mediterranean',
    costRating: 3,
    address: {
      street: '404 Hayes St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94102'
    },
    contactInfo: {
      phone: '415-555-0118',
      email: 'mediterraneandelights@example.com'
    },
    hours: {
      opening: '11:00',
      closing: '22:00'
    },
    capacity: 70,
    photos: [
      'https://202restaurantpictures.s3.us-east-2.amazonaws.com/restaurant_pictures/restaurant_9.jpg'
    ],
    isApproved: true,
    isPending: false
  },
  {
    name: 'Green Leaf Cafe',
    description: 'Healthy, organic, and vegan-friendly options',
    cuisineType: 'Vegan',
    costRating: 2,
    address: {
      street: '707 Bryant St',
      city: 'Palo Alto',
      state: 'CA',
      zip: '94301'
    },
    contactInfo: {
      phone: '650-555-0119',
      email: 'greenleaf@example.com'
    },
    hours: {
      opening: '09:00',
      closing: '20:00'
    },
    capacity: 50,
    photos: [
      'https://202restaurantpictures.s3.us-east-2.amazonaws.com/restaurant_pictures/restaurant_10.jpg'
    ],
    isApproved: true,
    isPending: false
  }
];

let reviews = [];

const generateReviews = (usersArray, restaurantsArray) => {
  const reviews = [];
  const customerUsers = usersArray.filter(user => user.role === 'customer');
  
  restaurantsArray.forEach(restaurant => {
    customerUsers.forEach(user => {
      if (Math.random() > 0.3) { 
        reviews.push({
          userId: user._id,
          restaurantId: restaurant._id,
          rating: Math.floor(Math.random() * 3) + 3, 
          comment: [
            'Great experience! The food was delicious.',
            'Excellent service and atmosphere.',
            'Really enjoyed the food. Will come back again.',
            'Amazing flavors and presentation.',
            'Good food but service could be better.',
            'Lovely ambiance and tasty dishes.'
          ][Math.floor(Math.random() * 6)],
          reviewDate: new Date()
        });
      }
    });
  });
  
  return reviews;
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await Review.deleteMany({});
    await Booking.deleteMany({});

    const createdUsers = await User.create(users);
    console.log('Users seeded');

    const managerUsers = createdUsers.filter(user => user.role === 'manager');
    const createdRestaurants = await Promise.all(
      restaurants.map((restaurant, index) => {
        const manager = managerUsers[index % managerUsers.length];
        return Restaurant.create({
          ...restaurant,
          managerId: manager._id,
          approved: true
        });
      })
    );
    console.log('Restaurants seeded');

    const reviewObjectsToSeed = generateReviews(createdUsers, createdRestaurants);
    reviews = reviewObjectsToSeed; 

    await Review.insertMany(reviews);
    console.log('Reviews seeded');

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // If this script is run directly, it should manage its own connection lifecycle.
    // However, if imported, the importer should manage the connection.
    // For standalone execution (node src/seed/seedData.js):
    if (require.main === module) {
      await mongoose.disconnect(); 
      console.log('MongoDB disconnected (from seedData.js standalone execution)');
    }
  }
};

if (require.main === module) {
  (async () => {
    await seedDatabase(); // Call seedDatabase only when script is run directly
  })();
}

module.exports = { restaurants, users, reviews };
