import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  useTheme,
  alpha,
  Fade,
  Zoom,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { getUserBookings, cancelBooking } from '../../features/bookings/bookingSlice';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

// Add keyframes for animations
const keyframes = `
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
`;

const UserDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth);
  const { userBookings, loading, error } = useSelector((state) => state.bookings);
  const [tabValue, setTabValue] = useState(0);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingIdToCancel, setBookingIdToCancel] = useState(null);

  useEffect(() => {
    dispatch(getUserBookings());
  }, [dispatch]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const openCancelDialog = (bookingId) => {
    setBookingIdToCancel(bookingId);
    setCancelDialogOpen(true);
  };

  const closeCancelDialog = () => {
    setBookingIdToCancel(null);
    setCancelDialogOpen(false);
  };

  const confirmCancelBooking = async () => {
    if (bookingIdToCancel) {
      await dispatch(cancelBooking(bookingIdToCancel));
    }
    closeCancelDialog();
  };

  const filterBookings = () => {
    // Get current date and time
    const now = moment();
    console.log('UserDashboard - Current time:', now.format('YYYY-MM-DD HH:mm:ss'));
    
    return userBookings.filter((booking) => {
      // Parse the time string (e.g., "19:00")
      const [hours, minutes] = booking.time.split(':').map(Number);
      
      // Create a reliable date/time object from the booking data
      let bookingDateTime;
      
      try {
        // Extract the date part based on the format
        let dateStr;
        const datePrefix = "RAW_DATE_STR:";
        
        // Check for our new prefixed format: "RAW_DATE_STR:YYYY-MM-DD"
        if (typeof booking.date === 'string' && booking.date.startsWith(datePrefix)) {
          dateStr = booking.date.substring(datePrefix.length);
          console.log('Extracted date from RAW_DATE_STR format:', dateStr);
        }
        // Check for our special format: "YYYY-MM-DD (Day)"
        else if (typeof booking.date === 'string' && booking.date.match(/^\d{4}-\d{2}-\d{2}\s+\([A-Za-z]+\)$/)) {
          // Extract just the date part before the day name
          dateStr = booking.date.split(' ')[0];
          console.log('Extracted date from special format:', dateStr);
        } 
        // Check if it's already in YYYY-MM-DD format
        else if (typeof booking.date === 'string' && booking.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          dateStr = booking.date;
          console.log('Using YYYY-MM-DD format directly:', dateStr);
        }
        // For ISO date strings or Date objects
        else {
          const dateObj = new Date(booking.date);
          if (!isNaN(dateObj.getTime())) {
            dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
            console.log('Extracted date from Date object:', dateStr);
          } else {
            // Last resort - try to use the string directly
            dateStr = booking.date;
            console.log('Using date string directly:', dateStr);
          }
        }
        
        // Create a moment object with the extracted date and booking time
        bookingDateTime = moment(`${dateStr} ${hours}:${minutes}:00`, 'YYYY-MM-DD HH:mm:ss');
        
        // Validate the created datetime
        if (!bookingDateTime.isValid()) {
          throw new Error('Invalid datetime created');
        }
        
        console.log('Final booking datetime:', bookingDateTime.format('YYYY-MM-DD HH:mm:ss'));
      } catch (e) {
        console.error('Error creating booking datetime:', e);
        // Fallback to current time (this booking will show in past tab)
        bookingDateTime = moment();
      }
      
      // Debug logging
      console.log(`Booking at ${booking.restaurantName}:`);
      console.log(`- Raw date from server: ${booking.date}, Time: ${hours}:${minutes}`);
      console.log(`- Full DateTime: ${bookingDateTime.format('YYYY-MM-DD HH:mm:ss')}`);
      console.log(`- Is after now: ${bookingDateTime.isAfter(now)}`);
      console.log(`- Status: ${booking.status}`);
      console.log(`- Tab value: ${tabValue}`);
      
      // For upcoming tab (tabValue === 0)
      if (tabValue === 0) {
        // Check if the booking is in the future AND not cancelled
        const isUpcoming = bookingDateTime.isAfter(now) && booking.status !== 'cancelled';
        console.log(`- Should show in Upcoming tab: ${isUpcoming}`);
        return isUpcoming;
      } else {
        // For past & cancelled tab (tabValue === 1)
        // Check if the booking is in the past OR cancelled
        const isPastOrCancelled = bookingDateTime.isBefore(now) || booking.status === 'cancelled';
        console.log(`- Should show in Past & Cancelled tab: ${isPastOrCancelled}`);
        return isPastOrCancelled;
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        my: 4,
        mt: { xs: 10, sm: 12, md: 14 },
        pt: 2,
        minHeight: '100vh',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <style>{keyframes}</style>
      
      {/* Welcome Section */}
      <Fade in timeout={1000}>
        <Paper 
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #2196f3, #00bcd4, #4caf50)',
            backgroundSize: '200% 200%',
            animation: 'gradient 15s ease infinite',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            mt: 2,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              backdropFilter: 'blur(10px)',
            }
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography 
              variant="h4" 
              gutterBottom
              sx={{
                fontWeight: 700,
                letterSpacing: '0.5px',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                mb: 1
              }}
            >
              Welcome back, {user?.firstName}! 👋
            </Typography>
            <Typography 
              variant="subtitle1"
              sx={{
                opacity: 0.9,
                mb: 3,
                maxWidth: '600px'
              }}
            >
              Manage your restaurant reservations and discover new dining experiences.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/search')}
              startIcon={<SearchIcon />}
              sx={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                px: 4,
                py: 1.5,
                borderRadius: '12px',
                fontWeight: 600,
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.3)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                },
                transition: 'all 0.3s ease-in-out',
              }}
            >
              Find Restaurants
            </Button>
          </Box>
        </Paper>
      </Fade>

      {error && (
        <Fade in timeout={500}>
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            }}
          >
            {error}
          </Alert>
        </Fade>
      )}

      {/* Bookings Section */}
      <Paper 
        elevation={0}
        sx={{ 
          mb: 4,
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.08)',
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            borderBottom: '1px solid rgba(0,0,0,0.08)',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              py: 2,
              px: 4,
              minWidth: 200,
              '&.Mui-selected': {
                color: '#2196f3',
              },
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
              background: 'linear-gradient(90deg, #2196f3, #00bcd4)',
            },
          }}
        >
          <Tab label="Upcoming Reservations" />
          <Tab label="Past & Cancelled" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {filterBookings().length > 0 ? (
            <Grid container spacing={3}>
              {filterBookings().map((booking, index) => (
                <Grid item xs={12} md={6} key={booking._id}>
                  <Zoom in timeout={500} style={{ transitionDelay: `${index * 100}ms` }}>
                    <Card 
                      elevation={0}
                      sx={{
                        borderRadius: '16px',
                        border: '1px solid rgba(0,0,0,0.08)',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                        },
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="flex-start"
                          sx={{ mb: 3 }}
                        >
                          <Stack direction="row" spacing={1} alignItems="center">
                            <RestaurantIcon sx={{ color: '#2196f3' }} />
                            <Typography 
                              variant="h6"
                              sx={{ 
                                fontWeight: 600,
                                background: 'linear-gradient(135deg, #2196f3, #00bcd4)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                              }}
                            >
                              {booking.restaurantId.name}
                            </Typography>
                          </Stack>
                          <Chip
                            label={booking.status}
                            color={getStatusColor(booking.status)}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              borderRadius: '8px',
                              '&.MuiChip-colorSuccess': {
                                background: alpha(theme.palette.success.main, 0.1),
                                color: theme.palette.success.main,
                              },
                              '&.MuiChip-colorWarning': {
                                background: alpha(theme.palette.warning.main, 0.1),
                                color: theme.palette.warning.main,
                              },
                              '&.MuiChip-colorError': {
                                background: alpha(theme.palette.error.main, 0.1),
                                color: theme.palette.error.main,
                              },
                            }}
                          />
                        </Stack>

                        <Stack spacing={2}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <CalendarTodayIcon sx={{ color: '#2196f3', fontSize: 20 }} />
                            <Typography variant="body1">
                              {(() => {
                                try {
                                  let displayDateStr = booking.date;
                                  const datePrefix = "RAW_DATE_STR:";
                                  
                                  // Check for our new prefixed format: "RAW_DATE_STR:YYYY-MM-DD"
                                  if (typeof booking.date === 'string' && booking.date.startsWith(datePrefix)) {
                                    displayDateStr = booking.date.substring(datePrefix.length);
                                    console.log('Displaying date from RAW_DATE_STR format:', displayDateStr);
                                  }

                                  // Check for our special format: "YYYY-MM-DD (Day)"
                                  if (typeof displayDateStr === 'string' && displayDateStr.match(/^\d{4}-\d{2}-\d{2}\s+\([A-Za-z]+\)$/)) {
                                    // Extract just the date part before the day name
                                    const datePart = displayDateStr.split(' ')[0];
                                    const [year, month, day] = datePart.split('-').map(Number);
                                    return new Date(year, month - 1, day).toLocaleDateString('en-US', { 
                                      year: 'numeric', month: 'long', day: 'numeric' 
                                    });
                                  }
                                  
                                  // Check if the date is in YYYY-MM-DD format (after potential prefix removal)
                                  if (typeof displayDateStr === 'string' && displayDateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                                    // Parse the YYYY-MM-DD format directly
                                    const [year, month, day] = displayDateStr.split('-').map(Number);
                                    return new Date(year, month - 1, day).toLocaleDateString('en-US', { 
                                      year: 'numeric', month: 'long', day: 'numeric' 
                                    });
                                  }
                                  
                                  // Handle the case where date is a full date string with time
                                  if (typeof booking.date === 'string' && booking.date.includes('May')) {
                                    // Extract just the date part from strings like "Mon May 13 2025..."
                                    const match = booking.date.match(/([A-Za-z]+)\s+([A-Za-z]+)\s+(\d+)\s+(\d{4})/);
                                    if (match) {
                                      const [_, dayOfWeek, month, day, year] = match;
                                      return `${month} ${day}, ${year}`;
                                    }
                                  }
                                  
                                  // Fallback to standard date parsing
                                  const dateObj = new Date(booking.date);
                                  if (!isNaN(dateObj.getTime())) {
                                    return dateObj.toLocaleDateString('en-US', { 
                                      year: 'numeric', month: 'long', day: 'numeric' 
                                    });
                                  }
                                  
                                  // Last resort
                                  return moment(booking.date).format('MMMM D, YYYY');
                                } catch (e) {
                                  console.error('Error formatting date:', e);
                                  return 'Date unavailable';
                                }
                              })()}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <AccessTimeIcon sx={{ color: '#2196f3', fontSize: 20 }} />
                            <Typography variant="body1">{booking.time}</Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <GroupIcon sx={{ color: '#2196f3', fontSize: 20 }} />
                            <Typography variant="body1">{booking.partySize} people</Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <LocationOnIcon sx={{ color: '#2196f3', fontSize: 20 }} />
                            <Typography variant="body2" color="text.secondary">
                              {`${booking.restaurantId.address.street}, ${booking.restaurantId.address.city}`}
                            </Typography>
                          </Stack>
                        </Stack>

                        {/* Show Cancel button only for upcoming bookings tab */}
                        {tabValue === 0 && (
                            <Tooltip title="Cancel Reservation">
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                startIcon={<CancelIcon />}
                                onClick={() => openCancelDialog(booking._id)}
                                sx={{
                                  mt: 3,
                                  borderRadius: '8px',
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  borderWidth: 2,
                                  '&:hover': {
                                    borderWidth: 2,
                                    background: alpha(theme.palette.error.main, 0.1),
                                  },
                                }}
                              >
                                Cancel Reservation
                              </Button>
                            </Tooltip>
                          )}
                      </CardContent>
                    </Card>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box 
              sx={{ 
                textAlign: 'center', 
                py: 6,
                px: 3,
                background: alpha(theme.palette.primary.main, 0.03),
                borderRadius: '12px',
              }}
            >
              <RestaurantIcon 
                sx={{ 
                  fontSize: 48, 
                  color: alpha(theme.palette.primary.main, 0.5),
                  mb: 2,
                  animation: 'float 3s ease-in-out infinite',
                }} 
              />
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'text.secondary',
                  fontWeight: 500,
                }}
              >
                {tabValue === 0
                  ? 'No upcoming reservations found'
                  : 'No past or cancelled reservations'}
              </Typography>
              {tabValue === 0 && (
                <Button
                  variant="contained"
                  onClick={() => navigate('/search')}
                  startIcon={<SearchIcon />}
                  sx={{
                    mt: 2,
                    background: 'linear-gradient(135deg, #2196f3, #00bcd4)',
                    backgroundSize: '200% 200%',
                    animation: 'gradient 15s ease infinite',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1976d2, #0097a7)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 20px rgba(33, 150, 243, 0.3)',
                    },
                    transition: 'all 0.3s ease-in-out',
                  }}
                >
                  Find Restaurants
                </Button>
              )}
            </Box>
          )}
        </Box>
      </Paper>
      {/* Cancellation Confirmation Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={closeCancelDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm Cancellation"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to cancel this booking? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCancelDialog} color="primary" autoFocus>
            No, Keep Booking
          </Button>
          <Button onClick={confirmCancelBooking} color="error">
            Yes, Cancel Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserDashboard;
