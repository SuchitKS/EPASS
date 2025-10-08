import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useApi } from '../contexts/ApiContext';
import '../styles/Events.css';

const Events = () => {
  const { user } = useContext(AuthContext);
  const { api, error } = useApi();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const { data, error: apiError } = await api.getEvents();
        if (apiError) throw apiError;
        setEvents(data || []);
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [api]);

  const handleCardClick = (path) => {
    navigate(path);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name || 'User'}</h1>
        <p className="text-gray-600">Manage your events and participation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Participants Card */}
        <div 
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full flex flex-col"
          onClick={() => handleCardClick('/participants')}
        >
          <div className="p-6 flex-1 flex flex-col">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-600 mb-4">
              <i className="fas fa-calendar-check text-xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Events Participated</h3>
            <p className="text-sm text-gray-500 flex-1">View events you're participating in</p>
            <div className="mt-4 flex items-center text-sm text-blue-600">
              <span>View details</span>
              <i className="fas fa-arrow-right ml-2"></i>
            </div>
          </div>
        </div>

        {/* Organizers Card */}
        <div 
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full flex flex-col"
          onClick={() => handleCardClick('/organizers')}
        >
          <div className="p-6 flex-1 flex flex-col">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-100 text-green-600 mb-4">
              <i className="fas fa-users text-xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Events Organized</h3>
            <p className="text-sm text-gray-500 flex-1">Manage events you're organizing</p>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <span>Manage events</span>
              <i className="fas fa-arrow-right ml-2"></i>
            </div>
          </div>
        </div>

        {/* Register Event Card */}
        <div 
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full flex flex-col"
          onClick={() => handleCardClick('/register-event')}
        >
          <div className="p-6 flex-1 flex flex-col">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-yellow-100 text-yellow-600 mb-4">
              <i className="fas fa-calendar-plus text-xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Register for Events</h3>
            <p className="text-sm text-gray-500 flex-1">Find and register for upcoming events</p>
            <div className="mt-4 flex items-center text-sm text-yellow-600">
              <span>Browse events</span>
              <i className="fas fa-arrow-right ml-2"></i>
            </div>
          </div>
        </div>

        {/* Volunteers Card */}
        <div 
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full flex flex-col"
          onClick={() => handleCardClick('/volunteers')}
        >
          <div className="p-6 flex-1 flex flex-col">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-100 text-purple-600 mb-4">
              <i className="fas fa-hands-helping text-xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Volunteer Work</h3>
            <p className="text-sm text-gray-500 flex-1">View your volunteer activities</p>
            <div className="mt-4 flex items-center text-sm text-purple-600">
              <span>View activities</span>
              <i className="fas fa-arrow-right ml-2"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Events;
