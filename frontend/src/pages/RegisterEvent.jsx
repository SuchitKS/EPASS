import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../contexts/ApiContext';
import { AuthContext } from '../contexts/AuthContext';
import { format, parseISO, isAfter, isBefore, isToday } from 'date-fns';
import '../styles/RegisterEvent.css';

const RegisterEvent = () => {
  const { api } = useApi();
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [registrationStatus, setRegistrationStatus] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllEvents = async () => {
      try {
        setLoading(true);
        const { data, error: apiError } = await api.getEvents();
        
        if (apiError) throw new Error(apiError);
        
        // Filter out events that have already ended
        const currentDate = new Date();
        const upcomingEvents = (data || []).filter(event => {
          const eventDate = new Date(event.date);
          return isAfter(eventDate, currentDate);
        });
        
        setEvents(upcomingEvents);
        setFilteredEvents(upcomingEvents);
        
        // Check registration status for each event
        const statuses = {};
        const { data: registeredEvents } = await api.getUserEvents();
        
        upcomingEvents.forEach(event => {
          statuses[event._id] = {
            isRegistered: registeredEvents?.some(e => e._id === event._id) || false,
            isOrganizer: event.organizer?._id === user?.id
          };
        });
        
        setRegistrationStatus(statuses);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err.message || 'Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchAllEvents();
  }, [api, user]);

  useEffect(() => {
    let result = [...events];
    
    // Apply filter
    if (filter !== 'all') {
      const currentDate = new Date();
      
      result = result.filter(event => {
        const eventDate = parseISO(event.date);
        
        if (filter === 'today') {
          return isToday(eventDate);
        } else if (filter === 'upcoming') {
          return isAfter(eventDate, currentDate) && !isToday(eventDate);
        } else if (filter === 'past') {
          return isBefore(eventDate, currentDate);
        }
        
        return true;
      });
    }
    
    // Apply search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(event => 
        event.name.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        event.location.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredEvents(result);
  }, [events, filter, searchTerm]);

  const handleRegister = async (eventId) => {
    try {
      setLoading(true);
      const { error: registerError } = await api.registerForEvent(eventId);
      
      if (registerError) throw new Error(registerError);
      
      // Update the registration status
      setRegistrationStatus(prev => ({
        ...prev,
        [eventId]: {
          ...prev[eventId],
          isRegistered: true
        }
      }));
      
      alert('Successfully registered for the event!');
    } catch (err) {
      console.error('Error registering for event:', err);
      alert(err.message || 'Failed to register for event');
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Register for Events</h1>
        <p className="text-gray-600">Find and register for upcoming events</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search events..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-auto">
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Events</option>
            <option value="today">Today</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past Events</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const status = registrationStatus[event._id] || {};
            const isRegistered = status.isRegistered;
            const isOrganizer = status.isOrganizer;
            
            return (
              <div key={event._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{event.name}</h3>
                  
                  <p className="text-sm text-gray-500 mb-4">
                    {event.description?.substring(0, 120)}{event.description?.length > 120 ? '...' : ''}
                  </p>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {format(parseISO(event.date), 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {event.location || 'Location not specified'}
                    </div>
                    {event.capacity && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {event.registeredCount || 0} / {event.capacity} participants
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    {isOrganizer ? (
                      <button
                        className="w-full bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md cursor-not-allowed"
                        disabled
                      >
                        You're the Organizer
                      </button>
                    ) : isRegistered ? (
                      <button
                        className="w-full bg-green-100 text-green-700 font-medium py-2 px-4 rounded-md cursor-not-allowed"
                        disabled
                      >
                        Registered
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRegister(event._id)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                        disabled={loading}
                      >
                        {loading ? 'Registering...' : 'Register Now'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filter !== 'all' 
              ? 'Try adjusting your search or filter to find more events.'
              : 'There are no upcoming events at the moment. Please check back later.'}
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setFilter('all');
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Reset filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterEvent;
