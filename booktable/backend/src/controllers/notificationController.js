const Notification = require('../models/Notification');

// GET /api/notifications - Fetch notifications for the logged-in user
exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 }) // Show newest first
      .limit(50); // Basic pagination, consider more advanced later
    
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    res.status(500).json({ error: 'Error fetching notifications' });
  }
};

// PATCH /api/notifications/:id/read - Mark a specific notification as read
exports.markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id }, // Ensure user owns the notification
      { isRead: true },
      { new: true } // Return the updated document
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found or not owned by user' });
    }
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Error updating notification' });
  }
};

// PATCH /api/notifications/read-all - Mark all unread notifications for the user as read
exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Error updating notifications' });
  }
};
