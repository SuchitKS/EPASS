import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../contexts/ApiContext';
import { AuthContext } from '../contexts/AuthContext';
import { format } from 'date-fns';
import '../styles/Organizers.css';

const Organizers = () => {
  const { api } = useApi();
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState({
    ongoing: [],
    completed: [],
    upcoming: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrganizedEvents = async () => {
      try {
        setLoading(true);
        const { data, error: apiError } = await api.getOrganizedEvents();
        
        if (apiError) throw new Error(apiError);
        
        const categorized = categorizeEvents(data || []);
        setEvents(categorized);
      } catch (err) {
        console.error('Error fetching organized events:', err);
        setError(err.message || 'Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizedEvents();
  }, [api]);

  const categorizeEvents = (eventList) => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    return eventList.reduce((acc, event) => {
      const eventDate = new Date(event.date || event.eventDate);
      eventDate.setHours(0, 0, 0, 0);
      
      const diffTime = eventDate.getTime() - currentDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        acc.completed.push(event);
      } else if (diffDays === 0) {
        acc.ongoing.push(event);
      } else {
        acc.upcoming.push(event);
      }
      
      return acc;
    }, {
      ongoing: [],
      completed: [],
      upcoming: []
    });
  };

  const handleViewEvent = (eventId) => {
    navigate(`/event/${eventId}`);
  };

  const handleEditEvent = (eventId) => {
    navigate(`/event-form/${eventId}`);
  };

  const handleViewParticipants = (eventId) => {
    navigate(`/event/${eventId}/participants`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Organized Events</h1>
        <p className="text-gray-600">Manage events you're organizing</p>
      </div>

      {/* Ongoing Events */}
      {events.ongoing.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-orange-600">Ongoing Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.ongoing.map((event) => (
              <EventCard 
                key={event._id}
                event={event}
                onView={handleViewEvent}
                onEdit={handleEditEvent}
                onViewParticipants={handleViewParticipants}
                status="ongoing"
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      {events.upcoming.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-green-600">Upcoming Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.upcoming.map((event) => (
              <EventCard 
                key={event._id}
                event={event}
                onView={handleViewEvent}
                onEdit={handleEditEvent}
                onViewParticipants={handleViewParticipants}
                status="upcoming"
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Events */}
      {events.completed.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-600">Past Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.completed.map((event) => (
              <EventCard 
                key={event._id}
                event={event}
                onView={handleViewEvent}
                onEdit={handleEditEvent}
                onViewParticipants={handleViewParticipants}
                status="completed"
              />
            ))}
          </div>
        </div>
      )}

      {events.ongoing.length === 0 && events.upcoming.length === 0 && events.completed.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">You haven't organized any events yet.</p>
          <button
            onClick={() => navigate('/event-form')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
          >
            Create Your First Event
          </button>
        </div>
      )}
    </div>
  );
};

const EventCard = ({ event, onView, onEdit, onViewParticipants, status }) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'ongoing':
        return <span className="px-2 py-1 text-xs font-semibold bg-orange-100 text-orange-800 rounded-full">Ongoing</span>;
      case 'upcoming':
        return <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">Upcoming</span>;
      case 'completed':
        return <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">Completed</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{event.name}</h3>
          {getStatusBadge()}
        </div>
        
        <p className="text-sm text-gray-500 mb-4">
          {event.description?.substring(0, 100)}{event.description?.length > 100 ? '...' : ''}
        </p>
        
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {format(new Date(event.date), 'MMM d, yyyy')}
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {event.location || 'Location not specified'}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => onView(event._id)}
            className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium py-2 px-3 rounded-md transition-colors"
          >
            View
          </button>
          {status !== 'completed' && (
            <button
              onClick={() => onEdit(event._id)}
              className="flex-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 text-sm font-medium py-2 px-3 rounded-md transition-colors"
            >
              Edit
            </button>
          )}
          <button
            onClick={() => onViewParticipants(event._id)}
            className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 text-sm font-medium py-2 px-3 rounded-md transition-colors"
          >
            Participants
          </button>
        </div>
      </div>
    </div>
  );
};

export default Organizers;
