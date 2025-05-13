import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Container,
  useTheme,
  alpha,
  Avatar,
  Badge,
  useMediaQuery,
  Tooltip,
  Fade,
  Divider,
  Stack
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { logout } from '../../features/auth/authSlice';
import { fetchUserNotifications } from '../../features/notifications/notificationSlice';
import NotificationMenu from './NotificationMenu';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const isNotificationMenuOpen = Boolean(notificationAnchorEl);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserNotifications());
    }
  }, [isAuthenticated, dispatch]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleClose();
    navigate('/');
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const getDashboardLink = () => {
    switch (user?.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'manager':
        return '/manager/dashboard';
      default:
        return '/dashboard';
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{
        background: isScrolled 
          ? '#ffffff'
          : 'transparent',
        boxShadow: isScrolled ? '0 4px 20px rgba(0, 0, 0, 0.08)' : 'none',
        backdropFilter: isScrolled ? 'blur(10px)' : 'none',
        transition: 'all 0.3s ease-in-out',
        borderBottom: isScrolled ? '1px solid rgba(0, 0, 0, 0.08)' : 'none',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar 
          disableGutters 
          sx={{ 
            minHeight: { xs: 64, md: 70 },
            px: { xs: 2, md: 0 },
          }}
        >
          {/* Logo */}
          <Box
          component={RouterLink}
          to="/"
          sx={{
              display: 'flex',
              alignItems: 'center',
            textDecoration: 'none',
              mr: { xs: 2, md: 4 },
              transition: 'all 0.3s ease-in-out',
              position: 'relative',
              '&:hover': {
                transform: 'scale(1.05)',
                '& .logo-icon': {
                  transform: 'rotate(15deg) scale(1.1)',
                  filter: 'drop-shadow(0 0 8px rgba(33, 150, 243, 0.3))',
                },
                '& .logo-text': {
                  background: 'linear-gradient(135deg, #2196f3, #00bcd4, #4caf50)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 20px rgba(33, 150, 243, 0.2)',
                  backgroundSize: '200% 200%',
                  animation: 'gradient 3s ease infinite',
                },
                '&::after': {
                  width: '100%',
                  opacity: 1,
                  background: 'linear-gradient(90deg, #2196f3, #00bcd4, #4caf50)',
                  backgroundSize: '200% 200%',
                  animation: 'gradient 3s ease infinite',
                }
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '-4px',
                left: 0,
                width: '0%',
                height: '2px',
                background: 'linear-gradient(90deg, #2196f3, #00bcd4, #4caf50)',
                backgroundSize: '200% 200%',
                animation: 'gradient 3s ease infinite',
                transition: 'all 0.3s ease-in-out',
                opacity: 0,
                borderRadius: '2px',
              }
            }}
          >
            <RestaurantIcon 
              className="logo-icon"
              sx={{ 
                color: '#2196f3',
                fontSize: { xs: 28, md: 32 },
                mr: 1,
                transition: 'all 0.3s ease-in-out',
                filter: 'drop-shadow(0 2px 4px rgba(33, 150, 243, 0.2))',
                background: 'linear-gradient(135deg, #2196f3, #00bcd4, #4caf50)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundSize: '200% 200%',
                animation: 'gradient 3s ease infinite',
              }} 
            />
            <Typography
              className="logo-text"
              variant="h6"
              sx={{
                fontFamily: theme.typography.fontFamily,
                fontWeight: theme.typography.fontWeightBold,
                background: 'linear-gradient(135deg, #2196f3, #00bcd4, #4caf50)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '.1rem',
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                transition: 'all 0.3s ease-in-out',
                position: 'relative',
                backgroundSize: '200% 200%',
                animation: 'gradient 3s ease infinite',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '-2px',
                  left: '-2px',
                  right: '-2px',
                  bottom: '-2px',
                  background: 'linear-gradient(135deg, #2196f3, #00bcd4, #4caf50)',
                  backgroundSize: '200% 200%',
                  animation: 'gradient 3s ease infinite',
                  opacity: 0,
                  zIndex: -1,
                  borderRadius: '4px',
                  transition: 'opacity 0.3s ease-in-out',
                }
          }}
        >
          BookTable
        </Typography>
          </Box>

          {/* Add the keyframes animation at the component level */}
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

          {/* Navigation Links */}
          <Stack 
            direction="row" 
            spacing={2}
            sx={{ 
              flexGrow: 1, 
              display: { xs: 'none', md: 'flex' }, 
              ml: 4,
            }}
          >
        <Button
          component={RouterLink}
          to="/search"
              startIcon={<SearchIcon sx={{ 
                transition: 'transform 0.3s ease-in-out',
                transform: isActive('/search') ? 'scale(1.1)' : 'scale(1)',
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
                color: isActive('/search') ? '#ffffff' : (isScrolled ? '#ffffff' : '#ffffff'),
              }} />}
              sx={{
                color: isActive('/search') ? '#ffffff' : (isScrolled ? '#ffffff' : '#ffffff'),
                position: 'relative',
                px: 3,
                py: 1.5,
                borderRadius: '12px',
                background: isActive('/search') 
                  ? 'linear-gradient(135deg, #2196f3, #00bcd4, #4caf50)'
                  : (isScrolled 
                    ? 'linear-gradient(135deg, #2196f3, #00bcd4, #4caf50)'
                    : 'linear-gradient(135deg, #2196f3, #00bcd4, #4caf50)'),
                backgroundSize: '200% 200%',
                animation: isActive('/search') ? 'gradient 3s ease infinite' : 'none',
                backdropFilter: 'blur(8px)',
                boxShadow: isActive('/search')
                  ? '0 4px 20px rgba(33, 150, 243, 0.4)'
                  : (isScrolled
                    ? '0 4px 20px rgba(33, 150, 243, 0.4)'
                    : '0 4px 20px rgba(33, 150, 243, 0.4)'),
                border: isScrolled ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.2)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: '12px',
                  background: isActive('/search')
                    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))'
                    : (isScrolled
                      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))'
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))'),
                  opacity: 0.5,
                  transition: 'opacity 0.3s ease-in-out',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  width: isActive('/search') ? '100%' : '30%',
                  height: '2px',
                  bottom: 0,
                  left: '35%',
                  background: isActive('/search')
                    ? 'linear-gradient(90deg, transparent, #ffffff, transparent)'
                    : (isScrolled
                      ? 'linear-gradient(90deg, transparent, #ffffff, transparent)'
                      : 'linear-gradient(90deg, transparent, #ffffff, transparent)'),
                  transition: 'all 0.3s ease-in-out',
                },
                '@keyframes gradient': {
                  '0%': {
                    backgroundPosition: '0% 50%',
                  },
                  '50%': {
                    backgroundPosition: '100% 50%',
                  },
                  '100%': {
                    backgroundPosition: '0% 50%',
                  },
                },
                '&:hover': {
                  transform: 'translateY(-2px)',
                  background: isActive('/search')
                    ? 'linear-gradient(135deg, #1976d2, #0097a7, #388e3c)'
                    : (isScrolled
                      ? 'linear-gradient(135deg, #1976d2, #0097a7, #388e3c)'
                      : 'linear-gradient(135deg, #1976d2, #0097a7, #388e3c)'),
                  backgroundSize: '200% 200%',
                  animation: 'gradient 3s ease infinite',
                  boxShadow: isActive('/search')
                    ? '0 6px 24px rgba(33, 150, 243, 0.5)'
                    : (isScrolled
                      ? '0 6px 24px rgba(33, 150, 243, 0.5)'
                      : '0 6px 24px rgba(33, 150, 243, 0.5)'),
                  color: '#ffffff',
                  '&::before': {
                    opacity: 1,
                  },
                  '&::after': {
                    width: '100%',
                    left: 0,
                  },
                  '& .MuiSvgIcon-root': {
                    transform: 'scale(1.1) rotate(5deg)',
                    color: '#ffffff',
                  },
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                overflow: 'hidden',
                '&:active': {
                  transform: 'translateY(0)',
                  boxShadow: isActive('/search')
                    ? '0 2px 10px rgba(33, 150, 243, 0.4)'
                    : (isScrolled
                      ? '0 2px 10px rgba(33, 150, 243, 0.4)'
                      : '0 2px 10px rgba(33, 150, 243, 0.4)'),
                },
              }}
        >
          Find Restaurants
        </Button>
          </Stack>

          {/* Auth Buttons / User Menu */}
        {!isAuthenticated ? (
            <Stack 
              direction="row" 
              spacing={2}
              sx={{ 
                display: 'flex',
                alignItems: 'center',
              }}
            >
            <Button
              component={RouterLink}
              to="/login"
              variant="outlined"
              sx={{
                color: '#2196f3',
                px: 3,
                py: 1.5,
                borderRadius: '12px',
                border: '2px solid transparent',
                background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #2196f3, #00bcd4, #4caf50) border-box',
                backgroundSize: '200% 200%',
                position: 'relative',
                overflow: 'hidden',
                fontWeight: 600,
                letterSpacing: '0.5px',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(0, 188, 212, 0.1), rgba(76, 175, 80, 0.1))',
                  opacity: 0,
                  transition: 'opacity 0.3s ease-in-out',
                },
                '&:hover': {
                  color: '#1976d2',
                  background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #1976d2, #0097a7, #388e3c) border-box',
                  backgroundSize: '200% 200%',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 20px rgba(33, 150, 243, 0.2)',
                  '&::before': {
                    opacity: 1,
                  },
                },
                '&:active': {
                  transform: 'translateY(0)',
                  boxShadow: '0 2px 10px rgba(33, 150, 243, 0.1)',
                  color: '#1565c0',
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              Login
            </Button>
            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                px: 3,
                py: 1.5,
                background: 'linear-gradient(135deg, #ff4081, #7c4dff, #00b0ff)',
                backgroundSize: '200% 200%',
                animation: 'gradient 3s ease infinite',
                color: '#ffffff',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))',
                  opacity: 0,
                  transition: 'opacity 0.3s ease-in-out',
                },
                '&:hover': {
                  background: 'linear-gradient(135deg, #f50057, #651fff, #0091ea)',
                  backgroundSize: '200% 200%',
                  animation: 'gradient 3s ease infinite',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 24px rgba(255, 64, 129, 0.4)',
                  '&::before': {
                    opacity: 1,
                  },
                },
                '&:active': {
                  transform: 'translateY(0)',
                  boxShadow: '0 2px 10px rgba(255, 64, 129, 0.3)',
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              Sign Up
            </Button>
            </Stack>
          ) : (
            <Stack 
              direction="row" 
              spacing={1}
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
              }}
            >
              <Tooltip title="Notifications" TransitionComponent={Fade} TransitionProps={{ timeout: 600 }}>
                <IconButton 
                  sx={{ 
                    color: '#424242',
                    '&:hover': {
                      backgroundColor: 'rgba(26, 35, 126, 0.08)',
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.3s ease-in-out',
                  }}
                  onClick={handleNotificationMenuOpen}
                >
                  <Badge 
                    badgeContent={unreadCount > 0 ? unreadCount : null} 
                    color="error"
                    sx={{
                      '& .MuiBadge-badge': {
                        boxShadow: '0 0 0 2px white',
                      },
                    }}
                  >
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              <Tooltip title="Account" TransitionComponent={Fade} TransitionProps={{ timeout: 600 }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
                  sx={{
                    color: '#424242',
                    '&:hover': {
                      backgroundColor: 'rgba(26, 35, 126, 0.08)',
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.3s ease-in-out',
                  }}
                >
                  {user?.avatar ? (
                    <Avatar 
                      src={user.avatar} 
                      alt={user.name}
                      sx={{
                        width: 32,
                        height: 32,
                        border: '2px solid #1a237e',
                      }}
                    />
                  ) : (
              <AccountCircle />
                  )}
            </IconButton>
              </Tooltip>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                  vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
                sx={{
                  '& .MuiPaper-root': {
                    background: '#ffffff',
                    borderRadius: '12px',
                    minWidth: 180,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                    mt: 1.5,
                    overflow: 'hidden',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                  },
                }}
            >
              <MenuItem
                onClick={() => {
                  handleClose();
                  navigate(getDashboardLink());
                }}
                  sx={{
                    color: '#424242',
                    '&:hover': {
                      background: 'rgba(26, 35, 126, 0.08)',
                    },
                }}
              >
                Dashboard
              </MenuItem>
                <Divider sx={{ 
                  my: 1, 
                  borderColor: 'rgba(0, 0, 0, 0.08)'
                }} />
                <MenuItem 
                  onClick={handleLogout}
                  sx={{
                    color: '#d32f2f',
                    '&:hover': {
                      background: 'rgba(211, 47, 47, 0.08)',
                    },
                  }}
                >
                  Logout
                </MenuItem>
            </Menu>
            </Stack>
        )}
      </Toolbar>
      </Container>
      {/* Notification Menu Component */}
      <NotificationMenu 
        anchorEl={notificationAnchorEl} 
        open={isNotificationMenuOpen} 
        onClose={handleNotificationMenuClose} 
      />
    </AppBar>
  );
};

export default Navbar;
