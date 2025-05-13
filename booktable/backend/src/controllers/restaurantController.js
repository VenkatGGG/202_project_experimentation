const Restaurant = require('../models/Restaurant');
const mongoose = require('mongoose'); // Import mongoose for ObjectId
const moment = require('moment'); // Ensure moment is required
const multer = require('multer');
const AWS = require('aws-sdk');
const path = require('path');

// Configure AWS S3
// Ensure your AWS credentials and region are set in your .env file or environment
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Corrected from AWS_SECRET_ACCESS_KEY_ID
  region: process.env.AWS_REGION
});

// Configure Multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory as buffers

const fileFilter = (req, file, cb) => {
  // Accept images only
  const filetypes = /jpeg|jpg|png|gif/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Error: File upload only supports the following filetypes - ' + filetypes + ' (Received: ' + file.mimetype + ')'));
};

exports.upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  fileFilter: fileFilter
});

// Helper stages to add review calculations and manager details
const addReviewAndManagerInfoStages = [
  {
    $lookup: { // Lookup reviews for the restaurant
      from: 'reviews', // Name of the reviews collection
      localField: '_id',
      foreignField: 'restaurantId',
      as: 'reviewObjects'
    }
  },
  {
    $addFields: { // Calculate average rating and review count
      averageRating: { $ifNull: [{ $avg: '$reviewObjects.rating' }, 0] }, // Default to 0 if no reviews
      reviewCount: { $size: '$reviewObjects' }
    }
  },
  {
    $lookup: { // Lookup manager details
      from: 'users', // Name of the users collection
      localField: 'managerId', // The ObjectId field in the restaurants collection
      foreignField: '_id',
      as: 'managerDocs'
    }
  },
  {
    $addFields: { // Create a 'manager' object with selected fields, similar to populate
      manager: {
        $let: {
          vars: { managerDoc: { $arrayElemAt: ['$managerDocs', 0] } },
          in: {
            $cond: { // Handle if manager is not found
              if: { $eq: ['$$managerDoc', null] },
              then: null,
              else: {
                firstName: '$$managerDoc.firstName',
                lastName: '$$managerDoc.lastName'
              }
            }
          }
        }
      }
    }
  },
  {
    $project: { // Clean up temporary fields
      reviewObjects: 0, // Don't return the full array of review documents
      managerDocs: 0    // Don't return the full array of manager documents
    }
  }
];

