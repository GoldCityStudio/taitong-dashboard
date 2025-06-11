import axios from 'axios';

const API_URL = 'http://localhost:4000/api/notifications';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  createdAt: string;
  isActive: boolean;
}

export interface CreateNotificationData {
  title: string;
  content: string;
  type: Notification['type'];
}

export interface UpdateNotificationData extends CreateNotificationData {}

class NotificationService {
  async getAllNotifications(): Promise<Notification[]> {
    try {
      const response = await api.get('/');
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw this.handleError(error);
    }
  }

  async createNotification(data: CreateNotificationData): Promise<Notification> {
    try {
      const response = await api.post('/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw this.handleError(error);
    }
  }

  async updateNotification(id: string, data: UpdateNotificationData): Promise<Notification> {
    try {
      const response = await api.put(`/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating notification:', error);
      throw this.handleError(error);
    }
  }

  async deleteNotification(id: string): Promise<void> {
    try {
      await api.delete(`/${id}`);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw this.handleError(error);
    }
  }

  async toggleNotificationStatus(id: string): Promise<Notification> {
    try {
      const response = await api.patch(`/${id}/toggle`);
      return response.data;
    } catch (error) {
      console.error('Error toggling notification status:', error);
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED') {
        return new Error('Unable to connect to the server. Please check if the server is running.');
      }
      if (error.response) {
        return new Error(error.response.data.error || 'An error occurred while processing your request.');
      }
      if (error.request) {
        return new Error('No response received from the server.');
      }
    }
    return new Error('An unexpected error occurred.');
  }
}

export const notificationService = new NotificationService(); 