import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Chip,
  TextField,
  MenuItem,
  alpha
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EventNoteIcon from '@mui/icons-material/EventNote'; // For View Bookings
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant'; // For Manage Tables
import LocationOnIcon from '@mui/icons-material/LocationOn';
import RestaurantForm from '../restaurants/RestaurantForm';
import {
  fetchManagedRestaurants,
  createRestaurant,
  updateRestaurant,
  clearCurrentRestaurant,
  getRestaurant, // Keep for fetching single restaurant details if needed for form
  clearError as clearRestaurantError
} from '../../features/restaurants/restaurantSlice';
import { getRestaurantBookings, clearRestaurantBookings, clearError } from '../../features/bookings/bookingSlice';
import { showFeedback } from '../../features/uiFeedbackSlice'; // Added correct import
import moment from 'moment';
import { colors } from '../../theme/designSystem';

// Updated list of predefined restaurant images
const predefinedRestaurantImages = Array.from({ length: 10 }, (_, i) => `https://202restaurantpictures.s3.us-east-2.amazonaws.com/restaurant_pictures/restaurant_${i + 1}.jpg`);

// Define cuisine options
const cuisineOptions = [
  'American',
  'Italian',
  'Chinese',
  'Japanese',
  'Indian',
  'Mexican',
  'Thai',
  'Mediterranean',
  'French',
  'Korean',
  'Vietnamese',
  'Greek',
  'Spanish',
  'German',
  'Caribbean',
  'African',
  'Middle Eastern',
  'Fusion',
  'Seafood',
  'Steakhouse',
  'Vegetarian',
  'Vegan',
  'Fast Food',
  'Cafe',
  'Bakery',
  'Dessert',
  'Bar & Grill',
  'Pub',
  'Fine Dining',
  'Buffet'
];

// Define initial form data
const initialFormData = {
  name: '',
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
  },
  cuisineType: '',
  description: '',
};