exports.createRestaurant = async (req, res) => {
  try {
    const {
      name,
      description,
      cuisineType,
      costRating,
      // Address fields will be like req.body['address[street]']
      // Hours fields will be like req.body['hours[opening]']
      // Contact info fields if sent
    } = req.body;

    const address = {
      street: req.body['address[street]'],
      city: req.body['address[city]'],
      state: req.body['address[state]'],
      zipCode: req.body['address[zipCode]'], // Assuming frontend sends zipCode not zip
    };

    const hours = {
      openingTime: req.body['hours[opening]'], // Match frontend keys
      closingTime: req.body['hours[closing]'],
    };
    
    // Example for contactInfo if you add it
    // const contactInfo = {
    //   phone: req.body['contactInfo[phone]'],
    //   email: req.body['contactInfo[email]'],
    //   website: req.body['contactInfo[website]']
    // };

    let photoUrl = ''; // Default in case no photo is uploaded or an error occurs

    if (req.file) {
      const file = req.file;
      const timestamp = Date.now();
      // Sanitize filename if necessary, or use a UUID
      const s3FileName = `restaurant_pictures/${timestamp}_${path.basename(file.originalname.replace(/\s+/g, '_'))}`;

      const params = {
        Bucket: process.env.S3_BUCKET_NAME, // Ensure this is in your .env
        Key: s3FileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        // ACL: 'public-read', // Optional: if you want files to be publicly accessible directly via S3 URL
      };

      const s3UploadResult = await s3.upload(params).promise();
      photoUrl = s3UploadResult.Location;
    } else {
      // Decide if a photo is mandatory. If so, return an error.
      // For now, we allow creation without a photo, photoUrl will be empty.
      // You might want to return res.status(400).json({ message: 'Restaurant photo is required.' });
    }

    const newRestaurantData = {
      name,
      description,
      cuisineType,
      costRating,
      address,
      hours,
      // contactInfo, // if implemented
      managerId: req.user._id, // From auth middleware
      photos: photoUrl ? [photoUrl] : [], // Store S3 URL in photos array
      isApproved: false, // Restaurants start as not approved
      isPending: true,   // And are pending admin review
    };

    // Filter out undefined fields for hours and contactInfo if they are optional
    if (!hours.openingTime && !hours.closingTime) {
      delete newRestaurantData.hours;
    }
    // Similarly for contactInfo if it's optional

    const restaurant = new Restaurant(newRestaurantData);
    await restaurant.save();
    res.status(201).json(restaurant);

  } catch (error) {
    console.error('Error creating restaurant:', error);
    if (error.message && error.message.startsWith('Error: File upload only supports')) {
        return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error creating restaurant', errorDetails: error.message });
  }
};

// @route   GET /api/restaurants
// @access  Public (or Admin if filtered)
exports.getAllRestaurants = async (req, res) => {
  console.log('RESTAURANT_CONTROLLER_GET_ALL_ENTERED. User role:', req.user ? req.user.role : 'No user/role');
  try {
    let matchCondition = { isApproved: true }; // Default for non-admin/public

    if (req.user && req.user.role === 'admin') {
      console.log('RESTAURANT_CONTROLLER_GET_ALL_ADMIN_PATH');
      matchCondition = {}; // Admin sees all restaurants
    } else {
      console.log('RESTAURANT_CONTROLLER_GET_ALL_CUSTOMER_OR_PUBLIC_PATH');
    }

    const addReviewAndManagerInfoStages = [
      // Lookup reviews
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'restaurantId',
          as: 'reviews'
        }
      },
      // Add average rating
      {
        $addFields: {
          averageRating: { $avg: '$reviews.rating' },
          reviewCount: { $size: '$reviews' }
        }
      },
      // Lookup manager details (assuming managerId links to User collection)
      {
        $lookup: {
          from: 'users',
          localField: 'managerId',
          foreignField: '_id',
          as: 'managerDetails'
        }
      },
      {
        $unwind: {
          path: '$managerDetails',
          preserveNullAndEmptyArrays: true // Keep restaurant even if no manager
        }
      },
      {
        $project: {
          // Select fields to return, exclude sensitive data like manager password
          name: 1,
          address: 1,
          cuisineType: 1,
          description: 1,
          phoneNumber: 1,
          operatingHours: 1,
          photos: 1,
          tables: 1,
          averageRating: 1,
          reviewCount: 1,
          isApproved: 1, 
          isPending: 1,
          manager: {
            _id: '$managerDetails._id',
            firstName: '$managerDetails.firstName',
            lastName: '$managerDetails.lastName',
            email: '$managerDetails.email' 
          },
          // Do not include all reviews here to keep payload smaller, fetch on demand
        }
      }
    ];

    const restaurants = await Restaurant.aggregate([
      { $match: matchCondition },
      ...addReviewAndManagerInfoStages
    ]);

    console.log(`RESTAURANT_CONTROLLER_GET_ALL_FETCHED: ${restaurants.length} restaurants with condition:`, matchCondition);
    // if (restaurants.length > 0) { console.log('First restaurant cuisineType:', restaurants[0].cuisineType); }
    
    res.json(restaurants);
  } catch (error) {
    console.error('RESTAURANT_CONTROLLER_GET_ALL_ERROR:', error.message);
    console.error(error.stack);
    res.status(500).json({ message: 'Server Error fetching restaurants', error: error.message });
  }
}; 

