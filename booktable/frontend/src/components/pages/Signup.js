import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { register, clearError } from '../../features/auth/authSlice'; 
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Grid,
  Paper,
  Link,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Fade,
  Zoom,
  useTheme,
  alpha,
} from '@mui/material';
import { colors, typography } from '../../theme/designSystem'; 
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const Signup = () => {
  const theme = useTheme();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, error, loading, user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'manager') {
        navigate('/manager/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard'); 
      } else {
        navigate('/dashboard'); 
      }
    }
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, user, navigate, dispatch]); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;

    if (!formData.firstName.trim()) {
      tempErrors.firstName = 'First name is required.';
      isValid = false;
    }
    if (!formData.lastName.trim()) {
      tempErrors.lastName = 'Last name is required.';
      isValid = false;
    }
    if (!formData.email.trim()) {
      tempErrors.email = 'Email is required.';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Email is not valid.';
      isValid = false;
    }
    if (formData.phone.trim() && !/^\+?(\d.*){3,}$/.test(formData.phone)) {
        tempErrors.phone = 'Phone number is not valid.';
        isValid = false;
    }
    if (!formData.password) {
      tempErrors.password = 'Password is required.';
      isValid = false;
    } else if (formData.password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters long.';
      isValid = false;
    }
    if (!formData.confirmPassword) {
      tempErrors.confirmPassword = 'Confirm password is required.';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match.';
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSignup = async (role) => {
    if (validateForm()) {
      const { firstName, lastName, email, phone, password } = formData;
      const registrationData = {
        firstName,
        lastName,
        email,
        phone,
        password,
        role, 
      };
      dispatch(register(registrationData));
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: theme.spacing(3),
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          width: '100%',
          maxWidth: '1100px', 
          minHeight: { xs: 'auto', md: '70vh' }, 
          maxHeight: { xs: '95vh', md: '650px' }, 
          borderRadius: '20px',
          boxShadow: '0 16px 70px rgba(0,0,0,0.4)',
          overflow: 'hidden', 
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Left Side - Decorative */}
        <Fade in timeout={1000}>
          <Box
            sx={{
              width: { xs: '100%', md: '45%' },
              display: { xs: 'none', md: 'flex' }, 
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              background: `linear-gradient(135deg, ${colors.primary.light} 0%, ${colors.primary.dark} 100%)`,
              color: 'white',
              p: 5,
              textAlign: 'center',
              borderTopLeftRadius: { md: '20px' },
              borderBottomLeftRadius: { md: '20px' },
              borderTopRightRadius: { xs: '20px', md: '0px' }, 
              borderBottomRightRadius: { xs: '20px', md: '0px' },
            }}
          >
            <Zoom in timeout={800} style={{ transitionDelay: '200ms' }}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: typography.fontWeight.bold,
                  mb: 2,
                  letterSpacing: '1px',
                  fontSize: { sm: '2.5rem', md: '2.75rem' },
                }}
              >
                Welcome to BookTable!
              </Typography>
            </Zoom>
            <Zoom in timeout={800} style={{ transitionDelay: '400ms' }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: typography.fontWeight.light,
                  mb: 4,
                  lineHeight: 1.7,
                  opacity: 0.9,
                  fontSize: { sm: '1.1rem', md: '1.2rem' },
                }}
              >
                Join our community to easily discover and book tables at your favorite restaurants.
              </Typography>
            </Zoom>
            <Zoom in timeout={800} style={{ transitionDelay: '600ms' }}>
              <Button
                variant="outlined"
                color="inherit"
                component={RouterLink}
                to="/login"
                sx={{
                  borderColor: alpha('#F8F9FA', 0.5),
                  color: '#F8F9FA',
                  fontWeight: typography.fontWeight.medium,
                  fontSize: '1rem',
                  py: 1.2,
                  px: 4,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: alpha('#F8F9FA', 0.1),
                    borderColor: '#F8F9FA',
                    transform: 'scale(1.05)',
                  },
                }}
              >
                Already have an account?
              </Button>
            </Zoom>
          </Box>
        </Fade>

        {/* Right Side - Form */}
        <Fade in timeout={1200} style={{ transitionDelay: '200ms' }}>
          <Box
            sx={{
              width: { xs: '100%', md: '55%' },
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              p: { xs: 2, sm: 3, md: 4 },
              zIndex: 1,
              backgroundColor: alpha(theme.palette.background.paper, 0.97), 
              borderTopRightRadius: { md: '20px' },
              borderBottomRightRadius: { md: '20px' },
              borderTopLeftRadius: { xs: '20px', md: '0px' },
              borderBottomLeftRadius: { xs: '20px', md: '0px' },
            }}
          >
            <Paper
              elevation={0} 
              sx={{
                width: '100%',
                maxWidth: '520px',
                borderRadius: '16px', 
                overflow: 'hidden',
                background: 'transparent', 
              }}
            >
              <Box sx={{ p: { xs: 3, sm: 4, md: 5 }, textAlign: 'center' }}>
                <Zoom in timeout={800} style={{ transitionDelay: '300ms' }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: typography.fontWeight.bold,
                      mb: { xs: 3, md: 4 },
                      color: '#343A40',
                      fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                      letterSpacing: '0.5px',
                    }}
                  >
                    Sign Up for BookTable
                  </Typography>
                </Zoom>

                {/* Form starts here - no onSubmit on the Box */}
                <Box component="form" noValidate sx={{ width: '100%' }}>
                  <Box 
                    sx={{ 
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2.5, 
                    }}
                  >
                    <Grid container spacing={2.5}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          required
                          fullWidth
                          id="firstName"
                          label="First Name"
                          name="firstName"
                          autoComplete="given-name"
                          value={formData.firstName}
                          onChange={handleChange}
                          error={!!errors.firstName}
                          helperText={errors.firstName}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          required
                          fullWidth
                          id="lastName"
                          label="Last Name"
                          name="lastName"
                          autoComplete="family-name"
                          value={formData.lastName}
                          onChange={handleChange}
                          error={!!errors.lastName}
                          helperText={errors.lastName}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          id="email"
                          label="Email Address"
                          name="email"
                          autoComplete="email"
                          value={formData.email}
                          onChange={handleChange}
                          error={!!errors.email}
                          helperText={errors.email}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <EmailIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth 
                          id="phone"
                          label="Phone Number (Optional)"
                          name="phone"
                          autoComplete="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          error={!!errors.phone}
                          helperText={errors.phone}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PhoneIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          name="password"
                          label="Password"
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          autoComplete="new-password"
                          value={formData.password}
                          onChange={handleChange}
                          error={!!errors.password}
                          helperText={errors.password}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LockIcon color="action" />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label="toggle password visibility"
                                  onClick={() => setShowPassword(!showPassword)}
                                  edge="end"
                                >
                                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          name="confirmPassword"
                          label="Confirm Password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          id="confirmPassword"
                          autoComplete="new-password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          error={!!errors.confirmPassword}
                          helperText={errors.confirmPassword}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LockIcon color="action" />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label="toggle confirm password visibility"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  edge="end"
                                >
                                  {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                    </Grid>

                    {error && (
                      <Alert severity="error" sx={{ mt: 1, width: '100%' }}>
                        {typeof error === 'object' ? error.message || JSON.stringify(error) : error}
                      </Alert>
                    )}

                    {/* New Buttons Grid */}
                    <Grid container spacing={2} sx={{ mt: 1.5, mb: 0 }}> 
                      <Grid item xs={12} sm={6}>
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={() => handleSignup('customer')}
                          disabled={loading}
                          sx={{
                            py: 1.5,
                            fontSize: '0.95rem',
                            fontWeight: typography.fontWeight.medium,
                            color: 'white',
                            background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.light} 100%)`,
                            boxShadow: `0 4px 12px ${alpha(colors.primary.main, 0.3)}`,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              background: `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.primary.main} 100%)`,
                              boxShadow: `0 6px 16px ${alpha(colors.primary.main, 0.35)}`,
                              transform: 'translateY(-2px)',
                            },
                            '&:active': {
                              transform: 'translateY(0)',
                              boxShadow: `0 3px 8px ${alpha(colors.primary.main, 0.25)}`,
                            },
                          }}
                        >
                          {loading ? <CircularProgress size={24} color="inherit" /> : 'Signup as Customer'}
                        </Button>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => handleSignup('manager')}
                          disabled={loading}
                          sx={{
                            py: 1.5,
                            fontSize: '0.95rem',
                            fontWeight: typography.fontWeight.medium,
                            borderColor: colors.secondary.main || theme.palette.secondary.main,
                            color: colors.secondary.main || theme.palette.secondary.main,
                            boxShadow: `0 4px 12px ${alpha(colors.secondary.main || theme.palette.secondary.main, 0.2)}`,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              background: alpha(colors.secondary.main || theme.palette.secondary.main, 0.08),
                              borderColor: colors.secondary.dark || theme.palette.secondary.dark,
                              boxShadow: `0 6px 16px ${alpha(colors.secondary.dark || theme.palette.secondary.dark, 0.25)}`,
                              transform: 'translateY(-2px)',
                            },
                            '&:active': {
                              transform: 'translateY(0)',
                              boxShadow: `0 3px 8px ${alpha(colors.secondary.main || theme.palette.secondary.main, 0.2)}`,
                            },
                          }}
                        >
                          {loading ? <CircularProgress size={24} color="inherit" /> : 'Signup as Manager'}
                        </Button>
                      </Grid>
                    </Grid>
                    {/* End of New Buttons Grid */}

                  </Box> 
                </Box> 

                <Box 
                  sx={{ 
                    textAlign: 'center', 
                    mt: 3, 
                    display: { xs: 'block', md: 'none' } 
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Already have an account?{' '}
                    <Link
                      component={RouterLink}
                      to="/login"
                      variant="body2"
                      sx={{
                        fontWeight: typography.fontWeight.medium,
                        color: colors.primary[500],
                        textDecoration: 'none',
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          width: '100%',
                          transform: 'scaleX(0)',
                          height: '2px',
                          bottom: '-2px',
                          left: 0,
                          backgroundColor: colors.primary[500],
                          transformOrigin: 'right',
                          transition: 'transform 0.3s ease',
                        },
                        '&:hover': {
                          color: colors.primary[700], 
                        },
                        '&:hover::after': {
                          transform: 'scaleX(1)',
                          transformOrigin: 'left',
                        },
                      }}
                    >
                      Sign In
                    </Link>
                  </Typography>
                </Box>
              </Box> 
            </Paper>
          </Box> 
        </Fade>
      </Box> 
    </Box> 
  );
};

export default Signup;