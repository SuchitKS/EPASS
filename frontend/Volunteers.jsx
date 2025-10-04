
import React, { useEffect, useState } from 'react';
import './volunteers.css';

export default function Volunteers() {
  const API_BASE = 'https://epass-backend.onrender.com';
  const [ongoing, setOngoing] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('success');
  const [loading, setLoading] = useState(true);

  function showMessage(text, isError = false) {
    setMessage(text);
    setMessageType(isError ? 'error' : 'success');
    setTimeout(() => {
      setMessage(null);
    }, 5000);
  }

  async function fetchVolunteerEvents() {
    try {
      const response = await fetch(`${API_BASE}/api/volunteer/events`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        if (response.status === 401) {
          showMessage('Please sign in to view your events.', true);
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
          return { ongoing: [], completed: [], upcoming: [] };
        }
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return data.events || { ongoing: [], completed: [], upcoming: [] };
    } catch (error) {
      console.error('Error fetching volunteer events:', error);
      showMessage('Could not load your events.', true);
      return { ongoing: [], completed: [], upcoming: [] };
    }
  }

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchVolunteerEvents().then(events => {
      if (mounted) {
        setOngoing(events.ongoing || []);
        setCompleted(events.completed || []);
        setUpcoming(events.upcoming || []);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

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

  function handleVolunteerOtherEvent() {
    window.location.href = '/volunteer_events.html';
  }

  function renderEventList(events) {
    if (loading) return <div>Loading...</div>;
    if (!Array.isArray(events) || events.length === 0) {
      return <div className="card__details-empty">No events found.</div>;
    }
    return events.map(event => (
      <div key={event.eid} className="event-detail">
        <p><strong>{event.ename}</strong></p>
        <p>Date: {event.eventDate}</p>
        <p>Time: {event.eventTime}</p>
        <p>Location: {event.eventLoc}</p>
      </div>
    ));
  }

  return (
    <div>
      {/* Logout Button */}
      <div className="logout-container">
        <button className="logout-btn" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i>
          Logout
        </button>
      </div>
      <section className="hero-section">
        <div className="container">
          <div className="card-grid">
            <div className="card" id="ongoing-card">
              <div className="card__background"></div>
              <div className="card__content">
                <h3 className="card__heading">Ongoing Events</h3>
                <div className="card__details">{renderEventList(ongoing)}</div>
              </div>
            </div>
            <div className="card" id="completed-card">
              <div className="card__background"></div>
              <div className="card__content">
                <h3 className="card__heading">Completed Events</h3>
                <div className="card__details">{renderEventList(completed)}</div>
              </div>
            </div>
            <div className="card" id="upcoming-card">
              <div className="card__background"></div>
              <div className="card__content">
                <h3 className="card__heading">Upcoming Events</h3>
                <div className="card__details">{renderEventList(upcoming)}</div>
              </div>
            </div>
          </div>
          <div className="button-container">
            <button onClick={handleVolunteerOtherEvent}>Volunteer in Other Event</button>
          </div>
        </div>
      </section>
      {message && (
        <div className={`message ${messageType}`}>{message}</div>
      )}
    </div>
  );
}
