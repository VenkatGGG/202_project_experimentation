import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Link,
  InputAdornment,
  Fade,
  Zoom,
  useTheme,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Restaurant as RestaurantIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { login, clearError } from '../../features/auth/authSlice';
import { colors, typography } from '../../theme/designSystem';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const { isAuthenticated, user, error, loading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'manager') {
        navigate('/manager/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, user, navigate, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(login(formData));
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        pt: { xs: 8, md: 10 },
        pb: { xs: 4, md: 6 },
        background: 'linear-gradient(135deg, #e8eaf6 0%, #f5f7ff 100%)',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          // background: 'url("/pattern.png")',
          opacity: 0.05,
          zIndex: 0,
        },
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in timeout={1000}>
          <Box
            sx={{
              textAlign: 'center',
              mb: 4,
              px: { xs: 2, md: 4 },
            }}
          >
            <RestaurantIcon
              sx={{
                fontSize: '4rem',
                color: '#3f51b5',
                mb: 2,
                filter: 'drop-shadow(0 4px 8px rgba(63, 81, 181, 0.2))',
              }}
            />
            <Typography
              variant="h3"
              sx={{
                color: '#3f51b5',
                fontWeight: typography.fontWeight.bold,
                mb: 2,
                fontSize: { xs: '2rem', md: '2.5rem' },
                textShadow: '0 2px 4px rgba(63, 81, 181, 0.1)',
              }}
            >
              Welcome Back
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#455a64',
                mb: 3,
                fontSize: { xs: '1rem', md: '1.1rem' },
                lineHeight: 1.6,
                maxWidth: '600px',
                mx: 'auto',
              }}
            >
              Sign in to access your BookTable account and manage your reservations
            </Typography>
          </Box>
        </Fade>

        <Zoom in timeout={1000}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: '24px',
              background: 'rgba(255, 255, 255, 0.95)',
              boxShadow: '0 8px 32px rgba(63, 81, 181, 0.15)',
              border: '1px solid rgba(63, 81, 181, 0.1)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 40px rgba(63, 81, 181, 0.2)',
              },
            }}
          >
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: '12px',
                  '& .MuiAlert-icon': {
                    color: '#d32f2f',
                  },
                }}
              >
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: '#3f51b5' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    height: '56px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    '& fieldset': {
                      borderColor: 'rgba(63, 81, 181, 0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#3f51b5',
                      boxShadow: '0 0 0 4px rgba(63, 81, 181, 0.04)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#3f51b5',
                      borderWidth: '2px',
                      boxShadow: '0 0 0 4px rgba(63, 81, 181, 0.08)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '0.95rem',
                    color: '#455a64',
                    '&.Mui-focused': {
                      color: '#3f51b5',
                    },
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#3f51b5' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    height: '56px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    '& fieldset': {
                      borderColor: 'rgba(63, 81, 181, 0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#3f51b5',
                      boxShadow: '0 0 0 4px rgba(63, 81, 181, 0.04)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#3f51b5',
                      borderWidth: '2px',
                      boxShadow: '0 0 0 4px rgba(63, 81, 181, 0.08)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '0.95rem',
                    color: '#455a64',
                    '&.Mui-focused': {
                      color: '#3f51b5',
                    },
                  },
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  mt: 2,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)',
                  boxShadow: '0 4px 16px rgba(63, 81, 181, 0.2)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #303f9f 0%, #3949ab 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(63, 81, 181, 0.3)',
                  },
                  '&:disabled': {
                    background: '#e0e0e0',
                    color: '#9e9e9e',
                    transform: 'none',
                    boxShadow: 'none',
                  },
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" sx={{ color: '#455a64' }}>
                Don't have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/register"
                  sx={{
                    color: '#3f51b5',
                    textDecoration: 'none',
                    fontWeight: typography.fontWeight.medium,
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      width: '100%',
                      height: '2px',
                      bottom: -2,
                      left: 0,
                      background: 'linear-gradient(to right, #3f51b5, #5c6bc0)',
                      transform: 'scaleX(0)',
                      transformOrigin: 'right',
                      transition: 'transform 0.3s ease',
                    },
                    '&:hover': {
                      color: '#303f9f',
                      '&::after': {
                        transform: 'scaleX(1)',
                        transformOrigin: 'left',
                      },
                    },
                  }}
                >
                  Sign Up
                </Link>
              </Typography>
            </Box>

            {/* Find Restaurants Button */}
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button
                component={RouterLink}
                to="/search"
                startIcon={<SearchIcon />}
                sx={{
                  color: '#3f51b5',
                  px: 3,
                  py: 1.5,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(63, 81, 181, 0.15), rgba(92, 107, 192, 0.15))',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 4px 20px rgba(63, 81, 181, 0.15)',
                  border: '1px solid rgba(63, 81, 181, 0.2)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(63, 81, 181, 0.25), rgba(92, 107, 192, 0.25))',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 24px rgba(63, 81, 181, 0.25)',
                  },
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                Find Restaurants
              </Button>
            </Box>
          </Paper>
        </Zoom>
      </Container>
    </Box>
  );
};

export default Login;
