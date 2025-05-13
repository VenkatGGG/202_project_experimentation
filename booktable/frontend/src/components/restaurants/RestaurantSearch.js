import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchRestaurants } from '../../features/restaurants/restaurantSlice';
import { 
  Button, 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  CircularProgress,
  Box,
  TextField,
  InputAdornment,
  useTheme,
  alpha,
  Fade,
  Zoom,
  Stack,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import moment from 'moment';
import RestaurantList from './RestaurantList';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PeopleIcon from '@mui/icons-material/People';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { colors, typography, spacing } from '../../theme/designSystem';
import { useLocation } from 'react-router-dom';

const RestaurantSearch = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const location = useLocation();
  const { restaurants, loading } = useSelector(state => state.restaurants);
  
  const [searchParams, setSearchParams] = useState({
    date: moment(),
    time: moment().startOf('hour').add(1, 'hour'),
    people: '',
    location: ''
  });

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const dateFromUrl = query.get('date');
    const timeFromUrl = query.get('time');
    const peopleFromUrl = query.get('people');
    const locationFromUrl = query.get('location'); 

    let newSearchParamsFromUrl = {}; 
    let foundUrlParams = false;

    if (dateFromUrl) {
      newSearchParamsFromUrl.date = moment(dateFromUrl, 'YYYY-MM-DD');
      foundUrlParams = true;
    }
    if (timeFromUrl) {
      newSearchParamsFromUrl.time = moment(timeFromUrl, 'HH:mm');
      foundUrlParams = true;
    }
    if (peopleFromUrl) {
      newSearchParamsFromUrl.people = parseInt(peopleFromUrl, 10) || '';
      foundUrlParams = true;
    }
    if (locationFromUrl) {
      newSearchParamsFromUrl.location = locationFromUrl;
      foundUrlParams = true;
    }

    if (foundUrlParams) {
      setSearchParams(prev => ({
        ...prev,
        ...newSearchParamsFromUrl
      }));

      if (newSearchParamsFromUrl.date && newSearchParamsFromUrl.date.isValid() &&
          newSearchParamsFromUrl.time && newSearchParamsFromUrl.time.isValid() &&
          newSearchParamsFromUrl.people && newSearchParamsFromUrl.people > 0) {
        dispatch(searchRestaurants({
          date: newSearchParamsFromUrl.date.format('YYYY-MM-DD'),
          time: newSearchParamsFromUrl.time.format('HH:mm'),
          partySize: newSearchParamsFromUrl.people,
          location: newSearchParamsFromUrl.location ? newSearchParamsFromUrl.location.trim() : (searchParams.location ? searchParams.location.trim() : '')
        }));
      } else if (Object.keys(newSearchParamsFromUrl).length > 0) {
        const dispatchParams = {};
        if (newSearchParamsFromUrl.date && newSearchParamsFromUrl.date.isValid()) dispatchParams.date = newSearchParamsFromUrl.date.format('YYYY-MM-DD');
        if (newSearchParamsFromUrl.time && newSearchParamsFromUrl.time.isValid()) dispatchParams.time = newSearchParamsFromUrl.time.format('HH:mm');
        if (newSearchParamsFromUrl.people && newSearchParamsFromUrl.people > 0) dispatchParams.partySize = newSearchParamsFromUrl.people;
        if (newSearchParamsFromUrl.location) dispatchParams.location = newSearchParamsFromUrl.location.trim();
        else if (searchParams.location) dispatchParams.location = searchParams.location.trim(); 
        
        if(Object.keys(dispatchParams).length > 0) {
            dispatch(searchRestaurants(dispatchParams));
        }
      } else {
         dispatch(searchRestaurants({ location: searchParams.location ? searchParams.location.trim() : '' }));
      }
    } else {
      dispatch(searchRestaurants({
        location: searchParams.location ? searchParams.location.trim() : ''
      }));
    }
  }, [location.search, dispatch]); 

  const handleChange = (name) => (value) => {
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const paramsToSend = {
      date: searchParams.date.format('YYYY-MM-DD'),
    };

    if (searchParams.time) {
      paramsToSend.time = searchParams.time.format('HH:mm');
    }
    if (searchParams.people && searchParams.people > 0) { 
      paramsToSend.partySize = searchParams.people; 
    }
    if (searchParams.location && searchParams.location.trim() !== '') { 
      paramsToSend.location = searchParams.location.trim();
    }

    dispatch(searchRestaurants(paramsToSend));
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, 
          ${alpha('#ffffff', 0.99)}, 
          ${alpha('#ffffff', 0.98)}, 
          ${alpha('#fafbfc', 0.97)})`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 0% 0%, ${alpha(colors.primary.main, 0.015)} 0%, transparent 60%),
            radial-gradient(circle at 100% 0%, ${alpha(colors.secondary.main, 0.015)} 0%, transparent 60%),
            radial-gradient(circle at 100% 100%, ${alpha(colors.primary.main, 0.015)} 0%, transparent 60%),
            radial-gradient(circle at 0% 100%, ${alpha(colors.secondary.main, 0.015)} 0%, transparent 60%)
          `,
          pointerEvents: 'none',
        },
        pt: { xs: 10, sm: 12, md: 14 },
        pb: { xs: 6, sm: 8, md: 10 },
      }}
    >
      <style>
        {`
          @keyframes gradient {
            0% { background-position: 0% 0%, center, center, center, center, 0% 0%; }
            50% { background-position: 0% 0%, center, center, center, center, 100% 100%; }
            100% { background-position: 0% 0%, center, center, center, center, 0% 0%; }
          }
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
            100% { transform: translateY(0px); }
          }
          @font-face {
            font-family: 'Inter';
            src: url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          }
        `}
      </style>
      <Container 
        maxWidth="xl" 
        sx={{ 
          position: 'relative',
          zIndex: 2,
          px: { xs: 2.5, sm: 3, md: 4 },
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <Box 
          sx={{ 
            mb: { xs: 7, md: 9 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            animation: 'float 6s ease-in-out infinite',
          }}
        >
          <Typography
            variant="h1"
            sx={{
              mb: 2,
              fontWeight: 800,
              textShadow: 'none',
              fontSize: { xs: '2.75rem', sm: '3.5rem', md: '4.25rem' },
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              background: `linear-gradient(135deg, 
                ${alpha(colors.primary.main, 0.9)}, 
                ${alpha(colors.secondary.main, 0.9)}, 
                ${alpha(colors.success.main, 0.9)})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundSize: '200% 200%',
              animation: 'gradient 3s ease infinite',
              position: 'relative',
              textAlign: 'center',
              fontFamily: 'Inter, sans-serif',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: { xs: '140px', sm: '160px', md: '180px' },
                height: '3px',
                background: `linear-gradient(90deg, 
                  ${alpha(colors.primary.main, 0.4)}, 
                  ${alpha(colors.secondary.main, 0.4)}, 
                  ${alpha(colors.success.main, 0.4)})`,
                backgroundSize: '200% 200%',
                animation: 'gradient 3s ease infinite',
                borderRadius: '2px',
                boxShadow: '0 2px 8px rgba(33, 150, 243, 0.12)',
              }
            }}
          >
            Book Your Perfect Table
          </Typography>
          <Typography
            variant="h4"
            sx={{
              color: alpha(colors.text.secondary, 0.8),
              textAlign: 'center',
              maxWidth: '720px',
              mx: 'auto',
              fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
              lineHeight: 1.5,
              mb: { xs: 4, md: 6 },
              mt: 4,
              position: 'relative',
              letterSpacing: '0.01em',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '-20px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: { xs: '80px', sm: '100px', md: '120px' },
                height: '2px',
                background: `linear-gradient(90deg, 
                  ${alpha(colors.primary.main, 0.3)}, 
                  ${alpha(colors.secondary.main, 0.3)}, 
                  ${alpha(colors.success.main, 0.3)})`,
                backgroundSize: '200% 200%',
                animation: 'gradient 3s ease infinite',
                borderRadius: '2px',
                boxShadow: '0 2px 8px rgba(33, 150, 243, 0.08)',
                opacity: 0.9,
              }
            }}
          >
            Discover and reserve at the finest restaurants in your area
        </Typography>
        
          <Paper
            elevation={8}
            sx={{
              p: { xs: 2.5, sm: 3, md: 3.5 },
              mb: { xs: 4, md: 5 },
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 24px rgba(33, 150, 243, 0.12)',
              border: '1px solid rgba(33, 150, 243, 0.12)',
              position: 'relative',
              zIndex: 2,
              width: '100%',
              maxWidth: '1000px',
              mx: 'auto',
              overflow: 'hidden',
              '&:hover': {
                boxShadow: '0 12px 32px rgba(33, 150, 243, 0.16)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
        <form onSubmit={handleSearch}>
              <Grid 
                container 
                spacing={2}
                sx={{
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterMoment}>
                <DatePicker
                  label="Date"
                  value={searchParams.date}
                  onChange={handleChange('date')}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <InputAdornment position="start">
                                <CalendarTodayIcon sx={{ 
                                  color: colors.primary.main,
                                  fontSize: { xs: '1.4rem', md: '1.5rem' },
                                  transition: 'all 0.2s ease-in-out',
                                  '&:hover': {
                                    color: colors.secondary.main,
                                    transform: 'scale(1.1)',
                                  }
                                }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              height: { xs: '52px', md: '56px' },
                              fontSize: { xs: '0.95rem', md: '1rem' },
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              fontFamily: 'Inter, sans-serif',
                              '& fieldset': {
                                borderColor: alpha(colors.primary.main, 0.15),
                                borderWidth: '1px',
                              },
                              '&:hover fieldset': {
                                borderColor: alpha(colors.primary.main, 0.3),
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: alpha(colors.primary.main, 0.5),
                                borderWidth: '1.5px',
                                boxShadow: '0 0 0 3px rgba(33, 150, 243, 0.1)',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: { xs: '0.9rem', md: '0.95rem' },
                              transform: 'translate(14px, 14px) scale(1)',
                              '&.Mui-focused, &.MuiFormLabel-filled': {
                                transform: 'translate(14px, -6px) scale(0.85)',
                              },
                            },
                          }}
                        />
                      )}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterMoment}>
                <TimePicker
                  label="Time"
                  value={searchParams.time}
                  onChange={handleChange('time')}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <InputAdornment position="start">
                                <ScheduleIcon sx={{ 
                                  color: colors.secondary.main,
                                  fontSize: { xs: '1.4rem', md: '1.5rem' },
                                  transition: 'all 0.2s ease-in-out',
                                  '&:hover': {
                                    color: colors.success.main,
                                    transform: 'scale(1.1)',
                                  }
                                }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              height: { xs: '52px', md: '56px' },
                              fontSize: { xs: '0.95rem', md: '1rem' },
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              fontFamily: 'Inter, sans-serif',
                              '& fieldset': {
                                borderColor: alpha(colors.secondary.main, 0.15),
                                borderWidth: '1px',
                              },
                              '&:hover fieldset': {
                                borderColor: alpha(colors.secondary.main, 0.3),
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: alpha(colors.secondary.main, 0.5),
                                borderWidth: '1.5px',
                                boxShadow: '0 0 0 3px rgba(0, 188, 212, 0.1)',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: { xs: '0.9rem', md: '0.95rem' },
                              transform: 'translate(14px, 14px) scale(1)',
                              '&.Mui-focused, &.MuiFormLabel-filled': {
                                transform: 'translate(14px, -6px) scale(0.85)',
                              },
                            },
                          }}
                        />
                      )}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                label="Number of People" 
                type="number"
                fullWidth
                value={searchParams.people}
                onChange={(e) => handleChange('people')(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PeopleIcon sx={{ 
                            color: colors.success.main,
                            fontSize: { xs: '1.4rem', md: '1.5rem' },
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              color: colors.primary.main,
                              transform: 'scale(1.1)',
                            }
                          }} />
                        </InputAdornment>
                      ),
                      inputProps: { min: 1 },
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        height: { xs: '52px', md: '56px' },
                        fontSize: { xs: '0.95rem', md: '1rem' },
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        fontFamily: 'Inter, sans-serif',
                        '& fieldset': {
                          borderColor: alpha(colors.success.main, 0.15),
                          borderWidth: '1px',
                        },
                        '&:hover fieldset': {
                          borderColor: alpha(colors.success.main, 0.3),
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: alpha(colors.success.main, 0.5),
                          borderWidth: '1.5px',
                          boxShadow: '0 0 0 3px rgba(76, 175, 80, 0.1)',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: { xs: '0.9rem', md: '0.95rem' },
                        transform: 'translate(14px, 14px) scale(1)',
                        '&.Mui-focused, &.MuiFormLabel-filled': {
                          transform: 'translate(14px, -6px) scale(0.85)',
                        },
                        '&.MuiInputLabel-shrink': {
                          transform: 'translate(14px, -6px) scale(0.85)',
                        },
                      },
                      '& .MuiInputBase-input': {
                        padding: '14px 14px 14px 0',
                      },
                    }}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField
                label="Location"
                fullWidth
                value={searchParams.location}
                onChange={(e) => handleChange('location')(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOnIcon sx={{ 
                            color: colors.primary.main,
                            fontSize: { xs: '1.4rem', md: '1.5rem' },
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              color: colors.secondary.main,
                              transform: 'scale(1.1)',
                            }
                          }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        height: { xs: '52px', md: '56px' },
                        fontSize: { xs: '0.95rem', md: '1rem' },
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        fontFamily: 'Inter, sans-serif',
                        '& fieldset': {
                          borderColor: alpha(colors.primary.main, 0.15),
                          borderWidth: '1px',
                        },
                        '&:hover fieldset': {
                          borderColor: alpha(colors.primary.main, 0.3),
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: alpha(colors.primary.main, 0.5),
                          borderWidth: '1.5px',
                          boxShadow: '0 0 0 3px rgba(33, 150, 243, 0.1)',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: { xs: '0.9rem', md: '0.95rem' },
                        transform: 'translate(14px, 14px) scale(1)',
                        '&.Mui-focused, &.MuiFormLabel-filled': {
                          transform: 'translate(14px, -6px) scale(0.85)',
                        },
                        '&.MuiInputLabel-shrink': {
                          transform: 'translate(14px, -6px) scale(0.85)',
                        },
                      },
                      '& .MuiInputBase-input': {
                        padding: '14px 14px 14px 0',
                      },
                    }}
              />
            </Grid>

            <Grid item xs={12} md={1}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                    sx={{
                      height: { xs: '52px', md: '56px' },
                      borderRadius: '12px',
                      background: `linear-gradient(135deg, 
                        ${colors.primary.main}, 
                        ${colors.secondary.main}, 
                        ${colors.success.main})`,
                      backgroundSize: '200% 200%',
                      animation: 'gradient 3s ease infinite',
                      color: '#ffffff',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: { xs: '0.95rem', md: '1rem' },
                      fontWeight: 600,
                      '&:hover': {
                        background: `linear-gradient(135deg, 
                          ${colors.primary.dark}, 
                          ${colors.secondary.dark}, 
                          ${colors.success.dark})`,
                        backgroundSize: '200% 200%',
                        animation: 'gradient 3s ease infinite',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 20px rgba(33, 150, 243, 0.3)',
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:active': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(33, 150, 243, 0.25)',
                      },
                    }}
                  >
                    <SearchIcon sx={{ 
                      fontSize: { xs: '1.4rem', md: '1.5rem' },
                      transition: 'all 0.2s ease-in-out',
                    }} />
              </Button>
            </Grid>
          </Grid>
        </form>
          </Paper>
        </Box>

        {/* Loading State */}
        {loading && (
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              minHeight: '300px',
              width: '100%',
            }}
          >
            <CircularProgress 
              sx={{ 
                color: colors.primary.main,
                width: '64px !important',
                height: '64px !important',
                animation: 'float 2s ease-in-out infinite',
              }} 
            />
          </Box>
        )}

        {/* Results */}
        {!loading && restaurants?.length > 0 && (
          <Fade in timeout={600}>
            <Box
              sx={{
                width: '100%',
                maxWidth: '1400px',
                mx: 'auto',
                px: { xs: 2, sm: 2.5, md: 3 },
              }}
            >
              <RestaurantList 
                restaurants={restaurants} 
                searchDate={searchParams.date ? searchParams.date.format('YYYY-MM-DD') : ''}
                searchTime={searchParams.time ? searchParams.time.format('HH:mm') : ''}
                searchPeople={searchParams.people.toString()}
              />
            </Box>
          </Fade>
        )}

        {/* No Results State */}
        {!loading && (!restaurants || restaurants.length === 0) && (
          <Box
            sx={{
              textAlign: 'center',
              py: 12,
              px: 3,
              maxWidth: '600px',
              mx: 'auto',
              animation: 'float 6s ease-in-out infinite',
            }}
          >
            <RestaurantIcon
              sx={{
                fontSize: '5rem',
                color: alpha(colors.primary.main, 0.2),
                mb: 3,
                animation: 'float 4s ease-in-out infinite',
              }}
            />
            <Typography
              variant="h3"
              sx={{
                color: alpha(colors.text.primary, 0.9),
                mb: 2,
                fontWeight: 600,
                textShadow: 'none',
                fontFamily: 'Inter, sans-serif',
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                lineHeight: 1.2,
              }}
            >
              No Restaurants Found
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: alpha(colors.text.secondary, 0.8),
                maxWidth: '480px',
                mx: 'auto',
                lineHeight: 1.6,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.4rem' },
              }}
            >
              Try adjusting your search criteria to find available restaurants
            </Typography>
          </Box>
        )}
    </Container>
    </Box>
  );
};

export default RestaurantSearch;
