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

// Helper function to generate time slots
// Example: generateTimeSlots("10:00", "22:00", 30)
// Returns: ["10:00", "10:30", ..., "21:30"] (does not include closing time itself as a start slot)
const generateTimeSlots = (openingTimeStr, closingTimeStr, intervalMinutes = 30) => {
  const slots = [];
  if (!openingTimeStr || !closingTimeStr) {
    console.warn('[generateTimeSlots] Opening or closing time is undefined. Cannot generate slots.');
    return slots;
  }
  const [openH, openM] = openingTimeStr.split(':').map(Number);
  const [closeH, closeM] = closingTimeStr.split(':').map(Number);

  // Use a fixed date for time calculations, only hours and minutes matter here
  let currentTime = moment().hours(openH).minutes(openM).seconds(0).milliseconds(0);
  let closingTime = moment().hours(closeH).minutes(closeM).seconds(0).milliseconds(0);

  // If closing time is on the next day (e.g. opens 10 PM, closes 2 AM relative to a single day's perspective)
  // or if closing time is earlier than opening time on the same day (e.g. 08:00 close, 10:00 open - assumed next day)
  if (closingTime.isSameOrBefore(currentTime)) {
    closingTime.add(1, 'day');
  }

  while (currentTime.isBefore(closingTime)) {
    slots.push(currentTime.format('HH:mm'));
    currentTime.add(intervalMinutes, 'minutes');
  }
  return slots;
};

