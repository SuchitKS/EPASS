
import React, { useEffect, useState } from 'react';
import './events.css';

export default function VolunteerEvents() {
  const API_BASE = 'https://epass-backend.onrender.com';
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('success');

  // Formatting functions
  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function formatTime(timeString) {
    if (!timeString) return 'N/A';
    const timeParts = timeString.split(':');
    let hours = parseInt(timeParts[0]);
    const minutes = timeParts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  }

  // Show message to user
  function showMessage(text, isError = false) {
    setMessage(text);
    setMessageType(isError ? 'error' : 'success');
    setTimeout(() => {
      setMessage(null);
    }, 5000);
  }

  // Fetch events with volunteer counts
  async function fetchEvents() {
    try {
      const response = await fetch(`${API_BASE}/api/events`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        if (response.status === 401) {
          showMessage('Please sign in to view events.', true);
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
          return [];
        }
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const allEvents = [
        ...data.events.ongoing,
        ...data.events.upcoming
      ];

      // Fetch volunteer counts for each event
      const eventsWithCounts = await Promise.all(allEvents.map(async event => {
        const countResponse = await fetch(`${API_BASE}/api/events/${event.eid}/volunteer-count`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        const countData = await countResponse.json();
        return { ...event, volunteerCount: countData.count };
      }));

      return eventsWithCounts;
    } catch (error) {
      console.error('Error fetching events:', error);
      showMessage('Could not load events.', true);
      return [];
    }
  }

  // Handle volunteer action
  async function handleVolunteer(eventId) {
    try {
      const response = await fetch(`${API_BASE}/api/events/${eventId}/volunteer`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('Successfully volunteered for the event!');
        // Refresh the events list
        setLoading(true);
        setEvents(await fetchEvents());
        setLoading(false);
      } else {
        if (response.status === 401) {
          showMessage('Please sign in to volunteer.', true);
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        } else {
          showMessage(`Failed to volunteer: ${data.error}`, true);
        }
      }
    } catch (error) {
      console.error('Error volunteering:', error);
      showMessage('Error volunteering for the event.', true);
    }
  }

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchEvents().then(evts => {
      if (mounted) {
        setEvents(evts);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  // Back button functionality
  function handleBack() {
    window.location.href = '/volunteers.html';
  }

  // Logout functionality
  async function handleLogout() {
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
        window.location.href = '/';
      } else {
        showMessage('Error logging out. Please try again.', true);
      }
    } catch (error) {
      console.error('Logout error:', error);
      showMessage('Error logging out. Please try again.', true);
    }
  }

  function renderEventsList() {
    if (loading) {
      return <div>Loading events...</div>;
    }
    if (!Array.isArray(events) || events.length === 0) {
      return (
        <div className="event-item">
          <div className="event-info">
            <p><strong>No events available for volunteering</strong></p>
          </div>
        </div>
      );
    }
    return events.map(event => {
      const remainingVolunteers = event.maxVoln - (event.volunteerCount || 0);
      return (
        <div className="event-item" key={event.eid}>
          <div className="event-info">
            <p><strong>{event.ename || 'N/A'}</strong></p>
            <p>Date: {formatDate(event.eventDate)}</p>
            <p>Time: {formatTime(event.eventTime)}</p>
            <p>Location: {event.eventLoc || 'N/A'}</p>
            <p>Volunteers Needed: {remainingVolunteers > 0 ? remainingVolunteers : 0}/{event.maxVoln || 'N/A'}</p>
          </div>
          <div className="event-actions">
            {remainingVolunteers > 0 ? (
              <button className="volunteer-btn" onClick={() => handleVolunteer(event.eid)}>
                Volunteer
              </button>
            ) : (
              <p className="no-volunteers">No more volunteers</p>
            )}
          </div>
        </div>
      );
    });
  }

  return (
    <div>
      {/* Navigation Buttons */}
      <div className="nav-container">
        <button className="nav-btn back-btn" onClick={handleBack}>
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <button className="nav-btn logout-btn" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>
      <section className="hero-section">
        <div className="container">
          <h2>Volunteer for Events</h2>
          <div className="events-list">
            {renderEventsList()}
          </div>
        </div>
      </section>
      {message && (
        <div className={`message ${messageType}`}>{message}</div>
      )}
    </div>
  );
}
