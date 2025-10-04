import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'https://epass-backend.onrender.com';

function RegisterEvent() {
  const navigate = useNavigate();
  const [allEvents, setAllEvents] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadAllEvents();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('Checking auth status...');
      const response = await fetch(`${API_BASE}/api/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        console.log('User not authenticated, redirecting to login');
        navigate('/');
        return false;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const userData = await response.json();
      console.log('User authenticated:', userData);
      return true;
    } catch (error) {
      console.error('Auth check failed:', error);
      navigate('/');
      return false;
    }
  };

  const loadAllEvents = async () => {
    const isAuthenticated = await checkAuthStatus();
    if (!isAuthenticated) {
      return;
    }

    setLoading(true);
    setError(false);

    try {
      const response = await fetch(`${API_BASE}/api/events`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const events = [
        ...data.events.upcoming.map(e => ({ ...e, status: 'upcoming' })),
        ...data.events.ongoing.map(e => ({ ...e, status: 'ongoing' })),
        ...data.events.completed.map(e => ({ ...e, status: 'completed' }))
      ];
      
      setAllEvents(events);
      setLoading(false);
      
    } catch (error) {
      console.error('Error loading events:', error);
      setError(true);
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Time TBA';
    
    const [hours, minutes] = timeString.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString) => {
    const eventDate = new Date(dateString);
    return eventDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const registerForEvent = async (eventId) => {
    try {
      const response = await fetch(`${API_BASE}/api/events/${eventId}/join`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ ' + data.message);
        loadAllEvents();
      } else {
        if (response.status === 401) {
          navigate('/');
          return;
        }
        alert('❌ ' + (data.error || 'Registration failed'));
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      alert('❌ Registration failed. Please try again.');
    }
  };

  const filterEvents = (status) => {
    setCurrentFilter(status);
  };

  const getFilteredEvents = () => {
    if (currentFilter === 'all') {
      return allEvents;
    }
    return allEvents.filter(event => event.status === currentFilter);
  };

  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-800',
    ongoing: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800'
  };

  const filteredEvents = getFilteredEvents();

  return (
    <div style={{
      fontFamily: "'Plus Jakarta Sans', 'Noto Sans', sans-serif",
      background: '#00416A',
      background: '-webkit-linear-gradient(to right, #E4E5E6, #00416A)',
      background: 'linear-gradient(to right, #E4E5E6, #00416A)',
      display: 'flex',
      minHeight: '100vh'
    }}>
      <div style={{ display: 'flex', width: '100%', justifyContent: 'center', padding: '2rem 0' }}>
        <div style={{ width: '100%', maxWidth: '960px', background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '12px', padding: '16px' }}>
            <div style={{ minWidth: '288px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h1 style={{ color: '#121416', fontSize: '32px', fontWeight: 'bold', lineHeight: '1.2' }}>All Events</h1>
              <p style={{ color: '#6a7681', fontSize: '14px', lineHeight: '1.5' }}>Discover and join events happening around you</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => filterEvents('all')}
                style={{
                  minWidth: '84px',
                  maxWidth: '480px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '12px',
                  height: '32px',
                  padding: '0 16px',
                  background: currentFilter === 'all' ? '#00416A' : '#f1f2f4',
                  color: currentFilter === 'all' ? 'white' : '#121416',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: 'none',
                  transition: 'all 0.3s'
                }}
              >
                All
              </button>
              <button 
                onClick={() => filterEvents('upcoming')}
                style={{
                  minWidth: '84px',
                  maxWidth: '480px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '12px',
                  height: '32px',
                  padding: '0 16px',
                  background: currentFilter === 'upcoming' ? '#00416A' : '#f1f2f4',
                  color: currentFilter === 'upcoming' ? 'white' : '#121416',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: 'none',
                  transition: 'all 0.3s'
                }}
              >
                Upcoming
              </button>
              <button 
                onClick={() => filterEvents('ongoing')}
                style={{
                  minWidth: '84px',
                  maxWidth: '480px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '12px',
                  height: '32px',
                  padding: '0 16px',
                  background: currentFilter === 'ongoing' ? '#00416A' : '#f1f2f4',
                  color: currentFilter === 'ongoing' ? 'white' : '#121416',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: 'none',
                  transition: 'all 0.3s'
                }}
              >
                Ongoing
              </button>
              <button 
                onClick={() => filterEvents('completed')}
                style={{
                  minWidth: '84px',
                  maxWidth: '480px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '12px',
                  height: '32px',
                  padding: '0 16px',
                  background: currentFilter === 'completed' ? '#00416A' : '#f1f2f4',
                  color: currentFilter === 'completed' ? 'white' : '#121416',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: 'none',
                  transition: 'all 0.3s'
                }}
              >
                Completed
              </button>
            </div>
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTop: '3px solid #00416A', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <p style={{ marginTop: '8px', color: '#6a7681' }}>Loading events...</p>
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          )}

          {error && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <p style={{ color: '#ef4444', fontWeight: '500' }}>Failed to load events</p>
              <button
                onClick={loadAllEvents}
                style={{
                  marginTop: '8px',
                  minWidth: '84px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '12px',
                  height: '32px',
                  padding: '0 16px',
                  background: '#00416A',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: 'none'
                }}
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && filteredEvents.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <p style={{ color: '#6a7681', fontSize: '18px' }}>No events found</p>
            </div>
          )}

          {!loading && !error && filteredEvents.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {filteredEvents.map(event => {
                const regFee = event.regFee || 0;
                const feeText = regFee > 0 ? `₹${regFee}` : 'Free';

                return (
                  <div key={event.eid} style={{ background: 'white', border: '1px solid #dde1e3', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', transition: 'box-shadow 0.3s' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '12px', padding: '16px' }}>
                      <div style={{ minWidth: '288px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <p style={{ color: '#121416', fontSize: '24px', fontWeight: 'bold', lineHeight: '1.2' }}>{event.ename}</p>
                          <span style={{ 
                            padding: '4px 8px', 
                            borderRadius: '9999px', 
                            fontSize: '12px', 
                            fontWeight: '500',
                            background: event.status === 'upcoming' ? '#dbeafe' : event.status === 'ongoing' ? '#dcfce7' : '#f3f4f6',
                            color: event.status === 'upcoming' ? '#1e40af' : event.status === 'ongoing' ? '#166534' : '#374151',
                            textTransform: 'capitalize'
                          }}>
                            {event.status}
                          </span>
                        </div>
                        <p style={{ color: '#6a7681', fontSize: '14px', lineHeight: '1.5' }}>{event.eventdesc || 'No description available'}</p>
                      </div>
                      {event.status === 'upcoming' && (
                        <button
                          onClick={() => registerForEvent(event.eid)}
                          style={{
                            minWidth: '84px',
                            maxWidth: '480px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '12px',
                            height: '32px',
                            padding: '0 16px',
                            background: '#00416A',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '500',
                            border: 'none',
                            transition: 'all 0.3s'
                          }}
                        >
                          Register
                        </button>
                      )}
                    </div>

                    <h3 style={{ color: '#121416', fontSize: '18px', fontWeight: 'bold', padding: '16px 16px 8px' }}>Event Details</h3>
                    <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '20% 1fr', gap: '0 24px' }}>
                      <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: 'subgrid', borderTop: '1px solid #dde1e3', paddingTop: '20px', paddingBottom: '20px' }}>
                        <p style={{ color: '#6a7681', fontSize: '14px' }}>Date & Time</p>
                        <p style={{ color: '#121416', fontSize: '14px' }}>{formatDate(event.eventDate)}, {formatTime(event.eventTime)}</p>
                      </div>
                      <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: 'subgrid', borderTop: '1px solid #dde1e3', paddingTop: '20px', paddingBottom: '20px' }}>
                        <p style={{ color: '#6a7681', fontSize: '14px' }}>Location</p>
                        <p style={{ color: '#121416', fontSize: '14px' }}>{event.eventLoc || 'Location TBA'}</p>
                      </div>
                      <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: 'subgrid', borderTop: '1px solid #dde1e3', paddingTop: '20px', paddingBottom: '20px' }}>
                        <p style={{ color: '#6a7681', fontSize: '14px' }}>Organizer</p>
                        <p style={{ color: '#121416', fontSize: '14px' }}>{event.organizerName || event.clubName || 'Event Organizer'}</p>
                      </div>
                      <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: 'subgrid', borderTop: '1px solid #dde1e3', paddingTop: '20px', paddingBottom: '20px' }}>
                        <p style={{ color: '#6a7681', fontSize: '14px' }}>Registration Fee</p>
                        <p style={{ color: '#121416', fontSize: '14px' }}>{feeText}</p>
                      </div>
                      {event.maxPart && (
                        <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: 'subgrid', borderTop: '1px solid #dde1e3', paddingTop: '20px', paddingBottom: '20px' }}>
                          <p style={{ color: '#6a7681', fontSize: '14px' }}>Max Participants</p>
                          <p style={{ color: '#121416', fontSize: '14px' }}>{event.maxPart}</p>
                        </div>
                      )}
                      {event.maxVoln && (
                        <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: 'subgrid', borderTop: '1px solid #dde1e3', paddingTop: '20px', paddingBottom: '20px' }}>
                          <p style={{ color: '#6a7681', fontSize: '14px' }}>Max Volunteers</p>
                          <p style={{ color: '#121416', fontSize: '14px' }}>{event.maxVoln}</p>
                        </div>
                      )}
                    </div>

                    <h3 style={{ color: '#121416', fontSize: '18px', fontWeight: 'bold', padding: '16px 16px 8px' }}>About the Event</h3>
                    <div style={{ color: '#121416', fontSize: '16px', padding: '4px 16px 12px' }}>
                      {event.eventdesc || 'Join us for this exciting event! More details will be available soon. Don\'t miss this opportunity to be part of something special.'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ padding: '16px' }}>
            <button 
              onClick={() => navigate(-1)}
              style={{
                minWidth: '84px',
                maxWidth: '480px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '12px',
                height: '32px',
                padding: '0 16px',
                background: '#f1f2f4',
                color: '#121416',
                fontSize: '14px',
                fontWeight: '500',
                border: 'none',
                transition: 'all 0.3s'
              }}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterEvent;