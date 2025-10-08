import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';
import EventService from '../services/event.service';
import UserService from '../services/user.service';

// Create the API context
const ApiContext = createContext(null);

export const ApiProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  // Handle API calls with loading and error states
  const callApi = useCallback(async (apiCall, successMessage = null) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiCall();
      
      if (successMessage) {
        setSuccess(successMessage);
      }
      
      return { data: response, error: null };
    } catch (err) {
      console.error('API Error:', err);
      
      // Handle unauthorized (401) errors
      if (err.status === 401) {
        // Clear auth and redirect to login
        await AuthService.logout();
        navigate('/login', { 
          state: { 
            from: window.location.pathname,
            error: 'Your session has expired. Please log in again.'
          } 
        });
        return { data: null, error: 'Session expired. Please log in again.' };
      }
      
      const errorMessage = err.message || 'An error occurred. Please try again.';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // Clear messages
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  // Wrap service calls with error handling
  const api = {
    // Auth service wrappers
    login: (email, password) => 
      callApi(() => AuthService.login(email, password), 'Login successful!'),
      
    register: (userData) => 
      callApi(() => AuthService.register(userData), 'Registration successful!'),
      
    logout: () => 
      callApi(() => AuthService.logout()),
      
    checkAuth: () => 
      callApi(() => AuthService.checkAuth()),
      
    // Event service wrappers
    getEvents: (filters = {}) => 
      callApi(() => EventService.getAllEvents(filters)),
      
    getEvent: (eventId) => 
      callApi(() => EventService.getEventById(eventId)),
      
    createEvent: (eventData) => 
      callApi(() => EventService.createEvent(eventData), 'Event created successfully!'),
      
    updateEvent: (eventId, eventData) => 
      callApi(() => EventService.updateEvent(eventId, eventData), 'Event updated successfully!'),
      
    deleteEvent: (eventId) => 
      callApi(() => EventService.deleteEvent(eventId), 'Event deleted successfully!'),
      
    registerForEvent: (eventId) => 
      callApi(() => EventService.registerForEvent(eventId), 'Successfully registered for event!'),
      
    volunteerForEvent: (eventId) => 
      callApi(() => EventService.volunteerForEvent(eventId), 'Thank you for volunteering!'),
      
    getMyEvents: (type = 'participating') => 
      callApi(() => EventService.getMyEvents(type)),
      
    markAttendance: (eventId, userId) => 
      callApi(() => EventService.markAttendance(eventId, userId), 'Attendance marked!'),
      
    // User service wrappers
    getUserProfile: (userId) => 
      callApi(() => UserService.getUserProfile(userId)),
      
    updateProfile: (userId, userData) => 
      callApi(() => UserService.updateProfile(userId, userData), 'Profile updated successfully!'),
      
    changePassword: (currentPassword, newPassword) => 
      callApi(() => UserService.changePassword(currentPassword, newPassword), 'Password changed successfully!'),
      
    getEventHistory: (userId, type = 'all') => 
      callApi(() => UserService.getEventHistory(userId, type)),
      
    getCertificates: (userId) => 
      callApi(() => UserService.getCertificates(userId)),
      
    downloadCertificate: (certificateId) => 
      callApi(() => UserService.downloadCertificate(certificateId)),
  };

  // Context value
  const value = {
    api,
    isLoading,
    error,
    success,
    clearMessages,
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
};

// Custom hook to use the API context
export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

export default ApiContext;
