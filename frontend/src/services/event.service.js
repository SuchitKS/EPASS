import apiRequest from '../config/api.config';

const EventService = {
  // Get all events
  getAllEvents: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/api/events?${queryParams}`, {
      method: 'GET',
    });
  },

  // Get event by ID
  getEventById: async (eventId) => {
    return apiRequest(`/api/events/${eventId}`, {
      method: 'GET',
    });
  },

  // Create a new event
  createEvent: async (eventData) => {
    return apiRequest('/api/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  },

  // Update an existing event
  updateEvent: async (eventId, eventData) => {
    return apiRequest(`/api/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  },

  // Delete an event
  deleteEvent: async (eventId) => {
    return apiRequest(`/api/events/${eventId}`, {
      method: 'DELETE',
    });
  },

  // Register for an event as a participant
  registerForEvent: async (eventId) => {
    return apiRequest(`/api/events/${eventId}/register`, {
      method: 'POST',
    });
  },

  // Volunteer for an event
  volunteerForEvent: async (eventId) => {
    return apiRequest(`/api/events/${eventId}/volunteer`, {
      method: 'POST',
    });
  },

  // Get events by status (participating, organizing, volunteering)
  getMyEvents: async (type = 'participating') => {
    return apiRequest(`/api/me/events?type=${type}`, {
      method: 'GET',
    });
  },

  // Mark attendance for an event
  markAttendance: async (eventId, userId) => {
    return apiRequest(`/api/events/${eventId}/attendance`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  // Get event participants
  getEventParticipants: async (eventId) => {
    return apiRequest(`/api/events/${eventId}/participants`, {
      method: 'GET',
    });
  },

  // Get event volunteers
  getEventVolunteers: async (eventId) => {
    return apiRequest(`/api/events/${eventId}/volunteers`, {
      method: 'GET',
    });
  },

  // Upload event image
  uploadEventImage: async (eventId, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    return apiRequest(`/api/events/${eventId}/image`, {
      method: 'POST',
      headers: {
        // Let the browser set the Content-Type with the boundary
      },
      body: formData,
    }, false); // false = don't set Content-Type header
  },

  // Search events
  searchEvents: async (query) => {
    return apiRequest(`/api/events/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
    });
  },

  // Get events by category
  getEventsByCategory: async (categoryId) => {
    return apiRequest(`/api/events/category/${categoryId}`, {
      method: 'GET',
    });
  },
};

export default EventService;
