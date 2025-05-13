import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Typography,
  Box,
  Paper,
  Button,
  Chip,
  Rating,
  CircularProgress,
  Alert,
  Divider,
  ImageList,
  ImageListItem,
  Stack,
  useTheme,
  alpha,
  Fade,
  Zoom,
  IconButton,
  Tooltip,
  TextField,
} from '@mui/material';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShareIcon from '@mui/icons-material/Share';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PeopleIcon from '@mui/icons-material/People';
import InputAdornment from '@mui/material/InputAdornment';
import { getRestaurant } from '../../features/restaurants/restaurantSlice';
import { createBooking } from '../../features/bookings/bookingSlice';
import { getRestaurantReviews } from '../../features/reviews/reviewSlice';
import ReviewList from '../reviews/ReviewList';
import { colors } from '../../theme/designSystem';

const RestaurantDetails = () => {
  const theme = useTheme();
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [favorite, setFavorite] = useState(false);
  const [reservationDate, setReservationDate] = useState(moment());
  const [reservationTime, setReservationTime] = useState(moment().startOf('hour').add(1, 'hour'));
  const [reservationPeople, setReservationPeople] = useState('');
  const [formError, setFormError] = useState('');
  const [reservationSuccess, setReservationSuccess] = useState('');

  const { currentRestaurant: restaurant, loading, error } = useSelector((state) => state.restaurants);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { restaurantReviews } = useSelector((state) => state.reviews);
  const bookingState = useSelector((state) => state.bookings);

  useEffect(() => {
    dispatch(getRestaurant(id));
    dispatch(getRestaurantReviews(id));
  }, [dispatch, id]);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const dateFromUrl = query.get('date');
    const timeFromUrl = query.get('time');
    const peopleFromUrl = query.get('people');

    if (dateFromUrl) {
      const parsedDate = moment(dateFromUrl, 'YYYY-MM-DD');
      if (parsedDate.isValid()) setReservationDate(parsedDate);
    }
    if (timeFromUrl) {
      const parsedTime = moment(timeFromUrl, 'HH:mm');
      if (parsedTime.isValid()) setReservationTime(parsedTime);
    }
    if (peopleFromUrl) {
      setReservationPeople(peopleFromUrl);
    }
  }, [location.search]);

  const handleBooking = async () => {
    setFormError('');
    setReservationSuccess('');

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!reservationDate || !reservationTime || !reservationPeople) {
      setFormError('Please fill in all reservation details: date, time, and number of people.');
      return;
    }
    const partyNum = parseInt(reservationPeople, 10);
    if (isNaN(partyNum) || partyNum <= 0) {
      setFormError('Number of people must be a positive number.');
      return;
    }

    const bookingData = {
      restaurantId: id,
      date: reservationDate.format('YYYY-MM-DD'),
      time: reservationTime.format('HH:mm'),
      partySize: partyNum,
      tableSize: partyNum,
    };

    try {
      const resultAction = await dispatch(createBooking(bookingData));
      if (createBooking.fulfilled.match(resultAction)) {
        setReservationSuccess('Reservation successful! Your booking will appear in your dashboard.');
      } else if (createBooking.rejected.match(resultAction)) {
        setFormError(resultAction.payload?.message || resultAction.error?.message || 'Failed to make reservation. Please try again.');
      }
    } catch (e) {
      setFormError('An unexpected error occurred. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={40} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        {error}
      </Alert>
    );
  }

  if (!restaurant) {
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', background: `linear-gradient(135deg, ${alpha('#ffffff', 0.98)}, ${alpha('#f8f9fa', 0.95)})`, pt: { xs: 8, sm: 9, md: 10 }, pb: { xs: 4, sm: 5, md: 6 }, display: 'flex', flexDirection: 'column' }}>
      <Container maxWidth="lg" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" flex={1} minHeight="60vh">
            <CircularProgress size={40} thickness={4} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            {error}
          </Alert>
        ) : !restaurant ? null : (
          <Grid container spacing={{ xs: 3, md: 4 }} sx={{ flex: 1, alignItems: 'stretch' }}>
            <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column' }}>
              <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3, md: 4 }, borderRadius: '24px', background: `linear-gradient(135deg, ${alpha('#ffffff', 0.98)}, ${alpha('#fafbfc', 0.96)})`, backdropFilter: 'blur(8px)', boxShadow: "0 4px 24px rgba(0,0,0,0.04), 0 0 0 1px rgba(33,150,243,0.04)", border: `1px solid ${alpha(colors.primary.main, 0.04)}`, mb: 4, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3.5 }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' }, lineHeight: 1.2, letterSpacing: '-0.02em', color: alpha(colors.text.primary, 0.9), fontFamily: 'Inter, sans-serif', mb: 0.5 }}>
                    {restaurant.name}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                    <Tooltip title="Share">
                      <IconButton sx={{ background: alpha(colors.primary.main, 0.08), color: colors.primary.main, '&:hover': { background: alpha(colors.primary.main, 0.12), transform: 'scale(1.05)' }, transition: 'all 0.3s ease', height: 40, width: 40 }}>
                        <ShareIcon sx={{ fontSize: '1.25rem' }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={favorite ? "Remove from favorites" : "Add to favorites"}>
                      <IconButton onClick={() => setFavorite(!favorite)} sx={{ background: alpha(colors.primary.main, 0.08), color: favorite ? colors.primary.main : alpha(colors.text.secondary, 0.6), '&:hover': { background: alpha(colors.primary.main, 0.12), transform: 'scale(1.05)' }, transition: 'all 0.3s ease', height: 40, width: 40 }}>
                        {favorite ? <FavoriteIcon sx={{ fontSize: '1.25rem' }} /> : <FavoriteBorderIcon sx={{ fontSize: '1.25rem' }} />}
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>

                <Stack direction="row" spacing={1.5} sx={{ mb: 3.5, flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                  <Chip icon={<RestaurantIcon sx={{ fontSize: '1.1rem' }} />} label={restaurant.cuisineType} sx={{ background: alpha(colors.primary.main, 0.08), color: colors.primary.main, fontWeight: 500, fontSize: '0.85rem', height: 32, '&:hover': { background: alpha(colors.primary.main, 0.12) } }} />
                  <Chip icon={<AttachMoneyIcon sx={{ fontSize: '1.1rem' }} />} label={Array(restaurant.costRating).fill('$').join('')} sx={{ background: alpha(colors.secondary.main, 0.08), color: colors.secondary.main, fontWeight: 500, fontSize: '0.85rem', height: 32, '&:hover': { background: alpha(colors.secondary.main, 0.12) } }} />
                  {restaurant.hours && (
                    <Chip icon={<AccessTimeIcon sx={{ fontSize: '1.1rem' }} />} label={`${restaurant.hours.opening} - ${restaurant.hours.closing}`} sx={{ background: alpha(colors.text.secondary, 0.08), color: alpha(colors.text.secondary, 0.8), fontWeight: 500, fontSize: '0.85rem', height: 32, '&:hover': { background: alpha(colors.text.secondary, 0.12) } }} />
                  )}
                </Stack>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3.5 }}>
                  <Rating value={restaurant.averageRating || 0} readOnly precision={0.5} sx={{ color: colors.primary.main, fontSize: '1.5rem' }} />
                  <Typography variant="body1" sx={{ color: alpha(colors.text.secondary, 0.8), fontSize: '0.95rem', fontWeight: 500, lineHeight: 1.5 }}>
                    {restaurant.reviewCount || 0} reviews
                  </Typography>
                  {typeof restaurant.bookingsMadeToday === 'number' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
                      <EventAvailableIcon sx={{ color: colors.primary.main, fontSize: '1.25rem' }} />
                      <Typography variant="body2" sx={{ color: alpha(colors.text.secondary, 0.8), fontSize: '0.85rem', fontWeight: 500, lineHeight: 1.5 }}>
                        {restaurant.bookingsMadeToday} bookings today
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Typography variant="body1" sx={{ color: alpha(colors.text.secondary, 0.8), fontSize: '1rem', lineHeight: 1.7, mb: 4, fontFamily: 'Inter, sans-serif' }}>
                  {restaurant.description}
                </Typography>

                <ImageList cols={3} gap={16} sx={{ mb: 4, '& .MuiImageListItem-root': { borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } } }}>
                  {(restaurant.photos && restaurant.photos.length > 0 ? restaurant.photos : ['/restaurant_pictures/restaurant_6.jpg']).map((photo, index) => (
                    <ImageListItem key={index}>
                      <img src={photo?.startsWith('http') ? photo : `/restaurant_pictures/${photo || 'restaurant_6.jpg'}`} alt={`Restaurant ${index + 1}`} loading="lazy" style={{ height: '240px', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src = '/restaurant_pictures/restaurant_6.jpg'; }} />
                    </ImageListItem>
                  ))}
                </ImageList>

                <Divider sx={{ my: 4, borderColor: alpha(colors.text.secondary, 0.08) }} />

                <Typography variant="h5" sx={{ fontWeight: 600, mb: 3.5, fontSize: '1.5rem', color: alpha(colors.text.primary, 0.9), fontFamily: 'Inter, sans-serif' }}>
                  Location & Contact
                </Typography>

                {restaurant.address && (
                  <Box sx={{ mb: 4, p: 3.5, borderRadius: '20px', background: `linear-gradient(135deg, ${alpha(colors.primary.main, 0.03)}, ${alpha(colors.primary.main, 0.01)})`, border: `1px solid ${alpha(colors.primary.main, 0.08)}`, boxShadow: `0 4px 24px ${alpha(colors.primary.main, 0.04)}`, transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 32px ${alpha(colors.primary.main, 0.08)}`, borderColor: alpha(colors.primary.main, 0.12) } }}>
                    <Stack spacing={3}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5, p: 2, borderRadius: '16px', background: alpha('#ffffff', 0.5), border: `1px solid ${alpha(colors.primary.main, 0.06)}`, transition: 'all 0.3s ease', '&:hover': { background: alpha('#ffffff', 0.8), transform: 'translateX(4px)', '& .MuiSvgIcon-root': { color: colors.primary.main, transform: 'scale(1.1)' }, '& .location-text': { color: colors.text.primary } } }}>
                        <LocationOnIcon sx={{ color: alpha(colors.text.secondary, 0.6), fontSize: '1.75rem', mt: 0.25, transition: 'all 0.3s ease' }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography className="location-text" sx={{ color: alpha(colors.text.secondary, 0.8), fontSize: '1.05rem', fontFamily: 'Inter, sans-serif', fontWeight: 500, lineHeight: 1.5, transition: 'all 0.3s ease', pt: 0.25, mb: 1.5 }}>
                            {restaurant.address.street && restaurant.address.city && restaurant.address.state && restaurant.address.zip ? 
                              `${restaurant.address.street}, ${restaurant.address.city}, ${restaurant.address.state} ${restaurant.address.zip}` :
                              'Address not available'}
                          </Typography>
                          {restaurant.address.street && restaurant.address.city && restaurant.address.state && restaurant.address.zip && (
                            <Button variant="contained" size="medium" startIcon={<LocationOnIcon />} onClick={() => { const address = `${restaurant.address.street}, ${restaurant.address.city}, ${restaurant.address.state} ${restaurant.address.zip}`; const encodedAddress = encodeURIComponent(address); window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank'); }} sx={{ textTransform: 'none', borderRadius: '14px', background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.primary.light})`, color: '#fff', fontWeight: 600, fontSize: '0.95rem', py: 1, px: 2.5, boxShadow: `0 4px 12px ${alpha(colors.primary.main, 0.2)}`, '&:hover': { background: `linear-gradient(135deg, ${colors.primary.dark}, ${colors.primary.main})`, boxShadow: `0 6px 16px ${alpha(colors.primary.main, 0.3)}`, transform: 'translateY(-2px)' }, '&:active': { transform: 'translateY(0)' }, transition: 'all 0.3s ease' }}>
                              View on Google Maps
                            </Button>
                          )}
                        </Box>
                      </Box>

                      {restaurant.contactInfo && (
                        <>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, p: 2, borderRadius: '16px', background: alpha('#ffffff', 0.5), border: `1px solid ${alpha(colors.primary.main, 0.06)}`, transition: 'all 0.3s ease', '&:hover': { background: alpha('#ffffff', 0.8), transform: 'translateX(4px)', '& .MuiSvgIcon-root': { color: colors.primary.main, transform: 'scale(1.1)' }, '& .contact-text': { color: colors.text.primary } } }}>
                            <PhoneIcon sx={{ color: alpha(colors.text.secondary, 0.6), fontSize: '1.75rem', transition: 'all 0.3s ease' }} />
                            <Typography className="contact-text" sx={{ color: alpha(colors.text.secondary, 0.8), fontSize: '1.05rem', fontFamily: 'Inter, sans-serif', fontWeight: 500, lineHeight: 1.5, transition: 'all 0.3s ease' }}>
                              {restaurant.contactInfo.phone}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, p: 2, borderRadius: '16px', background: alpha('#ffffff', 0.5), border: `1px solid ${alpha(colors.primary.main, 0.06)}`, transition: 'all 0.3s ease', '&:hover': { background: alpha('#ffffff', 0.8), transform: 'translateX(4px)', '& .MuiSvgIcon-root': { color: colors.primary.main, transform: 'scale(1.1)' }, '& .contact-text': { color: colors.text.primary } } }}>
                            <EmailIcon sx={{ color: alpha(colors.text.secondary, 0.6), fontSize: '1.75rem', transition: 'all 0.3s ease' }} />
                            <Typography className="contact-text" sx={{ color: alpha(colors.text.secondary, 0.8), fontSize: '1.05rem', fontFamily: 'Inter, sans-serif', fontWeight: 500, lineHeight: 1.5, transition: 'all 0.3s ease' }}>
                              {restaurant.contactInfo.email}
                            </Typography>
                          </Box>
                        </>
                      )}
                    </Stack>
                  </Box>
                )}

                {restaurant.address && process.env.REACT_APP_GOOGLE_MAPS_API_KEY && (
                  <Box sx={{ height: '400px', width: '100%', mb: 4, borderRadius: '20px', overflow: 'hidden', boxShadow: `0 8px 32px ${alpha(colors.primary.main, 0.08)}`, border: `1px solid ${alpha(colors.primary.main, 0.08)}`, transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 12px 40px ${alpha(colors.primary.main, 0.12)}` } }}>
                    <iframe title="Restaurant Location Map" width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" src={`https://www.google.com/maps/embed/v1/place?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(`${restaurant.address.street}, ${restaurant.address.city}, ${restaurant.address.state} ${restaurant.address.zip}`)}`} />
                  </Box>
                )}

                <Divider sx={{ my: 4, borderColor: alpha(colors.text.secondary, 0.08) }} />

                <ReviewList reviews={restaurantReviews} restaurantId={id} />
              </Paper>
            </Grid>

            <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column' }}>
              <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: '24px', background: `linear-gradient(135deg, ${alpha('#ffffff', 0.98)}, ${alpha('#fafbfc', 0.96)})`, backdropFilter: 'blur(8px)', boxShadow: "0 4px 24px rgba(0,0,0,0.04), 0 0 0 1px rgba(33,150,243,0.04)", border: `1px solid ${alpha(colors.primary.main, 0.04)}`, position: 'sticky', top: { xs: 88, sm: 96, md: 104 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 3.5, fontSize: '1.35rem', color: alpha(colors.text.primary, 0.9), fontFamily: 'Inter, sans-serif' }}>
                  Make a Reservation
                </Typography>

                <LocalizationProvider dateAdapter={AdapterMoment}>
                  <Stack spacing={3} sx={{ mb: 3.5 }}>
                    <DatePicker label="Date" value={reservationDate} onChange={(newValue) => setReservationDate(newValue)} renderInput={(params) => (
                      <TextField {...params} fullWidth required error={!!formError && !reservationDate} helperText={!!formError && !reservationDate ? 'Date is required' : ''} InputProps={{ startAdornment: <InputAdornment position="start"><CalendarTodayIcon sx={{ color: colors.primary.main }} /></InputAdornment> }} />
                    )} />
                    <TimePicker label="Time" value={reservationTime} onChange={(newValue) => setReservationTime(newValue)} renderInput={(params) => (
                      <TextField {...params} fullWidth required error={!!formError && !reservationTime} helperText={!!formError && !reservationTime ? 'Time is required' : ''} InputProps={{ startAdornment: <InputAdornment position="start"><ScheduleIcon sx={{ color: colors.secondary.main }} /></InputAdornment> }} />
                    )} />
                    <TextField label="Number of People" type="number" fullWidth required value={reservationPeople} onChange={(e) => setReservationPeople(e.target.value)} error={!!formError && !reservationPeople} helperText={!!formError && (!reservationPeople || parseInt(reservationPeople, 10) <= 0) ? 'Valid number of people is required' : ''} InputProps={{ startAdornment: <InputAdornment position="start"><PeopleIcon sx={{ color: colors.success.main }} /></InputAdornment>, inputProps: { min: 1 } }} />
                  </Stack>
                </LocalizationProvider>

                {formError && (
                  <Alert severity="error" sx={{ mb: 2.5, borderRadius: '12px' }}>
                    {formError}
                  </Alert>
                )}
                {reservationSuccess && (
                  <Alert severity="success" sx={{ mb: 2.5, borderRadius: '12px' }}>
                    {reservationSuccess}
                  </Alert>
                )}

                <Button fullWidth variant="contained" onClick={handleBooking} disabled={bookingState.loading || !reservationDate || !reservationTime || !reservationPeople || parseInt(reservationPeople, 10) <= 0} sx={{ height: '48px', borderRadius: '14px', textTransform: 'none', fontSize: '1rem', fontWeight: 600, lineHeight: 1.5, background: `linear-gradient(45deg, ${colors.primary.main}, ${colors.primary.light})`, boxShadow: '0 2px 8px rgba(33,150,243,0.2)', '&:hover': { background: `linear-gradient(45deg, ${colors.primary.dark}, ${colors.primary.main})`, boxShadow: '0 4px 12px rgba(33,150,243,0.3)', transform: 'translateY(-2px)' }, '&:active': { transform: 'translateY(0)' }, transition: 'all 0.3s ease' }}>
                  {bookingState.loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Make Reservation'
                  )}
                </Button>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default RestaurantDetails;