exports.createRestaurant = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    
    // Check if req.body is undefined or empty
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'Request body is empty or undefined' });
    }

    // Handle both JSON and form-data formats
    let restaurantData = {};
    let address = {};
    let hours = {};
    let tables = [];

    // If it's a JSON object (from regular JSON request)
    if (typeof req.body === 'object' && !req.body['address[street]']) {
      const { name, description, cuisineType, costRating, address: addressObj, hours: hoursObj, tables: tablesArray, photos } = req.body;
      
      restaurantData = { name, description, cuisineType, costRating };
      address = addressObj || {};
      hours = hoursObj || {};
      tables = tablesArray || [];
      
      if (photos) {
        restaurantData.photos = Array.isArray(photos) ? photos : [photos];
      }
    } 
    // If it's form-data format
    else {
      restaurantData = {
        name: req.body.name,
        description: req.body.description,
        cuisineType: req.body.cuisineType,
        costRating: req.body.costRating
        // DO NOT put req.body.tables directly into restaurantData here if it's a string
      };
      
      address = {
        street: req.body['address[street]'],
        city: req.body['address[city]'],
        state: req.body['address[state]'],
        zipCode: req.body['address[zipCode]']
      };
      
      hours = {
        opening: req.body['hours[opening]'],
        closing: req.body['hours[closing]']
      };
      
      // Parse tables if they exist in form data
      if (req.body.tables) {
        console.log('[createRestaurant] Received req.body.tables (string):', req.body.tables);
        try {
          tables = JSON.parse(req.body.tables);
          // Log the parsed array. Using JSON.stringify for cleaner log output of the array.
          console.log('[createRestaurant] Successfully parsed req.body.tables. Local tables variable is now:', JSON.stringify(tables, null, 2));
        } catch (e) {
          console.error('[createRestaurant] Error parsing tables string from req.body.tables. String was:', req.body.tables, 'Error:', e);
          // tables remains its initial value, e.g., []
        }
      } else {
        console.log('[createRestaurant] req.body.tables is not present.');
      }
    }
    
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
    } else if (restaurantData.photos && restaurantData.photos.length > 0) {
      // If photos were provided in the JSON data, use those
      photoUrl = restaurantData.photos[0];
    }

    const newRestaurantData = {
      name: restaurantData.name,
      description: restaurantData.description,
      cuisineType: restaurantData.cuisineType,
      costRating: restaurantData.costRating,
      address,
      hours, // contains hours.opening and hours.closing
      contactInfo: restaurantData.contactInfo || {}, // Ensure contactInfo is an object
      managerId: req.user._id, 
      photos: photoUrl ? [photoUrl] : [], 
      isApproved: false, 
      isPending: true, 
      tables: [], // Initialize physical tables array
      availableTables: [] // Initialize availableTables array
    };
    
    // Assign parsed physical tables to newRestaurantData.tables
    if (Array.isArray(tables) && tables.length > 0) {
      newRestaurantData.tables = tables; // Assign the PARSED array of physical tables
      console.log('[createRestaurant] Assigned physical tables to newRestaurantData.tables:', JSON.stringify(newRestaurantData.tables, null, 2));

      // Generate availableTimes based on restaurant's hours
      const dailyAvailableTimes = generateTimeSlots(newRestaurantData.hours.opening, newRestaurantData.hours.closing);
      console.log('[createRestaurant] Generated dailyAvailableTimes:', dailyAvailableTimes);

      if (dailyAvailableTimes.length > 0) {
        const numberOfDaysToGenerate = 30; // Generate for next 30 days
        for (let i = 0; i < numberOfDaysToGenerate; i++) {
          const currentDate = moment().add(i, 'days');
          const dateStr = `RAW_DATE_STR:${currentDate.format('YYYY-MM-DD')}`;

          const dailyEntry = {
            date: dateStr,
            tables: newRestaurantData.tables.map(physicalTable => ({
              tableSize: physicalTable.tableSize,
              // For now, assume all physical tables of a certain size share the same broad availability slots.
              // Count of physical tables of this size (physicalTable.count) is not directly part of this schema structure
              // but is important for booking logic later.
              availableTimes: [...dailyAvailableTimes] 
            }))
          };
          newRestaurantData.availableTables.push(dailyEntry);
        }
        console.log(`[createRestaurant] Generated ${newRestaurantData.availableTables.length} days of availability.`);
      } else {
        console.warn('[createRestaurant] No daily available times generated, check opening/closing hours. Skipping availableTables generation.');
      }

    } else {
      console.warn('[createRestaurant] No physical tables parsed or provided. Cannot generate availableTables. req.body.tables was:', req.body.tables);
    }

    console.log('[createRestaurant] newRestaurantData to be saved (final check):', JSON.stringify(newRestaurantData, null, 2));
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
      // Safely handle restaurants without address information
      initialQuery['$or'] = [
        { 'address.city': new RegExp(location, 'i') },
        { 'address.zip': location }
      ];
      
      // Add a check to ensure address exists
      initialQuery['address'] = { $exists: true, $ne: null };
    }

    if (date && time) { // New condition: search if date and time are present
      // Parse the date string without converting to UTC to preserve the date
      const searchDate = new Date(date);
      searchDate.setHours(0, 0, 0, 0);
      
      console.log(`Searching for date: ${date}, parsed as: ${searchDate.toISOString()}`);
      
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
                cond: {
                  // Directly compare the prefixed date string
                  $eq: [ "$$at.date", `RAW_DATE_STR:${date}` ] 
                }
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
    // First, check if the restaurant exists
    const restaurantExists = await Restaurant.findById(req.params.id);
    if (!restaurantExists) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    // Then check if the user is authorized to update it
    if (restaurantExists.managerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this restaurant' });
    }
    
    // Create an update object with all the fields to update
    const updateData = {};
    
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.cuisineType !== undefined) updateData.cuisineType = req.body.cuisineType;
    
    if (req.body.costRating !== undefined) {
      const costRatingValue = parseInt(req.body.costRating);
      if (!isNaN(costRatingValue) && costRatingValue >= 1 && costRatingValue <= 4) {
        updateData.costRating = costRatingValue;
      }
    }
    
    if (req.body.capacity !== undefined) updateData.capacity = req.body.capacity;
    
    if (req.body['address[street]'] || req.body['address[city]'] || req.body['address[state]'] || req.body['address[zip]'] || req.body['address[zipCode]']) {
      // Handle FormData format
      updateData.address = {
        street: req.body['address[street]'] || restaurantExists.address?.street,
        city: req.body['address[city]'] || restaurantExists.address?.city,
        state: req.body['address[state]'] || restaurantExists.address?.state,
        zip: req.body['address[zip]'] || req.body['address[zipCode]'] || restaurantExists.address?.zip
      };
    } else if (req.body.address) {
      // Handle JSON format
      updateData.address = {
        street: req.body.address.street || restaurantExists.address?.street,
        city: req.body.address.city || restaurantExists.address?.city,
        state: req.body.address.state || restaurantExists.address?.state,
        zip: req.body.address.zip || restaurantExists.address?.zip
      };
    }
    
    // Handle hours if provided
    if (req.body['hours[opening]'] || req.body['hours[closing]']) {
      // Handle FormData format
      updateData.hours = {
        opening: req.body['hours[opening]'] || restaurantExists.hours?.opening,
        closing: req.body['hours[closing]'] || restaurantExists.hours?.closing
      };
    } else if (req.body.hours) {
      // Handle JSON format
      updateData.hours = {
        opening: req.body.hours.opening || restaurantExists.hours?.opening,
        closing: req.body.hours.closing || restaurantExists.hours?.closing
      };
    }
    
    // Handle contact info if provided
    if (req.body['contactInfo[phone]'] || req.body['contactInfo[email]']) {
      // Handle FormData format
      updateData.contactInfo = {
        phone: req.body['contactInfo[phone]'] || restaurantExists.contactInfo?.phone,
        email: req.body['contactInfo[email]'] || restaurantExists.contactInfo?.email
      };
    } else if (req.body.contactInfo) {
      // Handle JSON format
      updateData.contactInfo = {
        phone: req.body.contactInfo.phone || restaurantExists.contactInfo?.phone,
        email: req.body.contactInfo.email || restaurantExists.contactInfo?.email
      };
    }
    
    // Handle tables if provided
    let validTables = [];
    if (req.body.tables) {
      // Handle JSON format
      try {
        // If it's a string (from FormData), parse it
        let tablesData;
        
        if (typeof req.body.tables === 'string') {
          try {
            tablesData = JSON.parse(req.body.tables);
          } catch (parseError) {
            tablesData = [];
          }
        } else if (Array.isArray(req.body.tables)) {
          tablesData = req.body.tables;
        } else {
          tablesData = [];
        }
        
        // Validate table data
        if (Array.isArray(tablesData)) {
          validTables = tablesData
            .filter(table => 
              table && 
              table.tableSize && Number.isInteger(parseInt(table.tableSize)) && 
              table.count && Number.isInteger(parseInt(table.count)) && 
              parseInt(table.count) > 0
            )
            .map(table => ({
              tableSize: parseInt(table.tableSize),
              count: parseInt(table.count)
            }));
        }
      } catch (error) {
        validTables = [];
      }
      
      if (validTables.length > 0) {
        updateData.tables = validTables;
        
        // Update available tables based on the physical tables
        // Get today's date at midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Generate available times based on opening/closing hours
        const openingHour = updateData.hours?.opening || restaurantExists.hours?.opening || '09:00';
        const closingHour = updateData.hours?.closing || restaurantExists.hours?.closing || '22:00';
        
        const [openHour, openMinute] = openingHour.split(':').map(Number);
        const [closeHour, closeMinute] = closingHour.split(':').map(Number);
        
        const availableTimes = [];
        let currentHour = openHour;
        let currentMinute = openMinute;
        
        // Generate time slots every 30 minutes
        while (currentHour < closeHour || (currentHour === closeHour && currentMinute < closeMinute)) {
          availableTimes.push(`${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`);
          
          currentMinute += 30;
          if (currentMinute >= 60) {
            currentHour += 1;
            currentMinute = 0;
          }
        }
        
        // Get existing available tables
        const existingAvailableTables = restaurantExists.availableTables || [];
        
        // Create a map of existing dates to their tables
        const existingDateMap = new Map();
        existingAvailableTables.forEach(dateEntry => {
          const dateStr = new Date(dateEntry.date).toISOString().split('T')[0];
          existingDateMap.set(dateStr, dateEntry);
        });
        
        // Create available tables for the next 30 days
        const availableTablesData = [];
        
        for (let i = 0; i < 30; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          const dateStr = date.toISOString().split('T')[0];
          
          // Check if we have existing tables for this date
          const existingEntry = existingDateMap.get(dateStr);
          
          // For the first 3 days, always use the new tables configuration
          // For other days, preserve existing bookings if available
          if (i < 3 || !existingEntry) {
            // For the first 3 days or if no existing entry, create new tables
            const tablesForDate = {
              tables: validTables.map(table => ({
                tableSize: table.tableSize,
                count: table.count,
                availableTimes: availableTimes // Use the generated times
              }))
            };
            const formattedDate = `RAW_DATE_STR:${dateStr}`;
            tablesForDate.date = formattedDate; // Assign the formatted date

            availableTablesData.push(tablesForDate);
          } else {
            // Preserve existing entry for days beyond the 3-day override window
            // Important: Ensure existing entries are also stored with the prefix if they aren't already
            if (existingEntry && typeof existingEntry.date === 'object' && existingEntry.date instanceof Date) {
                // If it's a Date object, convert it
                const existingDateStr = existingEntry.date.toISOString().split('T')[0];
                existingEntry.date = `RAW_DATE_STR:${existingDateStr}`;
            } else if (existingEntry && typeof existingEntry.date === 'string' && !existingEntry.date.startsWith('RAW_DATE_STR:')){
                // If it's a string but lacks the prefix (legacy data?), add it
                // Be cautious with assumptions about the string format here
                if (existingEntry.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    existingEntry.date = `RAW_DATE_STR:${existingEntry.date}`;
                }
                // Add more checks if other legacy string formats exist
            }
            // If it already has the prefix or is not a recognizable format, leave it as is
            availableTablesData.push(existingEntry);
          }
        }
        updateData.availableTables = availableTablesData;
      }
    }
    
    // Handle photos
    // 1. Check for new uploaded photo
    if (req.file) {
      // Upload to S3 and get the URL
      const photoUrl = await uploadToS3(req.file);
      if (photoUrl) {
        // Add the new photo to the existing photos
        updateData.photos = [...(restaurantExists.photos || []), photoUrl];
      }
    } 
    // 2. Check for existing photos from form
    else if (req.body.existingPhotos) {
      try {
        const existingPhotos = JSON.parse(req.body.existingPhotos);
        if (Array.isArray(existingPhotos)) {
          updateData.photos = existingPhotos;
        }
      } catch (error) {
        // Silently handle error
      }
    }
    // 3. Check for photos in JSON format
    else if (req.body.photos) {
      updateData.photos = Array.isArray(req.body.photos) ? req.body.photos : [req.body.photos];
    }
    

    
    // Use findByIdAndUpdate for a more reliable update
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!updatedRestaurant) {
      return res.status(500).json({ error: 'Failed to update restaurant' });
    }
    
    res.json(updatedRestaurant);
  } catch (error) {
    res.status(500).json({ error: 'Error updating restaurant', details: error.message });
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
