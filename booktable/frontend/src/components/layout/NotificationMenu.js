import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Menu,
  MenuItem,
  Typography,
  Badge,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Box,
  Button,
  Tooltip
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import DraftsIcon from '@mui/icons-material/Drafts'; // Icon for unread
import moment from 'moment';
import { 
  fetchUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from '../../features/notifications/notificationSlice';

const NotificationMenu = ({ anchorEl, open, onClose }) => {
  const dispatch = useDispatch();
  const { items, unreadCount, loading, error } = useSelector((state) => state.notifications);

  useEffect(() => {
    // Fetch notifications when the menu is opened, if not already loading and items are not fresh
    // Or consider fetching when Navbar mounts and isAuthenticated
    if (open && !loading) {
      dispatch(fetchUserNotifications());
    }
  }, [open, dispatch, loading]);

  const handleMarkAsRead = (notificationId) => {
    dispatch(markNotificationAsRead(notificationId));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead());
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        style: {
          maxHeight: 400,
          width: '350px',
          overflow: 'auto',
          padding: '8px 0',
        },
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: '8px 16px' }}>
        <Typography variant="h6" component="div">Notifications</Typography>
        {unreadCount > 0 && (
          <Tooltip title="Mark all as read">
            <IconButton onClick={handleMarkAllAsRead} size="small">
              <MarkEmailReadIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <Divider sx={{ mb: 1 }}/>
      {loading && items.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2}}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ p: 2 }}>{error}</Typography>
      ) : items.length === 0 ? (
        <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>No notifications yet.</Typography>
      ) : (
        <List dense>
          {items.map((notification) => (
            <ListItem 
              key={notification._id}
              button 
              onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
              sx={{
                backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                mb: 0.5,
                borderRadius: 1,
              }}
            >
              <ListItemIcon sx={{ minWidth: '36px' }}>
                {notification.isRead ? <DraftsIcon color="disabled" fontSize="small"/> : <NotificationsIcon color="primary" fontSize="small"/>}
              </ListItemIcon>
              <ListItemText 
                primary={<Typography variant="body2" sx={{fontWeight: notification.isRead ? 'normal' : 'bold'}}>{notification.message}</Typography>}
                secondary={<Typography variant="caption" color="text.secondary">{moment(notification.createdAt).fromNow()}</Typography>}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Menu>
  );
};

export default NotificationMenu;
