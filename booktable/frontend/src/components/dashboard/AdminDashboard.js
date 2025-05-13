import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button, CircularProgress, 
  Alert, Box, Dialog, DialogActions, DialogContent, 
  DialogContentText, DialogTitle, Link as RouterLink,
  alpha,
} from '@mui/material';
import { 
  getAllRestaurants, 
  approveRestaurant, 
  deleteRestaurant,
  setRestaurantOnHold,
  clearError as clearRestaurantError 
} from '../../features/restaurants/restaurantSlice';
import { colors } from '../../theme/designSystem';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { 
    restaurants, 
    loading: restaurantsLoading, 
    error: restaurantsError 
  } = useSelector((state) => state.restaurants);

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState(null); // { type: 'approve'/'delete'/'hold', restaurant: {} }

  useEffect(() => {
    dispatch(getAllRestaurants());
    return () => {
      dispatch(clearRestaurantError()); // Clear errors on unmount
    };
  }, [dispatch]);

  const openConfirmDialog = (type, restaurant) => {
    setActionToConfirm({ type, restaurant });
    setConfirmDialogOpen(true);
  };

  const handleConfirmAction = () => {
    if (actionToConfirm && actionToConfirm.restaurant) {
      if (actionToConfirm.type === 'approve') {
        dispatch(approveRestaurant(actionToConfirm.restaurant._id));
      } else if (actionToConfirm.type === 'delete') {
        dispatch(deleteRestaurant(actionToConfirm.restaurant._id));
      } else if (actionToConfirm.type === 'hold') {
        dispatch(setRestaurantOnHold(actionToConfirm.restaurant._id));
      }
    }
    setConfirmDialogOpen(false);
    setActionToConfirm(null);
  };

  if (restaurantsLoading && restaurants.length === 0) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh',
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          pt: { xs: 8, sm: 9, md: 10 },
          background: `linear-gradient(135deg, 
            ${alpha('#ffffff', 0.99)}, 
            ${alpha('#f8fafc', 0.98)}, 
            ${alpha('#f1f5f9', 0.97)})`,
        }}
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, 
          ${alpha('#ffffff', 0.99)}, 
          ${alpha('#f8fafc', 0.98)}, 
          ${alpha('#f1f5f9', 0.97)})`,
        pt: { xs: 8, sm: 9, md: 10 },
        pb: { xs: 4, sm: 5, md: 6 },
        position: 'relative',
      }}
    >
      <Container 
        maxWidth="xl" 
        sx={{ 
          position: 'relative',
          zIndex: 1,
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{
              fontWeight: 700,
              color: colors.text.primary,
              mb: 1,
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
            }}
          >
            Admin Dashboard
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: colors.text.secondary,
              mb: 3,
            }}
          >
            Manage and monitor restaurant approvals and status
          </Typography>

          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              component={RouterLink} 
              to="/admin/analytics" 
              variant="contained" 
              sx={{
                background: `linear-gradient(135deg, 
                  ${colors.secondary.main}, 
                  ${colors.primary.main})`,
                color: '#fff',
                px: 3,
                py: 1.5,
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  background: `linear-gradient(135deg, 
                    ${colors.secondary.dark}, 
                    ${colors.primary.dark})`,
                  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              View Booking Analytics
            </Button>
          </Box>

          {restaurantsError && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(211, 47, 47, 0.1)',
              }}
            >
              {typeof restaurantsError === 'string' ? restaurantsError : restaurantsError.message || 'An unknown error occurred'}
            </Alert>
          )}

          {restaurants.length === 0 && !restaurantsLoading && !restaurantsError && (
            <Alert 
              severity="info" 
              sx={{ 
                mb: 3,
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(2, 136, 209, 0.1)',
              }}
            >
              No restaurants found in the system.
            </Alert>
          )}

          {restaurants.length > 0 && (
            <TableContainer 
              component={Paper} 
              elevation={0}
              sx={{
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                overflow: 'hidden',
              }}
            >
              <Table sx={{ minWidth: 650 }} aria-label="restaurants table">
                <TableHead>
                  <TableRow sx={{ backgroundColor: alpha(colors.primary.main, 0.04) }}>
                    <TableCell sx={{ 
                      py: 2,
                      fontWeight: 600,
                      color: colors.text.primary,
                      fontSize: '0.95rem',
                    }}>Name</TableCell>
                    <TableCell sx={{ 
                      py: 2,
                      fontWeight: 600,
                      color: colors.text.primary,
                      fontSize: '0.95rem',
                    }}>Address</TableCell>
                    <TableCell sx={{ 
                      py: 2,
                      fontWeight: 600,
                      color: colors.text.primary,
                      fontSize: '0.95rem',
                    }}>Cuisine</TableCell>
                    <TableCell align="center" sx={{ 
                      py: 2,
                      fontWeight: 600,
                      color: colors.text.primary,
                      fontSize: '0.95rem',
                    }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {restaurants.map((restaurant) => (
                    <TableRow 
                      key={restaurant._id}
                      sx={{ 
                        '&:nth-of-type(odd)': { 
                          backgroundColor: alpha(colors.primary.main, 0.02) 
                        },
                        '&:hover': {
                          backgroundColor: alpha(colors.primary.main, 0.04),
                        },
                        transition: 'background-color 0.2s ease',
                      }}
                    >
                      <TableCell 
                        component="th" 
                        scope="row"
                        sx={{ 
                          py: 2,
                          fontWeight: 500,
                          color: colors.text.primary,
                        }}
                      >
                        {restaurant.name}
                      </TableCell>
                      <TableCell sx={{ py: 2, color: colors.text.secondary }}>
                        {restaurant.address?.street}, {restaurant.address?.city}
                      </TableCell>
                      <TableCell sx={{ py: 2, color: colors.text.secondary }}>
                        {Array.isArray(restaurant.cuisineType) && restaurant.cuisineType.length > 0 
                          ? restaurant.cuisineType.join(', ') 
                          : restaurant.cuisineType || 'N/A'}
                      </TableCell>
                      <TableCell align="center" sx={{ py: 2 }}>
                        {!restaurant.isApproved && restaurant.isPending && (
                          <Button 
                            variant="contained" 
                            color="success" 
                            size="small"
                            onClick={() => {
                              setActionToConfirm({ type: 'approve', restaurant });
                              setConfirmDialogOpen(true);
                            }}
                            sx={{ 
                              mr: 1,
                              px: 2,
                              py: 0.75,
                              borderRadius: '8px',
                              textTransform: 'none',
                              boxShadow: '0 2px 8px rgba(46, 125, 50, 0.2)',
                              '&:hover': {
                                boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
                                transform: 'translateY(-1px)',
                              },
                              transition: 'all 0.2s ease',
                            }}
                          >
                            Approve
                          </Button>
                        )}
                        {(restaurant.isApproved || (!restaurant.isApproved && !restaurant.isPending)) && (
                          <Button
                            variant="contained"
                            color="warning" 
                            size="small"
                            onClick={() => {
                              setActionToConfirm({ type: 'hold', restaurant });
                              setConfirmDialogOpen(true);
                            }}
                            sx={{ 
                              mr: 1,
                              px: 2,
                              py: 0.75,
                              borderRadius: '8px',
                              textTransform: 'none',
                              boxShadow: '0 2px 8px rgba(237, 108, 2, 0.2)',
                              '&:hover': {
                                boxShadow: '0 4px 12px rgba(237, 108, 2, 0.3)',
                                transform: 'translateY(-1px)',
                              },
                              transition: 'all 0.2s ease',
                            }}
                          >
                            Put on Hold
                          </Button>
                        )}
                        <Button 
                          variant="contained" 
                          color="error" 
                          size="small"
                          onClick={() => {
                            setActionToConfirm({ type: 'delete', restaurant });
                            setConfirmDialogOpen(true);
                          }}
                          sx={{ 
                            px: 2,
                            py: 0.75,
                            borderRadius: '8px',
                            textTransform: 'none',
                            boxShadow: '0 2px 8px rgba(211, 47, 47, 0.2)',
                            '&:hover': {
                              boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)',
                              transform: 'translateY(-1px)',
                            },
                            transition: 'all 0.2s ease',
                          }}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Container>

      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            maxWidth: '400px',
            width: '100%',
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          fontWeight: 600,
          fontSize: '1.25rem',
        }}>
          Confirm Action: {actionToConfirm?.type === 'approve' ? 'Approve Restaurant' : actionToConfirm?.type === 'delete' ? 'Remove Restaurant' : 'Put Restaurant on Hold'}
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <DialogContentText sx={{ 
            color: colors.text.secondary,
            fontSize: '0.95rem',
            lineHeight: 1.6,
          }}>
            Are you sure you want to {actionToConfirm?.type === 'approve' ? 'approve' : actionToConfirm?.type === 'delete' ? 'remove' : 'put on hold'} the restaurant "{actionToConfirm?.restaurant?.name}"?
            {actionToConfirm?.type === 'delete' && " This action cannot be undone."}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setConfirmDialogOpen(false)}
            sx={{ 
              textTransform: 'none',
              px: 2,
              py: 1,
              borderRadius: '8px',
              color: colors.text.secondary,
              '&:hover': {
                backgroundColor: alpha(colors.text.secondary, 0.08),
              },
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmAction} 
            color={actionToConfirm?.type === 'approve' ? 'success' : actionToConfirm?.type === 'delete' ? 'error' : 'warning'} 
            variant="contained"
            sx={{ 
              textTransform: 'none',
              px: 2,
              py: 1,
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            Confirm {actionToConfirm?.type === 'approve' ? 'Approve' : actionToConfirm?.type === 'delete' ? 'Remove' : 'Put on Hold'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
