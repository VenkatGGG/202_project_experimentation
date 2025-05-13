import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  Zoom,
  Paper,
  Stack,
  TextField,
  InputAdornment,
  alpha
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import RateReviewIcon from '@mui/icons-material/RateReview';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupIcon from '@mui/icons-material/Group';
import { colors } from '../../theme/designSystem';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

const Home = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [numPeople, setNumPeople] = useState(1);

  const getSearchPath = () => {
    const params = new URLSearchParams();
    if (selectedDate) {
      params.append('date', selectedDate.format('YYYY-MM-DD'));
    }
    if (selectedTime) {
      params.append('time', selectedTime.format('HH:mm'));
    }
    params.append('people', numPeople.toString());
    return `/search?${params.toString()}`;
  };

  return (
    <Box sx={{ 
      bgcolor: colors.background.default,
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      overflow: 'hidden'
    }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: 'auto', md: '92vh' },
          minHeight: { xs: '100vh', md: '760px' },
          maxHeight: { md: '920px' },
          // backgroundImage: 'url("/images/hero-bg.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, 
              ${alpha('#dddddd', 0.92)}, 
              ${alpha('#8dd7ff', 0.9)}, 
              ${alpha('#ffffff', 0.88)})`,
            backdropFilter: 'blur(2px)',
            backgroundSize: '200% 200%',
            animation: 'gradient 3s ease infinite',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.12), transparent 40%),
              radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.12), transparent 40%),
              linear-gradient(45deg, rgba(255, 255, 255, 0.06) 0%, transparent 100%)
            `,
            pointerEvents: 'none',
          },
        }}
      >
        <style>
          {`
            @keyframes gradient {
              0% {
                background-position: 0% 50%;
              }
              50% {
                background-position: 100% 50%;
              }
              100% {
                background-position: 0% 50%;
              }
            }
          `}
        </style>
        <Container 
          maxWidth="lg" 
          sx={{ 
            position: 'relative', 
            zIndex: 1,
            py: { xs: 10, md: 12 },
            px: { xs: 2.5, sm: 3, md: 4 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            height: '100%'
          }}
        >
          <Grid 
            container 
            spacing={{ xs: 5, md: 6 }} 
            alignItems="center" 
            justifyContent="center"
            sx={{ 
              minHeight: { xs: 'auto', md: '600px' },
              maxWidth: '1400px',
              mx: 'auto'
            }}
          >
            <Grid item xs={12} md={7} lg={6}>
              <Zoom in={true} style={{ transitionDelay: '100ms' }}>
                <Box sx={{ 
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  mx: 'auto',
                  mb: { xs: 6, md: 7 },
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: { xs: '-2.5rem', md: '-3rem' },
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '35%',
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
                  }
                }}>
                  <Typography
                    variant="h1"
                    sx={{
                      fontWeight: 900,
                      textShadow: '2px 2px 4px rgba(0,0,0,0.06)',
                      fontSize: { xs: '2.75rem', sm: '3.5rem', md: '4rem' },
                      lineHeight: 1.1,
                      letterSpacing: '-0.03em',
                      background: 'linear-gradient(135deg, #4a6572, #546e7a, #4a6572)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundSize: '200% 200%',
                      animation: 'gradient 3s ease infinite',
                      position: 'relative',
                      mb: 2.5,
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: '-12px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: { xs: '160px', md: '180px' },
                        height: '3px',
                        background: 'linear-gradient(90deg, #4a6572, #546e7a, #4a6572)',
                        backgroundSize: '200% 200%',
                        animation: 'gradient 3s ease infinite',
                        borderRadius: '2px',
                        boxShadow: '0 2px 8px rgba(74, 101, 114, 0.12)',
                      }
                    }}
                  >
                    Book Your Perfect Table
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      color: '#546e7a',
                      fontWeight: 500,
                      textShadow: '1px 1px 2px rgba(0,0,0,0.03)',
                      fontSize: { xs: '1.15rem', sm: '1.3rem', md: '1.45rem' },
                      lineHeight: 1.5,
                      maxWidth: { xs: '100%', md: '85%' },
                      mt: 3,
                      position: 'relative',
                      letterSpacing: '0.01em',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '-20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: { xs: '80px', md: '100px' },
                        height: '2px',
                        background: 'linear-gradient(90deg, #4a6572, #546e7a, #4a6572)',
                        backgroundSize: '200% 200%',
                        animation: 'gradient 3s ease infinite',
                        borderRadius: '1px',
                        boxShadow: '0 1px 4px rgba(74, 101, 114, 0.08)',
                        opacity: 0.8,
                      }
                    }}
                  >
                    Find the best restaurants near you
                  </Typography>
                </Box>
              </Zoom>
            </Grid>
            <Grid item xs={12} md={5} lg={6}>
              <Zoom in={true} style={{ transitionDelay: '200ms' }}>
                <Paper
                  elevation={16}
                  sx={{
                    p: { xs: 3.5, sm: 4, md: 4.5 },
                    borderRadius: '24px',
                    background: 'rgba(255, 255, 255, 0.98)',
                    backdropFilter: 'blur(8px)',
                    mx: 'auto',
                    maxWidth: { md: '100%' },
                    transform: 'translateY(0)',
                    border: '1px solid rgba(141, 215, 255, 0.15)',
                    boxShadow: '0 8px 32px rgba(141, 215, 255, 0.08)',
                    '&:hover': {
                      boxShadow: '0 12px 40px rgba(141, 215, 255, 0.12)',
                      transform: 'translateY(-4px)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <Stack spacing={4} alignItems="center">
                    <TextField
                      fullWidth
                      placeholder="Where do you want to dine?"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationOnIcon sx={{ 
                              color: colors.primary.main,
                              fontSize: { xs: '1.4rem', md: '1.5rem' },
                              transition: 'all 0.3s ease-in-out',
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
                          borderRadius: '16px',
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          borderColor: alpha(colors.primary.main, 0.12),
                          height: { xs: '54px', md: '58px' },
                          fontSize: { xs: '1.05rem', md: '1.1rem' },
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 1)',
                            borderColor: alpha(colors.primary.main, 0.25),
                          },
                          '&.Mui-focused': {
                            borderColor: colors.primary.main,
                            boxShadow: '0 0 0 2px rgba(141, 215, 255, 0.08)',
                          },
                        },
                      }}
                    />
                    <LocalizationProvider dateAdapter={AdapterMoment}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <DatePicker
                            label="Date"
                            value={selectedDate}
                            onChange={(newValue) => {
                              setSelectedDate(newValue);
                            }}
                            renderInput={(params) => (
                              <TextField
                                fullWidth
                                {...params}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <CalendarMonthIcon sx={{ 
                                        color: colors.secondary.main,
                                        fontSize: { xs: '1.4rem', md: '1.5rem' },
                                        transition: 'all 0.3s ease-in-out',
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
                                    borderRadius: '16px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    borderColor: alpha(colors.secondary.main, 0.12),
                                    height: { xs: '54px', md: '58px' },
                                    fontSize: { xs: '1.05rem', md: '1.1rem' },
                                    '&:hover': {
                                      backgroundColor: 'rgba(255, 255, 255, 1)',
                                      borderColor: alpha(colors.secondary.main, 0.25),
                                    },
                                    '&.Mui-focused': {
                                      borderColor: colors.secondary.main,
                                      boxShadow: '0 0 0 2px rgba(141, 215, 255, 0.08)',
                                    },
                                  },
                                }}
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TimePicker
                            label="Time"
                            value={selectedTime}
                            onChange={(newValue) => {
                              setSelectedTime(newValue);
                            }}
                            renderInput={(params) => (
                              <TextField
                                fullWidth
                                {...params}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <CalendarMonthIcon sx={{ 
                                        color: colors.secondary.main,
                                        fontSize: { xs: '1.4rem', md: '1.5rem' },
                                        transition: 'all 0.3s ease-in-out',
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
                                    borderRadius: '16px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    borderColor: alpha(colors.secondary.main, 0.12),
                                    height: { xs: '54px', md: '58px' },
                                    fontSize: { xs: '1.05rem', md: '1.1rem' },
                                    '&:hover': {
                                      backgroundColor: 'rgba(255, 255, 255, 1)',
                                      borderColor: alpha(colors.secondary.main, 0.25),
                                    },
                                    '&.Mui-focused': {
                                      borderColor: colors.secondary.main,
                                      boxShadow: '0 0 0 2px rgba(141, 215, 255, 0.08)',
                                    },
                                  },
                                }}
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    </LocalizationProvider>
                    <TextField
                      fullWidth
                      placeholder="How many people?"
                      type="number"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <GroupIcon sx={{ 
                              color: colors.success.main,
                              fontSize: { xs: '1.4rem', md: '1.5rem' },
                              transition: 'all 0.3s ease-in-out',
                              '&:hover': {
                                color: colors.primary.main,
                                transform: 'scale(1.1)',
                              }
                            }} />
                          </InputAdornment>
                        ),
                        inputProps: { min: 1 }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '16px',
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          borderColor: alpha(colors.success.main, 0.12),
                          height: { xs: '54px', md: '58px' },
                          fontSize: { xs: '1.05rem', md: '1.1rem' },
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 1)',
                            borderColor: alpha(colors.success.main, 0.25),
                          },
                          '&.Mui-focused': {
                            borderColor: colors.success.main,
                            boxShadow: '0 0 0 2px rgba(141, 215, 255, 0.08)',
                          },
                        },
                      }}
                      value={numPeople}
                      onChange={(e) => setNumPeople(parseInt(e.target.value, 10) || 1)}
                    />
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<SearchIcon sx={{ fontSize: { xs: '1.4rem', md: '1.5rem' } }} />}
                      component={RouterLink}
                      to={getSearchPath()}
                      sx={{
                        py: 1.75,
                        px: { xs: 4, md: 5 },
                        width: { xs: '100%', sm: 'auto' },
                        minWidth: { xs: '100%', sm: '220px' },
                        borderRadius: '16px',
                        fontSize: { xs: '1.1rem', md: '1.2rem' },
                        fontWeight: 600,
                        letterSpacing: '0.5px',
                        background: `linear-gradient(135deg, 
                          ${colors.primary.main}, 
                          #8dd7ff, 
                          ${colors.success.main})`,
                        backgroundSize: '200% 200%',
                        animation: 'gradient 3s ease infinite',
                        color: '#ffffff',
                        '&:hover': {
                          background: `linear-gradient(135deg, 
                            ${colors.primary.dark}, 
                            #6bc4ff, 
                            ${colors.success.dark})`,
                          backgroundSize: '200% 200%',
                          animation: 'gradient 3s ease infinite',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 24px rgba(141, 215, 255, 0.15)',
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      Find Restaurants
                    </Button>
                  </Stack>
                </Paper>
              </Zoom>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Container 
        maxWidth="lg" 
        sx={{ 
          py: { xs: 8, md: 12 },
          px: { xs: 2.5, sm: 3, md: 4 }
        }}
      >
        <Box sx={{ 
          textAlign: 'center', 
          mb: { xs: 6, md: 8 },
          maxWidth: '800px',
          mx: 'auto'
        }}>
          <Typography
            variant="h2"
            sx={{
              mb: 2,
              fontWeight: 800,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              background: `linear-gradient(135deg, 
                ${colors.primary.main}, 
                ${colors.secondary.main}, 
                ${colors.success.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundSize: '200% 200%',
              animation: 'gradient 3s ease infinite',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            How It Works
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: alpha(colors.text.secondary, 0.85),
              maxWidth: '600px',
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.15rem' },
              lineHeight: 1.6,
              fontWeight: 400,
              letterSpacing: '0.01em',
            }}
          >
            Book your perfect dining experience in just a few simple steps
          </Typography>
        </Box>

        <Grid 
          container 
          spacing={{ xs: 3, md: 4 }} 
          justifyContent="center"
          sx={{ 
            maxWidth: '1400px', 
            mx: 'auto',
            '& .MuiGrid-item': {
              display: 'flex',
              justifyContent: 'center'
            }
          }}
        >
          {[
            {
              icon: <SearchIcon sx={{ fontSize: 32 }} />,
              title: 'Find Restaurants',
              description: 'Search for restaurants by location, date, and party size',
              color: colors.primary.main,
            },
            {
              icon: <CalendarMonthIcon sx={{ fontSize: 32 }} />,
              title: 'Instant Booking',
              description: 'Book your table instantly with real-time availability',
              color: colors.secondary.main,
            },
            {
              icon: <RestaurantIcon sx={{ fontSize: 32 }} />,
              title: 'Manage Reservations',
              description: 'View and manage your upcoming reservations',
              color: colors.success.main,
            },
            {
              icon: <RateReviewIcon sx={{ fontSize: 32 }} />,
              title: 'Reviews & Ratings',
              description: 'Read and write reviews to help others discover great places',
              color: colors.primary.main,
            },
          ].map((step, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
              <Card
                sx={{
                    width: { xs: '100%', sm: '280px', md: '300px' },
                    height: { xs: '280px', sm: '300px', md: '320px' },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                    p: { xs: 3, md: 3.5 },
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #ffffff, #f8faff)',
                    boxShadow: '0 4px 24px rgba(33, 150, 243, 0.08)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '1px solid rgba(33, 150, 243, 0.08)',
                    position: 'relative',
                    overflow: 'hidden',
                    mx: 'auto',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: `linear-gradient(90deg, ${step.color}, ${alpha(step.color, 0.6)})`,
                      opacity: 0,
                      transition: 'opacity 0.3s ease-in-out',
                    },
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 12px 40px rgba(33, 150, 243, 0.15)',
                      background: 'linear-gradient(135deg, #ffffff, #f0f7ff)',
                      '&::before': {
                        opacity: 1,
                      },
                      '& .step-icon': {
                        transform: 'scale(1.1) rotate(5deg)',
                        background: `linear-gradient(135deg, ${step.color}, ${alpha(step.color, 0.8)})`,
                        boxShadow: `0 8px 24px ${alpha(step.color, 0.2)}`,
                      },
                      '& .step-title': {
                        background: `linear-gradient(135deg, ${step.color}, ${alpha(step.color, 0.8)})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      },
                    },
                  }}
                >
                  <Box
                    className="step-icon"
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3,
                      mt: 1,
                      background: `linear-gradient(135deg, ${alpha(step.color, 0.1)}, ${alpha(step.color, 0.15)})`,
                      color: step.color,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      flexShrink: 0,
                    }}
                  >
                    {step.icon}
                </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    flex: 1,
                    justifyContent: 'center',
                    width: '100%',
                    gap: 2,
                    px: 1.5,
                    py: 0.5
                  }}>
                    <Typography
                      className="step-title"
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: '1.1rem', md: '1.2rem' },
                        color: step.color,
                        letterSpacing: '-0.01em',
                        lineHeight: 1.3,
                        transition: 'all 0.3s ease-in-out',
                        mb: 0.5
                      }}
                    >
                      {step.title}
                  </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: alpha(colors.text.secondary, 0.85),
                        lineHeight: 1.6,
                        fontSize: { xs: '0.95rem', md: '1rem' },
                        fontWeight: 400,
                        letterSpacing: '0.01em',
                        maxWidth: '240px',
                        mx: 'auto'
                      }}
                    >
                      {step.description}
                  </Typography>
                  </Box>
              </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background: `linear-gradient(135deg, 
            ${alpha(colors.primary.main, 0.03)}, 
            ${alpha(colors.secondary.main, 0.03)}, 
            ${alpha(colors.success.main, 0.03)})`,
          backgroundSize: '200% 200%',
          animation: 'gradient 3s ease infinite',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(33, 150, 243, 0.1), transparent)',
          }
        }}
      >
        <Container 
          maxWidth="lg"
          sx={{ 
            px: { xs: 2.5, sm: 3, md: 4 },
            position: 'relative'
          }}
        >
          <Grid 
            container 
            spacing={4} 
            justifyContent="center"
            sx={{ maxWidth: '1000px', mx: 'auto' }}
          >
            <Grid item xs={12} md={8} lg={7}>
              <Box sx={{ 
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2.5
              }}>
                <Typography
                  variant="h3"
                  sx={{
                    mb: 2,
                    fontWeight: 700,
                    fontSize: { xs: '2rem', sm: '2.25rem', md: '2.5rem' },
                    lineHeight: 1.2,
                    letterSpacing: '-0.02em',
                    background: `linear-gradient(135deg, 
                      ${colors.primary.main}, 
                      ${colors.secondary.main}, 
                      ${colors.success.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundSize: '200% 200%',
                    animation: 'gradient 3s ease infinite',
                  }}
                >
                  Transform Your Dining Experience
          </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: alpha(colors.text.secondary, 0.85),
                    mb: 3,
                    fontWeight: 400,
                    fontSize: { xs: '1rem', md: '1.15rem' },
                    lineHeight: 1.6,
                    maxWidth: '700px',
                  }}
                >
                  Join thousands of food lovers who have discovered their favorite restaurants through BookTable
          </Typography>
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={2.5}
                  justifyContent="center"
                  sx={{ width: '100%', maxWidth: '500px' }}
                >
          <Button
            variant="contained"
                    size="large"
                    component={RouterLink}
                    to="/register"
                    sx={{
                      px: 3.5,
                      py: 1.5,
                      borderRadius: '14px',
                      background: `linear-gradient(135deg, 
                        ${colors.primary.main}, 
                        ${colors.secondary.main}, 
                        ${colors.success.main})`,
                      backgroundSize: '200% 200%',
                      animation: 'gradient 3s ease infinite',
                      color: '#ffffff',
                      fontSize: { xs: '1rem', md: '1.1rem' },
                      fontWeight: 600,
                      letterSpacing: '0.5px',
                      '&:hover': {
                        background: `linear-gradient(135deg, 
                          ${colors.primary.dark}, 
                          ${colors.secondary.dark}, 
                          ${colors.success.dark})`,
                        backgroundSize: '200% 200%',
                        animation: 'gradient 3s ease infinite',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 24px rgba(33, 150, 243, 0.25)',
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    Get Started
                  </Button>
                  <Button
                    variant="outlined"
            size="large"
                    component={RouterLink}
                    to="/restaurants"
                    sx={{
                      px: 3.5,
                      py: 1.5,
                      borderRadius: '14px',
                      borderColor: colors.primary.main,
                      color: colors.primary.main,
                      borderWidth: 1.5,
                      fontSize: { xs: '1rem', md: '1.1rem' },
                      fontWeight: 600,
                      letterSpacing: '0.5px',
                      background: 'transparent',
                      '&:hover': {
                        borderWidth: 1.5,
                        borderColor: colors.secondary.main,
                        color: colors.secondary.main,
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(33, 150, 243, 0.15)',
                        background: alpha(colors.primary.main, 0.04),
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    Explore Restaurants
          </Button>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
