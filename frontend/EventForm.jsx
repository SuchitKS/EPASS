
import React, { useState } from 'react';
import './events.css';

export default function EventForm() {
  const API_BASE = 'https://epass-backend.onrender.com';
  const [form, setForm] = useState({
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
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('success');
  const [submitting, setSubmitting] = useState(false);

  function showMessage(text, isError = false) {
    setMessage(text);
    setMessageType(isError ? 'error' : 'success');
    setTimeout(() => {
      setMessage(null);
    }, 5000);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      eventName: form.eventName,
      eventDescription: form.eventDescription,
      eventDate: form.eventDate,
      eventTime: form.eventTime,
      eventLocation: form.eventLocation,
      maxParticipants: parseInt(form.maxParticipants),
      maxVolunteers: parseInt(form.maxVolunteers),
      organizerUSN: form.organizerUSN,
      OrgCid: parseInt(form.OrgCid) || null,
      registrationFee: parseFloat(form.registrationFee)
    };

    // Basic validation
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

    setSubmitting(true);
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
        setForm({
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
          window.location.href = 'organisers.html';
        }, 2000);
      } else {
        if (res.status === 401) {
          showMessage('Please sign in to create an event.', true);
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 2000);
        } else {
          showMessage(`Failed to create event: ${result.error}`, true);
        }
      }
    } catch (err) {
      console.error('Error creating event:', err);
      showMessage(`Error: ${err.message}`, true);
    }
    setSubmitting(false);
  };

  return (
    <div className="wrapper">
      <div className="form-container">
        <h2>Organize an Event</h2>
        <form id="eventForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="eventName">Event Name</label>
            <input type="text" id="eventName" name="eventName" value={form.eventName} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="eventDescription">Description</label>
            <textarea id="eventDescription" name="eventDescription" rows="4" value={form.eventDescription} onChange={handleChange} required></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="eventDate">Date</label>
            <input type="date" id="eventDate" name="eventDate" value={form.eventDate} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="eventTime">Time</label>
            <input type="time" id="eventTime" name="eventTime" value={form.eventTime} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="eventLocation">Location</label>
            <input type="text" id="eventLocation" name="eventLocation" value={form.eventLocation} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="maxParticipants">Max Participants</label>
            <input type="number" id="maxParticipants" name="maxParticipants" min="1" value={form.maxParticipants} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="maxVolunteers">Max Volunteers</label>
            <input type="number" id="maxVolunteers" name="maxVolunteers" min="1" value={form.maxVolunteers} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="organizerUSN">Organizer USN</label>
            <input type="text" id="organizerUSN" name="organizerUSN" value={form.organizerUSN} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="OrgCid">Club ID</label>
            <input type="number" id="OrgCid" name="OrgCid" min="1" value={form.OrgCid} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="registrationFee">Registration Fee</label>
            <input type="number" id="registrationFee" name="registrationFee" step="0.01" min="0" value={form.registrationFee} onChange={handleChange} required />
          </div>
          <button type="submit" disabled={submitting}>Create Event</button>
        </form>
        {message && (
          <div className={`message ${messageType}`}>{message}</div>
        )}
      </div>
    </div>
  );
}