exports.getManagedRestaurants = async (req, res) => {
  try {
    const managerId = req.user._id; // Get manager's ID from authenticated user
    const restaurants = await Restaurant.aggregate([
      { $match: { managerId: new mongoose.Types.ObjectId(managerId) } }, // Filter by managerId
      ...addReviewAndManagerInfoStages // Add review and manager info
    ]);
    res.json(restaurants);
  } catch (error) {
    console.error('Error fetching managed restaurants:', error);
    res.status(500).json({ message: 'Error fetching managed restaurants', error: error.message });
  }
};

exports.searchRestaurants = async (req, res) => {
  try {
    const { location, date, time } = req.query; // partySize will be checked separately
    let partySize = req.query.partySize; // Keep partySize mutable for now
    let restaurants = [];

    let initialQuery = { isApproved: true };

    if (location) {
      initialQuery['$or'] = [
        { 'address.city': new RegExp(location, 'i') },
        { 'address.zip': location }
      ];
    }

    if (date && time) { // New condition: search if date and time are present
      const [yearStr, monthStr, dayStr] = date.split('-');
      const searchDate = new Date(Date.UTC(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, parseInt(dayStr, 10)));
      
      let numericPartySize = 0; // Default if partySize is not provided or invalid
      let filterByPartySize = false;

      if (partySize) {
        numericPartySize = parseInt(partySize, 10);
        if (!isNaN(numericPartySize) && numericPartySize > 0) {
          filterByPartySize = true;
        } else {
          // Optional: handle invalid partySize string, e.g., return 400 or ignore
          console.log(`Invalid partySize '${partySize}' received, ignoring for table size filter.`);
          partySize = undefined; // Treat as not provided
        }
      }

      const searchTimeMoment = moment(time, 'HH:mm'); 
      if (!searchTimeMoment.isValid()) {
        console.error(`Invalid time format received: ${time}. Expected format HH:mm.`);
        return res.status(400).json({ error: 'Invalid time format. Expected format HH:mm.' });
      }

      console.log(`Backend received search query: date='${date}', time='${time}', partySize='${partySize}'`);
      console.log(`Parsed searchDate (UTC): ${searchDate.toISOString()}`);
      console.log(`Parsed searchTimeMoment: ${searchTimeMoment.format('YYYY-MM-DD HH:mm:ss')} (server local), Valid: ${searchTimeMoment.isValid()}`);

      const startTimeMoment = searchTimeMoment.clone().subtract(30, 'minutes'); 
      const endTimeMoment = searchTimeMoment.clone().add(30, 'minutes');     

      const startTimeStr = startTimeMoment.format('HH:mm'); 
      const endTimeStr = endTimeMoment.format('HH:mm');

      console.log(`--- Time Window: ${startTimeStr} - ${endTimeStr} for Party Size: ${numericPartySize} on ${date} ---`); 

      const pipeline = [
        { $match: initialQuery }, 
        {
          $addFields: {
            dateEntry: {
              $filter: {
                input: "$availableTables",
                as: "at",
                cond: { $eq: [ "$$at.date", searchDate ] }
              }
            } // Correctly closes dateEntry
          } // Correctly closes $addFields
        }, // Correctly closes the stage object
        {
          $match: { dateEntry: { $ne: [] } }
        },
        {
          $addFields: {
            dateEntry: { $arrayElemAt: ["$dateEntry", 0] }
          }
        },
        {
          $addFields: {
            matchingTables: {
              $filter: {
                input: "$dateEntry.tables",
                as: "table",
                cond: {
                  $and: [
                    ...(filterByPartySize ? [{ $gte: [ "$$table.tableSize", numericPartySize ] }] : []),
                    { 
                      $gt: [ 
                        { 
                          $size: { 
                            $filter: {
                              input: "$$table.availableTimes",
                              as: "slot",
                              cond: {
                                $and: [
                                  { $gte: [ "$$slot", startTimeStr ] }, 
                                  { $lte: [ "$$slot", endTimeStr ] }
                                ]
                              }
                            }
                          }
                        }, 
                        0 
                      ]
                    }
                  ]
                }
              }
            }
          }
        },
        {
          $match: { matchingTables: { $ne: [] } }
        },
        {
          $project: { dateEntry: 0, matchingTables: 0 } // Project out temp fields before review/manager stages
        },
        // Append review and manager info stages here
        ...addReviewAndManagerInfoStages
      ];
      
      restaurants = await Restaurant.aggregate(pipeline);
      
    } else {
      // restaurants = await Restaurant.find(initialQuery)
      //  .populate('managerId', 'firstName lastName');
      restaurants = await Restaurant.aggregate([
        { $match: initialQuery },
        ...addReviewAndManagerInfoStages
      ]);
    }

    res.json(restaurants);

  } catch (error) {
    console.error('Error searching restaurants:', error);
    res.status(500).json({ error: 'Error searching restaurants' });
  }
};

