import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'https://epass-backend.onrender.com';

function VolunteerEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

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

  const showMessage = (text, isError = false) => {
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
      existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isError ? 'error' : 'success'}`;
    messageDiv.textContent = text;

    messageDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 5px;
      color: white;
      font-weight: normal;
      z-index: 1000;
      animation: slideIn 0.3s ease-in-out;
      ${isError ? 'background-color:rgb(225, 108, 95);' : 'background-color:rgb(114, 221, 158);'}
    `;

    if (!document.querySelector('#message-styles')) {
      const style = document.createElement('style');
      style.id = 'message-styles';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(messageDiv);

    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.style.animation = 'slideIn 0.3s ease-in-out reverse';
        setTimeout(() => {
          if (messageDiv.parentNode) {
            messageDiv.remove();
          }
        }, 300);
      }
    }, 5000);
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/events`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        if (response.status === 401) {
          showMessage('Please sign in to view events.', true);
          setTimeout(() => {
            navigate('/');
          }, 2000);
          return;
        }
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const allEvents = [
        ...data.events.ongoing,
        ...data.events.upcoming
      ];

      const eventsWithCounts = await Promise.all(allEvents.map(async event => {
        const countResponse = await fetch(`${API_BASE}/api/events/${event.eid}/volunteer-count`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        const countData = await countResponse.json();
        return { ...event, volunteerCount: countData.count };
      }));

      setEvents(eventsWithCounts);
    } catch (error) {
      console.error('Error fetching events:', error);
      showMessage('Could not load events.', true);
    }
  };

  const handleVolunteer = async (eventId) => {
    try {
      const response = await fetch(`${API_BASE}/api/events/${eventId}/volunteer`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('Successfully volunteered for the event!');
        await fetchEvents();
      } else {
        if (response.status === 401) {
          showMessage('Please sign in to volunteer.', true);
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else {
          showMessage(`Failed to volunteer: ${data.error}`, true);
        }
      }
    } catch (error) {
      console.error('Error volunteering:', error);
      showMessage('Error volunteering for the event.', true);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/signout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        navigate('/');
      } else {
        showMessage('Error logging out. Please try again.', true);
      }
    } catch (error) {
      console.error('Logout error:', error);
      showMessage('Error logging out. Please try again.', true);
    }
  };

  return (
    <div style={{ 
      margin: 0, 
      padding: 0, 
      minHeight: '100vh', 
      fontFamily: 'Montserrat, sans-serif', 
      background: 'linear-gradient(135deg, #667eea, #764ba2)' 
    }}>
      <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <button 
          style={{
            backgroundColor: '#fff',
            color: '#333',
            padding: '0.5rem 1rem',
            borderRadius: '5px',
            border: 'none',
            cursor: 'pointer',
            marginLeft: '10px',
            fontSize: '0.9rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}
          onClick={() => navigate('/volunteers.html')}
        >
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <button 
          style={{
            backgroundColor: '#fff',
            color: '#333',
            padding: '0.5rem 1rem',
            borderRadius: '5px',
            border: 'none',
            cursor: 'pointer',
            marginLeft: '10px',
            fontSize: '0.9rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}
          onClick={handleLogout}
        >
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>

      <section style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '100vh', padding: '2rem 0' }}>
        <div style={{ 
          width: '100%', 
          maxWidth: '600px', 
          backgroundColor: 'rgba(255, 255, 255, 0.1)', 
          backdropFilter: 'blur(10px)', 
          borderRadius: '10px', 
          padding: '2rem', 
          color: '#fff', 
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' 
        }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#fff', fontWeight: 700 }}>Volunteer for Events</h2>
          
          <div style={{ 
            maxHeight: '60vh', 
            overflowY: 'auto', 
            padding: '0.5rem',
            scrollbarWidth: 'thin',
            scrollbarColor: '#667eea #764ba2'
          }}>
            {events.length === 0 ? (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                borderRadius: '8px', 
                padding: '1rem', 
                marginBottom: '1rem' 
              }}>
                <div style={{ flex: 1, marginRight: '1rem' }}>
                  <p style={{ margin: '0.3rem 0', fontSize: '0.95rem' }}>
                    <strong style={{ fontWeight: 700, color: '#e2e2e2' }}>No events available for volunteering</strong>
                  </p>
                </div>
              </div>
            ) : (
              events.map(event => {
                const remainingVolunteers = event.maxVoln - (event.volunteerCount || 0);
                
                return (
                  <div 
                    key={event.eid}
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                      borderRadius: '8px', 
                      padding: '1rem', 
                      marginBottom: '1rem',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                  >
                    <div style={{ flex: 1, marginRight: '1rem' }}>
                      <p style={{ margin: '0.3rem 0', fontSize: '0.95rem' }}>
                        <strong style={{ fontWeight: 700, color: '#e2e2e2' }}>{event.ename || 'N/A'}</strong>
                      </p>
                      <p style={{ margin: '0.3rem 0', fontSize: '0.95rem' }}>Date: {formatDate(event.eventDate)}</p>
                      <p style={{ margin: '0.3rem 0', fontSize: '0.95rem' }}>Time: {formatTime(event.eventTime)}</p>
                      <p style={{ margin: '0.3rem 0', fontSize: '0.95rem' }}>Location: {event.eventLoc || 'N/A'}</p>
                      <p style={{ margin: '0.3rem 0', fontSize: '0.95rem' }}>
                        Volunteers Needed: {remainingVolunteers > 0 ? remainingVolunteers : 0}/{event.maxVoln || 'N/A'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {remainingVolunteers > 0 ? (
                        <button 
                          style={{
                            backgroundColor: '#667eea',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            transition: 'background-color 0.3s'
                          }}
                          onClick={() => handleVolunteer(event.eid)}
                        >
                          Volunteer
                        </button>
                      ) : (
                        <p style={{ color: '#ff4d4d', fontWeight: 'bold', margin: '0.5rem 0' }}>No more volunteers</p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default VolunteerEvents;