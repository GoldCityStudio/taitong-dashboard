import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { notificationService, Notification, CreateNotificationData } from '../services/notificationService';

const NotificationManagementPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [formData, setFormData] = useState<CreateNotificationData>({
    title: '',
    content: '',
    type: 'info',
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getAllNotifications();
      setNotifications(data);
    } catch (error) {
      showSnackbar('Failed to fetch notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenDialog = (notification?: Notification) => {
    if (notification) {
      setEditingNotification(notification);
      setFormData({
        title: notification.title,
        content: notification.content,
        type: notification.type,
      });
    } else {
      setEditingNotification(null);
      setFormData({
        title: '',
        content: '',
        type: 'info',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingNotification(null);
    setFormData({
      title: '',
      content: '',
      type: 'info',
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (editingNotification) {
        await notificationService.updateNotification(editingNotification.id, formData);
        showSnackbar('Notification updated successfully', 'success');
      } else {
        await notificationService.createNotification(formData);
        showSnackbar('Notification created successfully', 'success');
      }
      handleCloseDialog();
      fetchNotifications();
    } catch (error) {
      showSnackbar('Failed to save notification', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await notificationService.deleteNotification(id);
      showSnackbar('Notification deleted successfully', 'success');
      fetchNotifications();
    } catch (error) {
      showSnackbar('Failed to delete notification', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      setLoading(true);
      await notificationService.toggleNotificationStatus(id);
      showSnackbar('Notification status updated', 'success');
      fetchNotifications();
    } catch (error) {
      showSnackbar('Failed to update notification status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info':
        return 'primary';
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NotificationsIcon />
          Notification Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={loading}
        >
          Add Notification
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Content</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notifications.map((notification) => (
              <TableRow key={notification.id}>
                <TableCell>{notification.title}</TableCell>
                <TableCell>{notification.content}</TableCell>
                <TableCell>
                  <Chip
                    label={notification.type}
                    color={getTypeColor(notification.type)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(notification.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Chip
                    label={notification.isActive ? 'Active' : 'Inactive'}
                    color={notification.isActive ? 'success' : 'default'}
                    size="small"
                    onClick={() => handleToggleActive(notification.id)}
                    disabled={loading}
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(notification)}
                    disabled={loading}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(notification.id)}
                    disabled={loading}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingNotification ? 'Edit Notification' : 'Add New Notification'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Title"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={loading}
            />
            <TextField
              label="Content"
              fullWidth
              multiline
              rows={4}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              disabled={loading}
            />
            <TextField
              select
              label="Type"
              fullWidth
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              SelectProps={{
                native: true,
              }}
              disabled={loading}
            >
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="success">Success</option>
              <option value="error">Error</option>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {editingNotification ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NotificationManagementPage; 