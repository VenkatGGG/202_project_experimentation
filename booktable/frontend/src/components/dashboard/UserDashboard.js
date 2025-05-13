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
    const now = moment();
    console.log('UserDashboard - filterBookings - now:', now.toString());
    return userBookings.filter((booking) => {
      console.log('UserDashboard - filterBookings - booking.date:', booking.date, 'booking.time:', booking.time, 'status:', booking.status);
      const [hours, minutes] = booking.time.split(':').map(Number);
      const bookingDateMoment = moment.utc(booking.date); // Parse the UTC date string
      const bookingDateTime = bookingDateMoment.local()    // Convert to local timezone
                                         .hour(hours)     // Set hours in local time
                                         .minute(minutes) // Set minutes in local time
                                         .second(0)
                                         .millisecond(0);

      console.log('UserDashboard - filterBookings - constructed bookingDateTime:', bookingDateTime.toString(), 'isValid:', bookingDateTime.isValid());
      console.log('UserDashboard - filterBookings - isAfterNow:', bookingDateTime.isAfter(now));
      if (tabValue === 0) {
        // Upcoming bookings
        return bookingDateTime.isAfter(now) && booking.status !== 'cancelled';
      } else {
        // Past bookings and cancelled
        return bookingDateTime.isBefore(now) || booking.status === 'cancelled';
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
                              {moment(booking.date).format('MMMM D, YYYY')}
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
