import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './event_form.css';

const API_BASE = 'https://epass-backend.onrender.com';

function EventForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    eventName: '',
    eventDescription: '',
    eventDate: '',
    eventTime: '',
    eventLocation: '',
    maxParticipants: '',
    maxVolunteers: '',
    organizerUSN: '',
    OrgCid: '',
    registrationFee: ''
  });

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      eventName: formData.eventName,
      eventDescription: formData.eventDescription,
      eventDate: formData.eventDate,
      eventTime: formData.eventTime,
      eventLocation: formData.eventLocation,
      maxParticipants: parseInt(formData.maxParticipants),
      maxVolunteers: parseInt(formData.maxVolunteers),
      organizerUSN: formData.organizerUSN,
      OrgCid: parseInt(formData.OrgCid) || null,
      registrationFee: parseFloat(formData.registrationFee)
    };

    if (!data.eventName || !data.eventDescription || !data.eventDate || !data.eventTime || !data.eventLocation || !data.organizerUSN || !data.OrgCid) {
      showMessage('Please fill in all required fields.', true);
      return;
    }

    if (!/^1BM\d{2}[A-Z]{2}\d{3}$/.test(data.organizerUSN)) {
      showMessage('Invalid USN format. Example: 1BM23CS101', true);
      return;
    }

    if (data.OrgCid <= 0) {
      showMessage('Club ID must be a positive number.', true);
      return;
    }

    const eventDate = new Date(data.eventDate);
    const currentDate = new Date();
    if (eventDate <= currentDate) {
      showMessage('Event date must be in the future.', true);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/events/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (res.ok) {
        showMessage('Event created successfully!');
        setFormData({
          eventName: '',
          eventDescription: '',
          eventDate: '',
          eventTime: '',
          eventLocation: '',
          maxParticipants: '',
          maxVolunteers: '',
          organizerUSN: '',
          OrgCid: '',
          registrationFee: ''
        });
        setTimeout(() => {
          navigate('/organisers.html');
        }, 2000);
      } else {
        if (res.status === 401) {
          showMessage('Please sign in to create an event.', true);
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else {
          showMessage(`Failed to create event: ${result.error}`, true);
        }
      }
    } catch (err) {
      console.error('Error creating event:', err);
      showMessage(`Error: ${err.message}`, true);
    }
  };

  return (
    <div className="wrapper">
      <div className="form-container">
        <h2>Organize an Event</h2>
        <form id="eventForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="eventName">Event Name</label>
            <input
              type="text"
              id="eventName"
              name="eventName"
              value={formData.eventName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="eventDescription">Description</label>
            <textarea
              id="eventDescription"
              name="eventDescription"
              rows="4"
              value={formData.eventDescription}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="eventDate">Date</label>
            <input
              type="date"
              id="eventDate"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="eventTime">Time</label>
            <input
              type="time"
              id="eventTime"
              name="eventTime"
              value={formData.eventTime}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="eventLocation">Location</label>
            <input
              type="text"
              id="eventLocation"
              name="eventLocation"
              value={formData.eventLocation}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="maxParticipants">Max Participants</label>
            <input
              type="number"
              id="maxParticipants"
              name="maxParticipants"
              min="1"
              value={formData.maxParticipants}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="maxVolunteers">Max Volunteers</label>
            <input
              type="number"
              id="maxVolunteers"
              name="maxVolunteers"
              min="1"
              value={formData.maxVolunteers}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="organizerUSN">Organizer USN</label>
            <input
              type="text"
              id="organizerUSN"
              name="organizerUSN"
              value={formData.organizerUSN}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="OrgCid">Club ID</label>
            <input
              type="number"
              id="OrgCid"
              name="OrgCid"
              min="1"
              value={formData.OrgCid}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="registrationFee">Registration Fee</label>
            <input
              type="number"
              id="registrationFee"
              name="registrationFee"
              step="0.01"
              min="0"
              value={formData.registrationFee}
              onChange={handleInputChange}
              required
            />
          </div>
          <button type="submit">Create Event</button>
        </form>
      </div>
    </div>
  );
}

export default EventForm;