const ManagerDashboard = () => {
  const dispatch = useDispatch();
  const {
    restaurants: managerRestaurants, // Renamed for clarity
    loading: restaurantLoading,
    error: restaurantError,
    currentRestaurant // Used by RestaurantForm for editing
  } = useSelector((state) => state.restaurants);
  const {
    restaurantBookings,
    loading: bookingsLoading,
    error: bookingsError
  } = useSelector((state) => state.bookings);

  const [restaurantFormOpen, setRestaurantFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [bookingViewRestaurant, setBookingViewRestaurant] = useState(null);
  const [tabValue, setTabValue] = useState(0); // For booking tabs
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    cuisineType: '',
    description: ''
  });
  const [selectedPhoto, setSelectedPhoto] = useState(null); // State for the photo file
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name.includes('.')) { // Handles 'address.street', 'address.city', etc.
      const [parentKey, childKey] = name.split('.');
      setFormData(prevData => ({
        ...prevData,
        [parentKey]: {
          ...prevData[parentKey],
          [childKey]: value
        }
      }));
    } else { // Handles 'name', 'description', etc.
      setFormData(prevData => ({
        ...prevData,
        [name]: value
      }));
    }
  };

  useEffect(() => {
    dispatch(fetchManagedRestaurants());
    return () => {
      dispatch(clearCurrentRestaurant());
      dispatch(clearRestaurantBookings());
    };
  }, [dispatch]);

  useEffect(() => {
    if (restaurantError) {
      // Optional: auto-clear error after a few seconds or provide a manual clear button
      console.error("Restaurant Error:", restaurantError);
    }
    if (bookingsError) {
      console.error("Bookings Error:", bookingsError);
    }
  }, [restaurantError, bookingsError]);

  useEffect(() => {
    // Clear bookings when component unmounts or bookingViewRestaurant changes to null
    return () => {
      if (bookingViewRestaurant) { // Only clear if there was a restaurant selected
        dispatch(clearRestaurantBookings());
      }
      dispatch(clearError()); // Clear any general booking errors
    };
  }, [dispatch, bookingViewRestaurant]); // Ensure bookingViewRestaurant is a dependency

  const handleOpenRestaurantForm = (restaurantToEdit = null) => {
    dispatch(clearRestaurantError());
    if (restaurantToEdit) {
      console.log('Opening edit form for restaurant:', restaurantToEdit);
      // Fetch full details for editing if not already complete in managerRestaurants list
      // Or ensure currentRestaurant is set for the form
      dispatch(getRestaurant(restaurantToEdit._id)); // This will set currentRestaurant
      setIsEditing(true);
      setSelectedRestaurant(restaurantToEdit); // Set the selected restaurant for editing
    } else {
      dispatch(clearCurrentRestaurant()); // Clear for new form
      setIsEditing(false);
      setSelectedRestaurant(null); // Clear selected restaurant
    }
    setRestaurantFormOpen(true);
  };

  const handleCloseRestaurantForm = () => {
    setRestaurantFormOpen(false);
    dispatch(clearCurrentRestaurant());
    dispatch(clearRestaurantError());
  };

  const handleRestaurantFormSubmit = async (formData) => {
    try {
      // formData is already a FormData object from the RestaurantForm component
      console.log('Submitting restaurant form with data:', formData);
      
      if (isEditing && currentRestaurant) {
        // Log the data being sent for debugging
        console.log('Updating restaurant with ID:', currentRestaurant._id);
        
        // For editing, we need to pass the restaurant ID
        const result = await dispatch(updateRestaurant({ 
          id: currentRestaurant._id, 
          restaurantData: formData 
        })).unwrap();
        
        console.log('Update result:', result);
        dispatch(showFeedback({ message: 'Restaurant updated successfully!', severity: 'success' }));
      } else {
        // For new restaurants, if no photo is provided, use a random one
        if (!formData.get('photo') && !formData.get('existingPhotos')) {
          const randomImage = predefinedRestaurantImages[Math.floor(Math.random() * predefinedRestaurantImages.length)];
          formData.append('photos', JSON.stringify([randomImage]));
        }
        
        await dispatch(createRestaurant(formData)).unwrap();
        dispatch(showFeedback({ message: 'Restaurant added successfully!', severity: 'success' }));
      }
      
      handleCloseRestaurantForm();
      dispatch(fetchManagedRestaurants()); // Re-fetch to update list
    } catch (error) {
      console.error('Failed to save restaurant:', error);
      dispatch(showFeedback({ message: `Error: ${error.message || 'Failed to save restaurant'}`, severity: 'error' }));
    }
  };

  const handleViewBookings = (restaurant) => {
    setBookingViewRestaurant(restaurant);
    dispatch(getRestaurantBookings(restaurant._id));
    setTabValue(0); // Reset to today's bookings tab
  };

  const handleManageTables = (restaurant) => {
    // Placeholder for future implementation
    alert(`Manage tables for ${restaurant.name} - Coming soon!`);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const filterBookings = () => {
    if (!restaurantBookings || !bookingViewRestaurant) return [];
    const now = moment();
    return restaurantBookings.filter((booking) => {
      const bookingDateTime = moment(booking.date); // Assuming booking.date is already a proper date string/object
      if (tabValue === 0) { // Today's bookings
        return bookingDateTime.isSame(now, 'day');
      }
      if (tabValue === 1) { // Upcoming bookings
        return bookingDateTime.isAfter(now, 'day');
      }
      // Past bookings
      return bookingDateTime.isBefore(now, 'day') && !bookingDateTime.isSame(now, 'day');
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const handleCloseBookingDialog = () => {
    setBookingViewRestaurant(null);
    // No need to dispatch clearRestaurantBookings here, useEffect will handle it
    dispatch(clearError()); // Clear any errors when closing dialog
  };

  const handleDelete = async (id) => {
    // Implement delete logic here
    console.log('Deleting restaurant:', selectedRestaurant);
    setConfirmDialogOpen(false);
  };

  const handlePhotoChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedPhoto(event.target.files[0]);
    } else {
      setSelectedPhoto(null);
    }
  };

  // We're now using the RestaurantForm component for both adding and editing restaurants

  if (restaurantLoading && !managerRestaurants.length) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh',
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          pt: { xs: 8, sm: 9, md: 10 },
          background: `linear-gradient(135deg, 
            ${alpha('#ffffff', 0.99)}, 
            ${alpha('#f8fafc', 0.98)}, 
            ${alpha('#f1f5f9', 0.97)})`,
        }}
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, 
          ${alpha('#ffffff', 0.99)}, 
          ${alpha('#f8fafc', 0.98)}, 
          ${alpha('#f1f5f9', 0.97)})`,
        pt: { xs: 8, sm: 9, md: 10 },
        pb: { xs: 4, sm: 5, md: 6 },
        position: 'relative',
      }}
    >
      <Container 
        maxWidth="xl" 
        sx={{ 
          position: 'relative',
          zIndex: 1,
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{
              fontWeight: 700,
              color: colors.text.primary,
              mb: 1,
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
            }}
          >
            Manager Dashboard
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: colors.text.secondary,
              mb: 3,
            }}
          >
            Manage your restaurants and bookings
          </Typography>

          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
              onClick={() => handleOpenRestaurantForm(null)}
              sx={{
                background: `linear-gradient(135deg, 
                  ${colors.secondary.main}, 
                  ${colors.primary.main})`,
                color: '#fff',
                px: 3,
                py: 1.5,
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  background: `linear-gradient(135deg, 
                    ${colors.secondary.dark}, 
                    ${colors.primary.dark})`,
                  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.3s ease',
              }}
        >
          Add New Restaurant
        </Button>
      </Box>

          {restaurantError && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(211, 47, 47, 0.1)',
              }}
            >
              {typeof restaurantError === 'string' ? restaurantError : restaurantError.message || 'An unknown error occurred'}
            </Alert>
          )}

          {managerRestaurants.length === 0 && !restaurantLoading && !restaurantError && (
            <Alert 
              severity="info" 
              sx={{ 
                mb: 3,
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(2, 136, 209, 0.1)',
              }}
            >
              No restaurants found. Add your first restaurant to get started.
            </Alert>
          )}

          {managerRestaurants.length > 0 && (
            <Grid 
              container 
              spacing={3}
              sx={{
                '& .MuiGrid-item': {
                  display: 'flex',
                }
              }}
            >
        {managerRestaurants.map((restaurant) => (
                <Grid item xs={12} sm={6} md={4} key={restaurant._id}>
                  <Paper
                    elevation={0}
                    sx={{
                      width: '100%',
                      height: '100%',
                      minHeight: 280,
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: '20px',
                      background: `linear-gradient(135deg, 
                        ${alpha('#ffffff', 0.95)}, 
                        ${alpha('#f8fafc', 0.98)})`,
                      boxShadow: `
                        0 4px 6px -1px ${alpha('#000000', 0.05)},
                        0 2px 4px -1px ${alpha('#000000', 0.03)},
                        0 0 0 1px ${alpha('#000000', 0.02)}
                      `,
                      border: `1px solid ${alpha('#000000', 0.03)}`,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      overflow: 'hidden',
                      position: 'relative',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `
                          0 20px 25px -5px ${alpha('#000000', 0.08)},
                          0 10px 10px -5px ${alpha('#000000', 0.04)},
                          0 0 0 1px ${alpha('#000000', 0.03)}
                        `,
                        '& .restaurant-image': {
                          transform: 'scale(1.05)',
                        },
                        '& .restaurant-actions': {
                          opacity: 1,
                          transform: 'translateY(0)',
                        }
                      },
                    }}
                  >
                    {/* Restaurant Image */}
                    <Box
                      sx={{
                        position: 'relative',
                        width: '100%',
                        height: 160,
                        overflow: 'hidden',
                        borderBottom: `1px solid ${alpha('#000000', 0.03)}`,
                      }}
                    >
                      <Box
                        component="img"
                        src={restaurant.photos?.[0] || predefinedRestaurantImages[0]}
                        alt={restaurant.name}
                        className="restaurant-image"
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          zIndex: 1,
                        }}
                      >
                        <Chip
                          label={restaurant.isApproved ? 'Approved' : (restaurant.isPending ? 'Pending' : 'On Hold')}
                          size="small"
                          sx={{
                            backgroundColor: restaurant.isApproved 
                              ? alpha(colors.success.main, 0.95)
                              : restaurant.isPending 
                                ? alpha(colors.warning.main, 0.95)
                                : alpha(colors.error.main, 0.95),
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            height: 24,
                            '& .MuiChip-label': {
                              px: 1.5,
                            },
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Restaurant Content */}
                    <Box
                      sx={{
                        p: 3,
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <Typography 
                        variant="h6" 
                        component="h2" 
                        sx={{ 
                          mb: 1.5,
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          color: colors.text.primary,
                          letterSpacing: '-0.01em',
                          lineHeight: 1.3,
                        }}
                      >
                        {restaurant.name}
                      </Typography>
                      
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          mb: 2,
                          color: colors.text.secondary,
                          fontSize: '0.875rem',
                          lineHeight: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {restaurant.address?.street}, {restaurant.address?.city}
                      </Typography>

                      <Box
                        sx={{
                          mb: 2,
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 0.5,
                        }}
                      >
                        {Array.isArray(restaurant.cuisineType) && restaurant.cuisineType.slice(0, 3).map((cuisine, index) => (
              <Chip 
                            key={index}
                            label={cuisine}
                size="small"
                            sx={{
                              backgroundColor: alpha(colors.primary.main, 0.08),
                              color: colors.primary.main,
                              fontWeight: 500,
                              fontSize: '0.75rem',
                              height: 24,
                              '& .MuiChip-label': {
                                px: 1,
                              },
                            }}
                          />
                        ))}
                        {restaurant.cuisineType?.length > 3 && (
                          <Chip
                            label={`+${restaurant.cuisineType.length - 3}`}
                  size="small" 
                            sx={{
                              backgroundColor: alpha(colors.text.secondary, 0.08),
                              color: colors.text.secondary,
                              fontWeight: 500,
                              fontSize: '0.75rem',
                              height: 24,
                              '& .MuiChip-label': {
                                px: 1,
                              },
                            }}
                          />
                        )}
                      </Box>

                      {/* Restaurant Actions */}
                      <Box 
                        className="restaurant-actions"
                        sx={{ 
                          display: 'flex', 
                          gap: 1,
                          mt: 'auto',
                          pt: 2,
                          borderTop: `1px solid ${alpha('#000000', 0.03)}`,
                          opacity: 1,
                          transform: 'translateY(0)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      >
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<LocationOnIcon />}
                          onClick={() => {
                            const address = `${restaurant.address?.street}, ${restaurant.address?.city}, ${restaurant.address?.state} ${restaurant.address?.zipCode}`;
                            const encodedAddress = encodeURIComponent(address);
                            window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
                          }}
                          sx={{ 
                            flex: 1,
                            textTransform: 'none',
                            borderRadius: '12px',
                            borderColor: alpha(colors.secondary.main, 0.3),
                            color: colors.secondary.main,
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            py: 1,
                            px: 2,
                            '&:hover': {
                              borderColor: colors.secondary.main,
                              backgroundColor: alpha(colors.secondary.main, 0.04),
                              transform: 'translateY(-1px)',
                            },
                            transition: 'all 0.2s ease',
                          }}
                        >
                          View Location
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleOpenRestaurantForm(restaurant)}
                          sx={{ 
                            flex: 1,
                            textTransform: 'none',
                            borderRadius: '12px',
                            borderColor: alpha(colors.primary.main, 0.3),
                            color: colors.primary.main,
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            py: 1,
                            px: 2,
                            '&:hover': {
                              borderColor: colors.primary.main,
                              backgroundColor: alpha(colors.primary.main, 0.04),
                              transform: 'translateY(-1px)',
                            },
                            transition: 'all 0.2s ease',
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => {
                            setSelectedRestaurant(restaurant);
                            setConfirmDialogOpen(true);
                          }}
                          sx={{ 
                            flex: 1,
                            textTransform: 'none',
                            borderRadius: '12px',
                            borderColor: alpha(colors.error.main, 0.3),
                            color: colors.error.main,
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            py: 1,
                            px: 2,
                            '&:hover': {
                              borderColor: colors.error.main,
                              backgroundColor: alpha(colors.error.main, 0.04),
                              transform: 'translateY(-1px)',
                            },
                            transition: 'all 0.2s ease',
                          }}
                        >
                          Delete
                        </Button>
                      </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
          )}
        </Box>
      </Container>

      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            maxWidth: '400px',
            width: '100%',
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          fontWeight: 600,
          fontSize: '1.25rem',
        }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <DialogContentText sx={{ 
            color: colors.text.secondary,
            fontSize: '0.95rem',
            lineHeight: 1.6,
          }}>
            Are you sure you want to delete the restaurant "{selectedRestaurant?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setConfirmDialogOpen(false)}
            sx={{ 
              textTransform: 'none',
              px: 2,
              py: 1,
              borderRadius: '8px',
              color: colors.text.secondary,
              '&:hover': {
                backgroundColor: alpha(colors.text.secondary, 0.08),
              },
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDelete}
            color="error"
            variant="contained"
            sx={{ 
              textTransform: 'none',
              px: 2,
              py: 1,
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(211, 47, 47, 0.2)',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            Delete Restaurant
          </Button>
        </DialogActions>
      </Dialog>

      {/* Restaurant Form Dialog */}
      <Dialog
        open={restaurantFormOpen}
        onClose={handleCloseRestaurantForm}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          fontWeight: 600,
          fontSize: '1.25rem',
        }}>
          {isEditing ? 'Edit Restaurant' : 'Add New Restaurant'}
        </DialogTitle>
        <DialogContent>
          {(isEditing && currentRestaurant) || !isEditing ? (
            <RestaurantForm
              key={isEditing && currentRestaurant ? currentRestaurant._id : 'new-restaurant-form'}
              initialData={isEditing && currentRestaurant ? currentRestaurant : initialFormData}
              onSubmit={handleRestaurantFormSubmit}
              loading={restaurantLoading}
              error={restaurantError} 
              onCancel={handleCloseRestaurantForm}
              isEditing={isEditing}
              cuisineOptions={cuisineOptions}
              predefinedRestaurantImages={predefinedRestaurantImages}
            />
          ) : restaurantLoading ? ( // Show loading indicator if fetching for edit and currentRestaurant not yet available
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
              <CircularProgress />
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px', borderTop: `1px solid ${colors.divider}`}}>
          <Button 
            onClick={handleCloseRestaurantForm}
            sx={{ 
              textTransform: 'none',
              px: 2,
              py: 1,
              borderRadius: '8px',
              color: colors.text.secondary,
              '&:hover': {
                backgroundColor: alpha(colors.text.secondary, 0.08),
              },
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              const form = document.querySelector('form');
              if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            }}
            variant="contained"
            sx={{ 
              textTransform: 'none',
              px: 2,
              py: 1,
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            {isEditing ? 'Update Restaurant' : 'Add Restaurant'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManagerDashboard;
