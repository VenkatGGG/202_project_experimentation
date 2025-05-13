import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { searchRestaurants } from '../../features/restaurants/restaurantSlice';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  Paper,
  Rating,
  IconButton,
  Drawer,
  useTheme,
  alpha,
  Fade,
  Zoom,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  useMediaQuery,
  CircularProgress,
  Collapse,
  Tooltip,
  Avatar,
  Badge,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import moment from 'moment';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PeopleIcon from '@mui/icons-material/People';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ScheduleIcon from '@mui/icons-material/Schedule';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { colors, typography, spacing } from '../../theme/designSystem';

const Restaurants = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [favorites, setFavorites] = useState({});
  const [searchExpanded, setSearchExpanded] = useState(false);
  const { restaurants, loading } = useSelector(state => state.restaurants);

  const [searchParams, setSearchParams] = useState({
    date: moment(),
    time: moment().startOf('hour').add(1, 'hour'),
    people: '',
    location: '',
    cuisine: [],
    priceRange: [],
    rating: 4,
  });

  const cuisines = [
    'Italian', 'Japanese', 'Indian', 'Mexican', 'Chinese', 'Thai', 'French', 'Mediterranean'
  ];

  const priceRanges = [
    { label: '$', value: 1 },
    { label: '$$', value: 2 },
    { label: '$$$', value: 3 },
    { label: '$$$$', value: 4 }
  ];

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
      time: searchParams.time.format('HH:mm'),
      partySize: searchParams.people,
      location: searchParams.location.trim(),
      cuisine: searchParams.cuisine,
      priceRange: searchParams.priceRange,
      rating: searchParams.rating,
    };
    dispatch(searchRestaurants(paramsToSend));
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const FilterDrawer = () => (
    <Drawer
      anchor="right"
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 400 },
          background: `linear-gradient(135deg, ${alpha(colors.background.paper, 0.95)}, ${alpha(colors.background.paper, 0.98)})`,
          backdropFilter: 'blur(10px)',
          borderLeft: `1px solid ${alpha(colors.primary.main, 0.1)}`,
          boxShadow: '-8px 0 32px rgba(0,0,0,0.1)',
        }
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography 
          variant="h5" 
          sx={{ 
            mb: 3, 
            color: colors.primary.main,
            fontWeight: typography.fontWeight.bold,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <FilterListIcon sx={{ fontSize: '1.5rem' }} />
          Filters
        </Typography>
        
        <Stack spacing={3}>
          <FormControl fullWidth>
            <InputLabel>Cuisine</InputLabel>
            <Select
              multiple
              value={searchParams.cuisine}
              onChange={(e) => handleChange('cuisine')(e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip 
                      key={value} 
                      label={value}
                      sx={{
                        background: alpha(colors.primary.main, 0.1),
                        color: colors.primary.main,
                        '& .MuiChip-deleteIcon': {
                          color: colors.primary.main,
                          '&:hover': {
                            color: colors.primary.dark,
                          },
                        },
                      }}
                    />
                  ))}
                </Box>
              )}
            >
              {cuisines.map((cuisine) => (
                <MenuItem key={cuisine} value={cuisine}>
                  {cuisine}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box>
            <Typography 
              gutterBottom
              sx={{ 
                color: colors.text.primary,
                fontWeight: typography.fontWeight.medium,
              }}
            >
              Price Range
            </Typography>
            <Stack direction="row" spacing={1}>
              {priceRanges.map((range) => (
                <Chip
                  key={range.value}
                  label={range.label}
                  onClick={() => {
                    const newRange = searchParams.priceRange.includes(range.value)
                      ? searchParams.priceRange.filter(v => v !== range.value)
                      : [...searchParams.priceRange, range.value];
                    handleChange('priceRange')(newRange);
                  }}
                  sx={{
                    background: searchParams.priceRange.includes(range.value)
                      ? colors.primary.main
                      : alpha(colors.primary.main, 0.1),
                    color: searchParams.priceRange.includes(range.value)
                      ? '#fff'
                      : colors.primary.main,
                    '&:hover': {
                      background: searchParams.priceRange.includes(range.value)
                        ? colors.primary.dark
                        : alpha(colors.primary.main, 0.2),
                    },
                    transition: 'all 0.2s ease',
                  }}
                />
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography 
              gutterBottom
              sx={{ 
                color: colors.text.primary,
                fontWeight: typography.fontWeight.medium,
              }}
            >
              Rating
            </Typography>
            <Box sx={{ px: 1 }}>
              <Slider
                value={searchParams.rating}
                onChange={(_, value) => handleChange('rating')(value)}
                step={0.5}
                marks
                min={0}
                max={5}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}★`}
                sx={{
                  color: colors.primary.main,
                  '& .MuiSlider-thumb': {
                    '&:hover, &.Mui-focusVisible': {
                      boxShadow: `0 0 0 8px ${alpha(colors.primary.main, 0.16)}`,
                    },
                  },
                  '& .MuiSlider-valueLabel': {
                    background: colors.primary.main,
                    padding: '4px 8px',
                    borderRadius: '4px',
                  },
                }}
              />
            </Box>
          </Box>

          <Button
            variant="contained"
            fullWidth
            onClick={handleSearch}
            sx={{
              py: 1.5,
              background: `linear-gradient(45deg, ${colors.primary.main}, ${colors.primary.light})`,
              '&:hover': {
                background: `linear-gradient(45deg, ${colors.primary.dark}, ${colors.primary.main})`,
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              },
              transition: 'all 0.3s ease',
              fontSize: '1rem',
              fontWeight: typography.fontWeight.medium,
            }}
          >
            Apply Filters
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(colors.primary.main, 0.03)}, ${alpha(colors.primary.dark, 0.03)})`,
        position: 'relative',
        zIndex: 1,
        pt: { xs: 6, md: 8 },
        pb: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ mb: { xs: 6, md: 8 } }}>
          <Typography
            variant="h2"
            sx={{
              color: colors.primary.main,
              mb: 2,
              fontWeight: typography.fontWeight.bold,
              textAlign: 'center',
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
              lineHeight: 1.2,
              background: `linear-gradient(45deg, ${colors.primary.main}, ${colors.primary.light})`,
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Find Your Perfect Restaurant
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: colors.text.secondary,
              textAlign: 'center',
              maxWidth: '700px',
              mx: 'auto',
              fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
              lineHeight: 1.5,
              mb: { xs: 4, md: 6 },
              px: 2,
            }}
          >
            Discover and book tables at the best restaurants in your area
          </Typography>

          {/* Advanced Search Section */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 2.5, md: 3 },
              mb: { xs: 4, md: 6 },
              borderRadius: '20px',
              background: `linear-gradient(135deg, ${alpha(colors.background.paper, 0.9)}, ${alpha(colors.background.paper, 0.95)})`,
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              border: `1px solid ${alpha(colors.primary.main, 0.08)}`,
              position: 'relative',
              zIndex: 2,
              maxWidth: '1000px',
              mx: 'auto',
              overflow: 'hidden',
            }}
          >
            <form onSubmit={handleSearch}>
              <Grid container spacing={2}>
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
                                <CalendarTodayIcon sx={{ color: colors.primary.main }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              height: '52px',
                              '& fieldset': {
                                borderColor: alpha(colors.primary.main, 0.2),
                              },
                              '&:hover fieldset': {
                                borderColor: colors.primary.main,
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: colors.primary.main,
                                borderWidth: '2px',
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
                                <ScheduleIcon sx={{ color: colors.primary.main }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              height: '52px',
                              '& fieldset': {
                                borderColor: alpha(colors.primary.main, 0.2),
                              },
                              '&:hover fieldset': {
                                borderColor: colors.primary.main,
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: colors.primary.main,
                                borderWidth: '2px',
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
                          <PeopleIcon sx={{ color: colors.primary.main }} />
                        </InputAdornment>
                      ),
                      inputProps: { min: 1 },
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        height: '52px',
                        '& fieldset': {
                          borderColor: alpha(colors.primary.main, 0.2),
                        },
                        '&:hover fieldset': {
                          borderColor: colors.primary.main,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: colors.primary.main,
                          borderWidth: '2px',
                        },
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
                          <LocationOnIcon sx={{ color: colors.primary.main }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        height: '52px',
                        '& fieldset': {
                          borderColor: alpha(colors.primary.main, 0.2),
                        },
                        '&:hover fieldset': {
                          borderColor: colors.primary.main,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: colors.primary.main,
                          borderWidth: '2px',
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={1}>
                  <Stack direction="row" spacing={1} sx={{ height: '100%' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      sx={{
                        height: '52px',
                        borderRadius: '12px',
                        background: `linear-gradient(45deg, ${colors.primary.main}, ${colors.primary.light})`,
                        '&:hover': {
                          background: `linear-gradient(45deg, ${colors.primary.dark}, ${colors.primary.main})`,
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <SearchIcon />
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setDrawerOpen(true)}
                      sx={{
                        height: '52px',
                        borderRadius: '12px',
                        borderColor: alpha(colors.primary.main, 0.2),
                        color: colors.primary.main,
                        '&:hover': {
                          borderColor: colors.primary.main,
                          background: alpha(colors.primary.main, 0.05),
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <FilterListIcon />
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Box>

        {/* Loading State */}
        {loading && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            minHeight: '200px',
          }}>
            <CircularProgress 
              sx={{ 
                color: colors.primary.main,
                width: '48px !important',
                height: '48px !important',
              }} 
            />
          </Box>
        )}

        {/* Restaurant Grid */}
        {!loading && (
          <Grid 
            container 
            spacing={{ xs: 2, sm: 3, md: 4 }}
            sx={{
              position: 'relative',
              zIndex: 1,
              px: { xs: 1, sm: 2 },
            }}
          >
            {restaurants?.map((restaurant) => (
              <Grid item xs={12} sm={6} lg={4} key={restaurant.id}>
                <Fade in timeout={1000}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: '20px',
                      overflow: 'hidden',
                      background: `linear-gradient(135deg, ${alpha(colors.background.paper, 0.9)}, ${alpha(colors.background.paper, 0.95)})`,
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                      border: `1px solid ${alpha(colors.primary.main, 0.08)}`,
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 48px rgba(0,0,0,0.12)',
                      },
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        image={restaurant.image}
                        alt={restaurant.name}
                        sx={{
                          objectFit: 'cover',
                          height: { xs: '200px', sm: '220px', md: '240px' },
                          transition: 'transform 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                          },
                        }}
                      />
                      <IconButton
                        onClick={() => toggleFavorite(restaurant.id)}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          background: alpha(colors.background.paper, 0.9),
                          backdropFilter: 'blur(4px)',
                          width: { xs: '36px', sm: '40px' },
                          height: { xs: '36px', sm: '40px' },
                          '&:hover': {
                            background: colors.background.paper,
                            transform: 'scale(1.1)',
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {favorites[restaurant.id] ? (
                          <FavoriteIcon sx={{ 
                            color: colors.primary.main,
                            fontSize: { xs: '1.25rem', sm: '1.5rem' }
                          }} />
                        ) : (
                          <FavoriteBorderIcon sx={{ 
                            color: colors.text.secondary,
                            fontSize: { xs: '1.25rem', sm: '1.5rem' }
                          }} />
                        )}
                      </IconButton>
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          p: 2,
                          background: `linear-gradient(to top, ${alpha('#000', 0.7)}, transparent)`,
                        }}
                      >
                        <Stack direction="row" spacing={1}>
                          <Chip
                            label={restaurant.cuisine}
                            size="small"
                            sx={{
                              background: alpha(colors.primary.main, 0.9),
                              color: '#fff',
                              fontSize: { xs: '0.75rem', sm: '0.8rem' },
                              height: { xs: '24px', sm: '28px' },
                              backdropFilter: 'blur(4px)',
                            }}
                          />
                          <Chip
                            label={priceRanges[restaurant.priceRange - 1].label}
                            size="small"
                            sx={{
                              background: alpha(colors.secondary.main, 0.9),
                              color: '#fff',
                              fontSize: { xs: '0.75rem', sm: '0.8rem' },
                              height: { xs: '24px', sm: '28px' },
                              backdropFilter: 'blur(4px)',
                            }}
                          />
                        </Stack>
                      </Box>
                    </Box>
                    <CardContent sx={{ 
                      p: { xs: 2, sm: 2.5, md: 3 }, 
                      flexGrow: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                    }}>
                      <Box>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 600,
                            color: colors.text.primary,
                            mb: 1,
                            fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.35rem' },
                            lineHeight: 1.2,
                          }}
                        >
                          {restaurant.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Rating
                            value={restaurant.rating}
                            precision={0.5}
                            readOnly
                            sx={{
                              color: colors.primary.main,
                              fontSize: { xs: '1.25rem', sm: '1.5rem' },
                              '& .MuiRating-iconFilled': {
                                color: colors.primary.main,
                              },
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{ 
                              color: colors.text.secondary, 
                              fontSize: { xs: '0.8rem', sm: '0.85rem' },
                            }}
                          >
                            ({restaurant.reviews})
                          </Typography>
                        </Box>
                      </Box>
                      <Stack spacing={1.5}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOnIcon sx={{ 
                            color: colors.text.secondary, 
                            fontSize: { xs: '18px', sm: '20px' } 
                          }} />
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: colors.text.secondary,
                              fontSize: { xs: '0.8rem', sm: '0.85rem' },
                            }}
                          >
                            {restaurant.location}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTimeIcon sx={{ 
                            color: colors.text.secondary, 
                            fontSize: { xs: '18px', sm: '20px' } 
                          }} />
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: colors.text.secondary,
                              fontSize: { xs: '0.8rem', sm: '0.85rem' },
                            }}
                          >
                            {restaurant.openTime}
                          </Typography>
                        </Box>
                      </Stack>
                      <Typography
                        variant="body2"
                        sx={{
                          color: colors.text.secondary,
                          lineHeight: 1.6,
                          display: { xs: 'none', sm: 'block' },
                          fontSize: { xs: '0.8rem', sm: '0.85rem' },
                          mb: 2,
                        }}
                      >
                        {restaurant.description}
                      </Typography>
                      <Box sx={{ mt: 'auto' }}>
                        <Button
                          component={RouterLink}
                          to={`/restaurants/${restaurant.id}`}
                          variant="contained"
                          fullWidth
                          sx={{
                            py: { xs: 1.25, sm: 1.5 },
                            borderRadius: '12px',
                            background: `linear-gradient(45deg, ${colors.primary.main}, ${colors.primary.light})`,
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                            '&:hover': {
                              background: `linear-gradient(45deg, ${colors.primary.dark}, ${colors.primary.main})`,
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          View Details
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        )}

        {/* No Results State */}
        {!loading && (!restaurants || restaurants.length === 0) && (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              px: 2,
            }}
          >
            <RestaurantIcon
              sx={{
                fontSize: '4rem',
                color: alpha(colors.primary.main, 0.2),
                mb: 2,
              }}
            />
            <Typography
              variant="h5"
              sx={{
                color: colors.text.secondary,
                mb: 1,
                fontWeight: typography.fontWeight.medium,
              }}
            >
              No Restaurants Found
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: colors.text.secondary,
                opacity: 0.8,
                maxWidth: '400px',
                mx: 'auto',
              }}
            >
              Try adjusting your search criteria or filters to find more restaurants
            </Typography>
          </Box>
        )}
      </Container>
      <FilterDrawer />
    </Box>
  );
};

export default Restaurants; 