import { createTheme } from '@mui/material/styles';

// Color Tokens
export const colors = {
  // Primary Colors
  primary: {
    main: '#1A237E', // Deep Indigo
    light: '#534BAE',
    dark: '#000051',
    contrast: '#FFFFFF'
  },
  // Secondary Colors
  secondary: {
    main: '#FF6B6B', // Coral Pink
    light: '#FF8E8E',
    dark: '#E64545',
    contrast: '#FFFFFF'
  },
  // Background Colors
  background: {
    default: '#F8F9FA',
    paper: '#FFFFFF',
    dark: '#1A237E'
  },
  // Text Colors
  text: {
    primary: '#2C3E50',
    secondary: '#7F8C8D',
    disabled: '#BDC3C7',
    hint: '#95A5A6'
  },
  // Status Colors
  success: {
    main: '#00BFA5', // Teal
    light: '#1DE9B6',
    dark: '#00897B'
  },
  error: {
    main: '#FF5252', // Bright Red
    light: '#FF8A80',
    dark: '#D32F2F'
  },
  warning: {
    main: '#FFB74D', // Amber
    light: '#FFE082',
    dark: '#F57C00'
  },
  info: {
    main: '#29B6F6', // Light Blue
    light: '#4FC3F7',
    dark: '#0288D1'
  },
  // Gray Scale
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121'
  }
};

// Typography Scale
export const typography = {
  fontFamily: {
    heading: '"Montserrat", "Helvetica", "Arial", sans-serif',
    body: '"Open Sans", "Helvetica", "Arial", sans-serif'
  },
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem'
  },
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2
  }
};

// Spacing Scale
export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
  '4xl': '6rem'
};

// Component Styles
export const components = {
  button: {
    borderRadius: '8px',
    padding: '0.75rem 1.5rem',
    transition: 'all 0.3s ease-in-out'
  },
  card: {
    borderRadius: '16px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease-in-out'
  },
  input: {
    borderRadius: '8px',
    transition: 'all 0.3s ease-in-out'
  }
};

// Animation Keyframes
export const keyframes = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 }
  },
  slideUp: {
    from: { transform: 'translateY(20px)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 }
  },
  scale: {
    from: { transform: 'scale(0.95)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 }
  }
};

// Create Material-UI Theme
export const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary.main,
      light: colors.primary.light,
      dark: colors.primary.dark,
      contrastText: colors.primary.contrast
    },
    secondary: {
      main: colors.secondary.main,
      light: colors.secondary.light,
      dark: colors.secondary.dark,
      contrastText: colors.secondary.contrast
    },
    background: {
      default: colors.background.default,
      paper: colors.background.paper
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary
    },
    error: {
      main: colors.error.main,
      light: colors.error.light,
      dark: colors.error.dark
    },
    warning: {
      main: colors.warning.main,
      light: colors.warning.light,
      dark: colors.warning.dark
    },
    info: {
      main: colors.info.main,
      light: colors.info.light,
      dark: colors.info.dark
    },
    success: {
      main: colors.success.main,
      light: colors.success.light,
      dark: colors.success.dark
    }
  },
  typography: {
    fontFamily: typography.fontFamily.body,
    h1: {
      fontFamily: typography.fontFamily.heading,
      fontWeight: typography.fontWeight.bold,
      fontSize: typography.fontSize['5xl'],
      lineHeight: typography.lineHeight.tight
    },
    h2: {
      fontFamily: typography.fontFamily.heading,
      fontWeight: typography.fontWeight.bold,
      fontSize: typography.fontSize['4xl'],
      lineHeight: typography.lineHeight.tight
    },
    h3: {
      fontFamily: typography.fontFamily.heading,
      fontWeight: typography.fontWeight.semibold,
      fontSize: typography.fontSize['3xl'],
      lineHeight: typography.lineHeight.snug
    },
    h4: {
      fontFamily: typography.fontFamily.heading,
      fontWeight: typography.fontWeight.semibold,
      fontSize: typography.fontSize['2xl'],
      lineHeight: typography.lineHeight.snug
    },
    h5: {
      fontFamily: typography.fontFamily.heading,
      fontWeight: typography.fontWeight.medium,
      fontSize: typography.fontSize.xl,
      lineHeight: typography.lineHeight.normal
    },
    h6: {
      fontFamily: typography.fontFamily.heading,
      fontWeight: typography.fontWeight.medium,
      fontSize: typography.fontSize.lg,
      lineHeight: typography.lineHeight.normal
    },
    body1: {
      fontFamily: typography.fontFamily.body,
      fontSize: typography.fontSize.base,
      lineHeight: typography.lineHeight.relaxed
    },
    body2: {
      fontFamily: typography.fontFamily.body,
      fontSize: typography.fontSize.sm,
      lineHeight: typography.lineHeight.relaxed
    },
    button: {
      fontFamily: typography.fontFamily.body,
      fontWeight: typography.fontWeight.medium,
      fontSize: typography.fontSize.base,
      textTransform: 'none'
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '0.75rem 1.5rem',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }
        },
        contained: {
          '&:hover': {
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 12px rgba(0, 0, 0, 0.15)'
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.primary.main
              }
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.primary.main,
                borderWidth: '2px'
              }
            }
          }
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none'
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.primary.main,
          color: colors.primary.contrast
        }
      }
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(255, 107, 107, 0.1)'
          }
        }
      }
    }
  }
}); 