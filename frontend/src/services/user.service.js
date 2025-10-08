import apiRequest from '../config/api.config';

const UserService = {
  // Get user profile by ID
  getUserProfile: async (userId) => {
    return apiRequest(`/api/users/${userId}`, {
      method: 'GET',
    });
  },

  // Update user profile
  updateProfile: async (userId, userData) => {
    return apiRequest(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // Change user password
  changePassword: async (currentPassword, newPassword) => {
    return apiRequest('/api/users/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  // Get user's event history
  getEventHistory: async (userId, type = 'all') => {
    return apiRequest(`/api/users/${userId}/events?type=${type}`, {
      method: 'GET',
    });
  },

  // Get user's certificates
  getCertificates: async (userId) => {
    return apiRequest(`/api/users/${userId}/certificates`, {
      method: 'GET',
    });
  },

  // Download certificate
  downloadCertificate: async (certificateId) => {
    return apiRequest(`/api/certificates/${certificateId}/download`, {
      method: 'GET',
      responseType: 'blob',
    });
  },

  // Update user preferences
  updatePreferences: async (preferences) => {
    return apiRequest('/api/users/me/preferences', {
      method: 'PUT',
      body: JSON.stringify({ preferences }),
    });
  },

  // Upload profile picture
  uploadProfilePicture: async (imageFile) => {
    const formData = new FormData();
    formData.append('profilePicture', imageFile);

    return apiRequest('/api/users/me/profile-picture', {
      method: 'POST',
      headers: {},
      body: formData,
    }, false);
  },

  // Get user notifications
  getNotifications: async () => {
    return apiRequest('/api/users/me/notifications', {
      method: 'GET',
    });
  },

  // Mark notification as read
  markNotificationAsRead: async (notificationId) => {
    return apiRequest(`/api/users/me/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  },

  // Mark all notifications as read
  markAllNotificationsAsRead: async () => {
    return apiRequest('/api/users/me/notifications/read-all', {
      method: 'PATCH',
    });
  },
};

export default UserService;
