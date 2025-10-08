import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../contexts/ApiContext';
import { AuthContext } from '../contexts/AuthContext';
import { format } from 'date-fns';
import '../styles/Participants.css';

const Participants = () => {
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
    const fetchParticipantEvents = async () => {
      try {
        setLoading(true);
        const { data, error: apiError } = await api.getUserEvents();
        
        if (apiError) throw new Error(apiError);
        
        const categorized = categorizeEvents(data || []);
        setEvents(categorized);
      } catch (err) {
        console.error('Error fetching participant events:', err);
        setError(err.message || 'Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchParticipantEvents();
  }, [api]);

  const categorizeEvents = (eventList) => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    return eventList.reduce((acc, event) => {
      const eventDate = new Date(event.date || event.eventDate);
      eventDate.setHours(0, 0, 0, 0);
      
      const diffTime = eventDate.getTime() - currentDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        acc.ongoing.push(event);
      } else if (diffDays < 0) {
        acc.completed.push(event);
      } else {
        acc.upcoming.push(event);
      }
      
      return acc;
    }, { ongoing: [], completed: [], upcoming: [] });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const timeParts = timeString.split(':');
    let hours = parseInt(timeParts[0]);
    const minutes = timeParts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  const getParticipantStatus = (status) => {
    switch(status) {
      case 0: 
      case false: 
        return 'Registered';
      case 1: 
      case true: 
        return 'Attended';
      default: 
        return 'Unknown';
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to log out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (eventId) => {
    navigate(`/ticket?eventId=${eventId}`);
  };

  const renderEventCard = (event, type) => (
    <div key={event.eid} className="event-item" data-event-id={event.eid}>
      <div className="event-info">
        <p><strong>{event.ename || 'N/A'}</strong></p>
        <p>Date: {formatDate(event.eventDate)}</p>
        <p>Time: {formatTime(event.eventTime)}</p>
        <p>Location: {event.eventLoc || 'N/A'}</p>
        {event.clubName && <p>Club: {event.clubName}</p>}
        <p>Status: {getParticipantStatus(event.PartStatus)}</p>
      </div>
      <div className="event-actions">
        <button 
          className="event-btn" 
          onClick={() => handleViewDetails(event.eid)}
          data-event-type={type}
        >
          {type === 'completed' ? 'View Certificate' : 'View Details'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="participants-container">
      {/* Navigation and Logout */}
      <div className="nav-container">
        <button 
          className="nav-btn back-btn"
          onClick={() => navigate('/events')}
          disabled={loading}
        >
          <i className="fas fa-arrow-left"></i>
          Back
        </button>
        <button 
          className="nav-btn logout-btn"
          onClick={handleLogout}
          disabled={loading}
        >
          <i className="fas fa-sign-out-alt"></i>
          {loading ? 'Logging out...' : 'Logout'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <section className="hero-section">
        <div className="container">
          <div className="card-grid">
            {/* Ongoing Events */}
            <div className="card" id="ongoing-card">
              <div className="card__background"></div>
              <div className="card__content">
                <h3 className="card__heading">Ongoing Events</h3>
                <div className="card__details">
                  {loading ? (
                    <div className="loading-spinner"></div>
                  ) : events.ongoing.length > 0 ? (
                    events.ongoing.map(event => renderEventCard(event, 'ongoing'))
                  ) : (
                    <div className="event-item">
                      <p><strong>No ongoing events</strong></p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Completed Events */}
            <div className="card" id="completed-card">
              <div className="card__background"></div>
              <div className="card__content">
                <h3 className="card__heading">Completed Events</h3>
                <div className="card__details">
                  {loading ? (
                    <div className="loading-spinner"></div>
                  ) : events.completed.length > 0 ? (
                    events.completed.map(event => renderEventCard(event, 'completed'))
                  ) : (
                    <div className="event-item">
                      <p><strong>No completed events</strong></p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="card" id="upcoming-card">
              <div className="card__background"></div>
              <div className="card__content">
                <h3 className="card__heading">Upcoming Events</h3>
                <div className="card__details">
                  {loading ? (
                    <div className="loading-spinner"></div>
                  ) : events.upcoming.length > 0 ? (
                    events.upcoming.map(event => renderEventCard(event, 'upcoming'))
                  ) : (
                    <div className="event-item">
                      <p><strong>No upcoming events</strong></p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="button-container">
            <button 
              className="participate-btn"
              onClick={() => navigate('/register-event')}
              disabled={loading}
            >
              Participate in other Event
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Participants;