exports.getRestaurant = async (req, res) => {
  try {
    const restaurantIdStr = req.params.id;
    // Validate if restaurantIdStr is a valid ObjectId string before attempting to convert
    if (!mongoose.Types.ObjectId.isValid(restaurantIdStr)) {
      return res.status(400).json({ error: 'Invalid restaurant ID format' });
    }
    const restaurantId = new mongoose.Types.ObjectId(restaurantIdStr);

    const pipeline = [
      { $match: { _id: restaurantId } },
      ...addReviewAndManagerInfoStages, // This already includes review and manager info
      // Add stage to count bookings made today
      {
        $lookup: {
          from: 'bookings',
          let: { restaurant_id: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$restaurantId', '$$restaurant_id'] },
                    {
                      $gte: ['$bookingDate', new Date(new Date().setUTCHours(0, 0, 0, 0))],
                    },
                    {
                      $lt: ['$bookingDate', new Date(new Date().setUTCHours(23, 59, 59, 999))],
                    },
                    // Optionally, filter by booking status if needed (e.g., only 'confirmed')
                    // { $eq: ['$status', 'confirmed'] }
                  ],
                },
              },
            },
            { $count: 'count' },
          ],
          as: 'todaysBookingsArr',
        },
      },
      {
        $addFields: {
          bookingsMadeToday: {
            $ifNull: [{ $arrayElemAt: ['$todaysBookingsArr.count', 0] }, 0],
          },
        },
      },
      {
        $project: {
          todaysBookingsArr: 0, // Clean up temporary array
        }
      }
    ];

    const result = await Restaurant.aggregate(pipeline);

    if (!result || result.length === 0) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    res.json(result[0]); // Aggregate returns an array, we want the first (and only) element
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    res.status(500).json({ error: 'Error fetching restaurant' });
  }
};

exports.updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      _id: req.params.id,
      managerId: req.user._id
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    Object.assign(restaurant, req.body);
    await restaurant.save();
    res.json(restaurant);
  } catch (error) {
    console.error('Error updating restaurant:', error);
    res.status(500).json({ error: 'Error updating restaurant' });
  }
};

exports.deleteRestaurant = async (req, res) => {
  try {
    const query = { _id: req.params.id };

    // If the user is a manager, they can only delete their own restaurants
    if (req.user.role === 'manager') {
      query.managerId = req.user._id;
    }
    // Admins can delete any restaurant, so no additional managerId check for them.

    const restaurant = await Restaurant.findOneAndDelete(query);

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found or not authorized to delete' });
    }

    res.json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    res.status(500).json({ error: 'Error deleting restaurant' });
  }
};

exports.approveRestaurant = async (req, res) => {
  try {
    // Add role check: ensure req.user.role is 'admin'
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Only admins can approve restaurants.' });
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { isApproved: true, isPending: false }, // Set correct flags
      { new: true }
    );

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    res.json(restaurant);
  } catch (error) {
    console.error('Error approving restaurant:', error);
    res.status(500).json({ error: 'Error approving restaurant' });
  }
};

