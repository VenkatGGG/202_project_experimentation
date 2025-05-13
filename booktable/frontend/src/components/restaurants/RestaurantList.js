import React from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Grid, 
  Typography, 
  Box, 
  Rating, 
  Chip,
  Stack,
  IconButton,
  useTheme,
  alpha,
  Fade,
  Zoom,
  Tooltip,
} from '@mui/material';
import { Link } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { colors, typography } from '../../theme/designSystem';

// Accept searchDate, searchTime, searchPeople props
const RestaurantList = ({ restaurants, searchDate, searchTime, searchPeople }) => {
  const theme = useTheme();
  const [favorites, setFavorites] = React.useState({});
  const [hoveredCard, setHoveredCard] = React.useState(null);

  const toggleFavorite = (id) => {
    setFavorites(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <Grid 
      container 
      spacing={{ xs: 2, sm: 2.5, md: 3 }}
      sx={{
        position: 'relative',
        zIndex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
        fontFamily: 'Inter, sans-serif',
        maxWidth: '1400px',
        mx: 'auto',
        px: { xs: 1, sm: 1.5, md: 2 },
      }}
    >
      {restaurants.map((restaurant, index) => {
        const originalPhotoPath = restaurant.photos?.[0];
        let imageSrc = '/restaurant_pictures/restaurant_6.jpg';

        if (originalPhotoPath) {
          imageSrc = originalPhotoPath.startsWith('http') 
            ? originalPhotoPath 
            : originalPhotoPath.startsWith('/') 
              ? originalPhotoPath 
              : `/restaurant_pictures/${originalPhotoPath}`;
        }

        return (
          <Grid 
            item 
            xs={12} 
            sm={6} 
            lg={4} 
            key={restaurant._id}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'stretch',
              height: { xs: 'auto', sm: '460px' },
              minHeight: { xs: '460px', sm: '460px' },
              maxHeight: { xs: '460px', sm: '460px' },
            }}
          >
            <Zoom 
              in 
              timeout={500} 
              style={{ 
                transitionDelay: `${index * 100}ms`,
                width: '100%',
                maxWidth: '320px',
                minWidth: '320px',
                height: '100%',
              }}
            >
              <Card
                onMouseEnter={() => setHoveredCard(restaurant._id)}
                onMouseLeave={() => setHoveredCard(null)}
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  background: `linear-gradient(135deg, 
                    ${alpha('#ffffff', 0.98)}, 
                    ${alpha('#fafbfc', 0.96)})`,
                  backdropFilter: 'blur(8px)',
                  boxShadow: hoveredCard === restaurant._id
                    ? '0 8px 24px rgba(0,0,0,0.04), 0 0 0 1px rgba(33,150,243,0.06)'
                    : '0 4px 16px rgba(0,0,0,0.03), 0 0 0 1px rgba(33,150,243,0.04)',
                  border: `1px solid ${alpha(colors.primary.main, 0.04)}`,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: hoveredCard === restaurant._id ? 'translateY(-4px)' : 'none',
                  '&:hover': {
                    '& .MuiCardMedia-root': {
                      transform: 'scale(1.03)',
                    },
                    '& .restaurant-name': {
                      background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.primary.light})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    },
                  },
                }}
              >
                <Box sx={{ 
                  position: 'relative', 
                  overflow: 'hidden',
                  height: '200px',
                  flexShrink: 0,
                }}>
                  <CardMedia
                    component="img"
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                      filter: hoveredCard === restaurant._id ? 'brightness(1.02)' : 'brightness(1)',
                    }}
                    image={imageSrc}
                    alt={restaurant.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/restaurant_pictures/restaurant_6.jpg';
                    }}
                  />
                  <IconButton
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFavorite(restaurant._id);
                    }}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      background: alpha('#ffffff', 0.95),
                      backdropFilter: 'blur(4px)',
                      width: 32,
                      height: 32,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      '&:hover': {
                        background: '#ffffff',
                        transform: 'scale(1.1) rotate(5deg)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                      },
                    }}
                  >
                    {favorites[restaurant._id] ? (
                      <FavoriteIcon 
                        sx={{ 
                          color: colors.primary.main,
                          fontSize: '1.1rem',
                          transition: 'all 0.3s ease',
                          animation: 'pulse 1s ease-in-out',
                        }} 
                      />
                    ) : (
                      <FavoriteBorderIcon 
                        sx={{ 
                          color: alpha(colors.text.secondary, 0.6),
                          fontSize: '1.1rem',
                        }} 
                      />
                    )}
                  </IconButton>
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      p: 1.25,
                      background: `linear-gradient(to top, 
                        ${alpha('#000', 0.5)}, 
                        ${alpha('#000', 0.2)}, 
                        transparent)`,
                      transform: hoveredCard === restaurant._id ? 'translateY(0)' : 'translateY(4px)',
                      opacity: hoveredCard === restaurant._id ? 1 : 0.9,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    <Stack 
                      direction="row" 
                      spacing={0.75}
                      sx={{
                        flexWrap: 'wrap',
                        gap: 0.5,
                        justifyContent: 'flex-start',
                      }}
                    >
                      <Chip
                        label={restaurant.cuisineType}
                        size="small"
                        sx={{
                          background: alpha(colors.primary.main, 0.9),
                          color: '#fff',
                          fontSize: '0.7rem',
                          height: 22,
                          fontWeight: 500,
                          letterSpacing: '0.01em',
                          backdropFilter: 'blur(4px)',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 2px 4px rgba(33,150,243,0.1)',
                          '&:hover': {
                            background: colors.primary.main,
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 8px rgba(33,150,243,0.15)',
                          },
                        }}
                      />
                      <Chip
                        label={'$'.repeat(restaurant.costRating || 1)}
                        size="small"
                        sx={{
                          background: alpha(colors.secondary.main, 0.9),
                          color: '#fff',
                          fontSize: '0.7rem',
                          height: 22,
                          fontWeight: 500,
                          letterSpacing: '0.01em',
                          backdropFilter: 'blur(4px)',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 2px 4px rgba(76,175,80,0.1)',
                          '&:hover': {
                            background: colors.secondary.main,
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 8px rgba(76,175,80,0.15)',
                          },
                        }}
                      />
                    </Stack>
                  </Box>
                </Box>
                <CardContent 
                  sx={{ 
                    p: 2.5,
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    background: `linear-gradient(180deg, 
                      ${alpha('#ffffff', 0.95)}, 
                      ${alpha('#fafbfc', 0.98)})`,
                    height: '260px',
                    overflow: 'hidden',
                  }}
                >
                  <Box sx={{ height: '70px' }}>
                    <Typography
                      className="restaurant-name"
                      variant="h5"
                      component="div"
                      sx={{
                        fontWeight: 600,
                        color: alpha(colors.text.primary, 0.9),
                        mb: 1,
                        fontSize: '1.1rem',
                        lineHeight: 1.3,
                        letterSpacing: '-0.01em',
                        transition: 'all 0.3s ease',
                        fontFamily: 'Inter, sans-serif',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        height: '2.6em',
                      }}
                    >
                      {restaurant.name}
                    </Typography>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 0.75,
                        height: '20px',
                      }}
                    >
                      <Rating
                        value={restaurant.averageRating || 0}
                        precision={0.5}
                        readOnly
                        sx={{
                          color: colors.primary.main,
                          fontSize: '1.1rem',
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          color: alpha(colors.text.secondary, 0.75),
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          letterSpacing: '0.01em',
                          fontFamily: 'Inter, sans-serif',
                        }}
                      >
                        ({restaurant.reviewCount || 0})
                      </Typography>
                    </Box>
                  </Box>
                  <Stack 
                    spacing={1.25}
                    sx={{ 
                      height: '80px',
                      justifyContent: 'center',
                    }}
                  >
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: 1,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateX(4px)',
                          '& .MuiSvgIcon-root': {
                            color: colors.primary.main,
                          },
                        },
                      }}
                    >
                      <LocationOnIcon sx={{ 
                        color: alpha(colors.text.secondary, 0.6),
                        fontSize: '18px',
                        mt: 0.25,
                        transition: 'all 0.3s ease',
                      }} />
                      <Typography
                        variant="body2"
                        sx={{
                          color: alpha(colors.text.secondary, 0.75),
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          letterSpacing: '0.01em',
                          lineHeight: 1.4,
                          fontFamily: 'Inter, sans-serif',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {restaurant.address?.street}, {restaurant.address?.city}
                      </Typography>
                    </Box>
                    {restaurant.hours && (
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateX(4px)',
                            '& .MuiSvgIcon-root': {
                              color: colors.primary.main,
                            },
                          },
                        }}
                      >
                        <AccessTimeIcon sx={{ 
                          color: alpha(colors.text.secondary, 0.6),
                          fontSize: '18px',
                          transition: 'all 0.3s ease',
                        }} />
                        <Typography
                          variant="body2"
                          sx={{
                            color: alpha(colors.text.secondary, 0.75),
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            letterSpacing: '0.01em',
                            lineHeight: 1.4,
                            fontFamily: 'Inter, sans-serif',
                          }}
                        >
                          {restaurant.hours.opening} - {restaurant.hours.closing}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                  <Box sx={{ mt: 'auto', pt: 1.5, height: '40px' }}>
                    <Link
                      to={`/restaurants/${restaurant._id}?date=${searchDate}&time=${searchTime}&people=${searchPeople}`}
                      style={{ textDecoration: 'none' }}
                    >
                      <Box
                        sx={{
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '12px',
                          background: `linear-gradient(45deg, 
                            ${colors.primary.main}, 
                            ${colors.primary.light})`,
                          color: '#fff',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          letterSpacing: '0.01em',
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          position: 'relative',
                          overflow: 'hidden',
                          fontFamily: 'Inter, sans-serif',
                          boxShadow: '0 2px 8px rgba(33,150,243,0.15)',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(45deg, rgba(255,255,255,0.1), transparent)',
                            opacity: 0,
                            transition: 'opacity 0.3s ease',
                          },
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 16px rgba(33,150,243,0.2)',
                            '&::before': {
                              opacity: 1,
                            },
                          },
                          '&:active': {
                            transform: 'translateY(0)',
                            boxShadow: '0 2px 8px rgba(33,150,243,0.15)',
                          },
                        }}
                      >
                        View Details
                      </Box>
                    </Link>
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default RestaurantList;