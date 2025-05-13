import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { store } from './app/store';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';

// Import components
import Navbar from './components/layout/Navbar';
import Home from './components/pages/Home';
import Login from './components/auth/Login';
import Signup from './components/pages/Signup';
import RestaurantSearch from './components/restaurants/RestaurantSearch';
import RestaurantDetails from './components/restaurants/RestaurantDetails';
import UserDashboard from './components/dashboard/UserDashboard';
import ManagerDashboard from './components/dashboard/ManagerDashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';
import AnalyticsDashboard from './components/admin/AnalyticsDashboard';
import PrivateRoute from './components/routing/PrivateRoute';
import { getProfile } from './features/auth/authSlice';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1a237e',
      light: '#534bae',
      dark: '#000051',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0d47a1',
      light: '#5472d3',
      dark: '#002171',
      contrastText: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a237e',
      secondary: '#424242',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    fontWeightBold: 700,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#1a237e',
          boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          },
        },
      },
    },
  },
});

// Helper component to dispatch on mount
const AppInitializer = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Token found on initial load, attempting to get profile...');
      dispatch(getProfile());
    } else {
      console.log('No token found on initial load.');
    }
  }, [dispatch]); // Run once on mount

  return null; // This component doesn't render anything
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <CssBaseline />
          <Router>
            <AppInitializer />
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Signup />} />
              <Route path="/search" element={<RestaurantSearch />} />
              <Route path="/restaurants/:id" element={<RestaurantDetails />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <UserDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/manager/dashboard"
                element={
                  <PrivateRoute role="manager">
                    <ManagerDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <PrivateRoute role="admin">
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />
              {/* New Route for Admin Analytics Dashboard */}
              <Route
                path="/admin/analytics"
                element={
                  <PrivateRoute role="admin">
                    <AnalyticsDashboard />
                  </PrivateRoute>
                }
              />
            </Routes>
          </Router>
        </LocalizationProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