// @desc    Set restaurant status to on hold (pending)
// @route   PUT /api/restaurants/:id/hold
// @access  Admin
exports.setRestaurantOnHold = async (req, res) => {
  console.log(`RESTAURANT_CONTROLLER_SET_ON_HOLD_ENTERED for ID: ${req.params.id}`);
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      console.log(`RESTAURANT_CONTROLLER_SET_ON_HOLD_NOT_FOUND ID: ${req.params.id}`);
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    restaurant.isApproved = false;
    restaurant.isPending = true;

    const updatedRestaurant = await restaurant.save();
    console.log(`RESTAURANT_CONTROLLER_SET_ON_HOLD_SUCCESS ID: ${req.params.id}`, updatedRestaurant);
    res.json(updatedRestaurant);
  } catch (error) {
    console.error(`RESTAURANT_CONTROLLER_SET_ON_HOLD_ERROR ID: ${req.params.id}:`, error.message);
    console.error(error.stack);
    res.status(500).json({ message: 'Server Error setting restaurant on hold', error: error.message });
  }
};

// @desc    Get statistics about restaurants (e.g., counts by status)
// @route   GET /api/restaurants/statistics
// @access  Admin
exports.getRestaurantStatistics = async (req, res) => {
  console.log('RESTAURANT_CONTROLLER_GET_STATISTICS_ENTERED');
  try {
    // Placeholder: Implement actual statistics calculation here
    const totalRestaurants = await Restaurant.countDocuments();
    const approvedRestaurants = await Restaurant.countDocuments({ isApproved: true });
    const pendingRestaurants = await Restaurant.countDocuments({ isPending: true });

    res.json({
      totalRestaurants,
      approvedRestaurants,
      pendingRestaurants,
      message: 'Statistics fetched successfully (placeholder)',
    });
  } catch (error) {
    console.error('RESTAURANT_CONTROLLER_GET_STATISTICS_ERROR:', error.message);
    res.status(500).json({ message: 'Server Error fetching statistics', error: error.message });
  }
};

// @desc    Get single restaurant by ID
// @route   GET /api/restaurants/:id
// @access  Public (No auth needed for basic details, but can be enhanced)
exports.getRestaurant = async (req, res) => {
  try {
    const restaurantIdStr = req.params.id;
    // Validate if restaurantIdStr is a valid ObjectId string before attempting to convert
    if (!mongoose.Types.ObjectId.isValid(restaurantIdStr)) {
      return res.status(400).json({ error: 'Invalid restaurant ID format' });
    }
    const restaurantId = new mongoose.Types.ObjectId(restaurantIdStr);

    const pipeline = [
      { $match: { _id: restaurantId } },
      ...addReviewAndManagerInfoStages, // This already includes review and manager info
      // Add stage to count bookings made today
      {
        $lookup: {
          from: 'bookings',
          let: { restaurant_id: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$restaurantId', '$$restaurant_id'] },
                    {
                      $gte: ['$bookingDate', new Date(new Date().setUTCHours(0, 0, 0, 0))],
                    },
                    {
                      $lt: ['$bookingDate', new Date(new Date().setUTCHours(23, 59, 59, 999))],
                    },
                    // Optionally, filter by booking status if needed (e.g., only 'confirmed')
                    // { $eq: ['$status', 'confirmed'] }
                  ],
                },
              },
            },
            { $count: 'count' },
          ],
          as: 'todaysBookingsArr',
        },
      },
      {
        $addFields: {
          bookingsMadeToday: {
            $ifNull: [{ $arrayElemAt: ['$todaysBookingsArr.count', 0] }, 0],
          },
        },
      },
      {
        $project: {
          todaysBookingsArr: 0, // Clean up temporary array
        }
      }
    ];

    const result = await Restaurant.aggregate(pipeline);

    if (!result || result.length === 0) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    res.json(result[0]); // Aggregate returns an array, we want the first (and only) element
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    res.status(500).json({ error: 'Error fetching restaurant' });
  }
};
