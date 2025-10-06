import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './style.css'

const API_BASE = 'https://epass-backend.onrender.com'

function EventForm() {
  const navigate = useNavigate()
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
  })

  const showMessage = (text, isError = false) => {
    const existingMessage = document.querySelector('.message')
    if (existingMessage) {
      existingMessage.remove()
    }

    const messageDiv = document.createElement('div')
    messageDiv.className = `message ${isError ? 'error' : 'success'}`
    messageDiv.textContent = text

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
    `

    if (!document.querySelector('#message-styles')) {
      const style = document.createElement('style')
      style.id = 'message-styles'
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `
      document.head.appendChild(style)
    }

    document.body.appendChild(messageDiv)

    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.style.animation = 'slideIn 0.3s ease-in-out reverse'
        setTimeout(() => {
          if (messageDiv.parentNode) {
            messageDiv.remove()
          }
        }, 300)
      }
    }, 5000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

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
    }

    if (!data.eventName || !data.eventDescription || !data.eventDate || !data.eventTime || !data.eventLocation || !data.organizerUSN || !data.OrgCid) {
      showMessage('Please fill in all required fields.', true)
      return
    }

    if (!/^1BM\d{2}[A-Z]{2}\d{3}$/.test(data.organizerUSN)) {
      showMessage('Invalid USN format. Example: 1BM23CS101', true)
      return
    }

    if (data.OrgCid <= 0) {
      showMessage('Club ID must be a positive number.', true)
      return
    }

    const eventDate = new Date(data.eventDate)
    const currentDate = new Date()
    if (eventDate <= currentDate) {
      showMessage('Event date must be in the future.', true)
      return
    }

    try {
      const res = await fetch(`${API_BASE}/api/events/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      })

      const result = await res.json()

      if (res.ok) {
        showMessage('Event created successfully!')
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
        })
        setTimeout(() => {
          navigate('/organisers.html')
        }, 2000)
      } else {
        if (res.status === 401) {
          showMessage('Please sign in to create an event.', true)
          setTimeout(() => {
            navigate('/')
          }, 2000)
        } else {
          showMessage(`Failed to create event: ${result.error}`, true)
        }
      }
    } catch (err) {
      console.error('Error creating event:', err)
      showMessage(`Error: ${err.message}`, true)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="wrapper" style={{
      minHeight: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem',
      background: 'linear-gradient(90deg, #598ea7, #464170)'
    }}>
      <div className="form-container" style={{
        width: '100%',
        maxWidth: '700px',
        backgroundColor: '#ffffff1a',
        borderRadius: '10px',
        padding: '2rem 3rem',
        color: '#fff',
        minHeight: '1200px',
        alignSelf: 'stretch'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#fff' }}>Organize an Event</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.4rem' }}>Event Name</label>
            <input
              type="text"
              name="eventName"
              value={formData.eventName}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: 'none', fontSize: '1rem' }}
            />
          </div>
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.4rem' }}>Description</label>
            <textarea
              name="eventDescription"
              value={formData.eventDescription}
              onChange={handleChange}
              rows="4"
              required
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: 'none', fontSize: '1rem' }}
            />
          </div>
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.4rem' }}>Date</label>
            <input
              type="date"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: 'none', fontSize: '1rem', background: '#f0f0f0' }}
            />
          </div>
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.4rem' }}>Time</label>
            <input
              type="time"
              name="eventTime"
              value={formData.eventTime}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: 'none', fontSize: '1rem', background: '#f0f0f0' }}
            />
          </div>
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.4rem' }}>Location</label>
            <input
              type="text"
              name="eventLocation"
              value={formData.eventLocation}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: 'none', fontSize: '1rem' }}
            />
          </div>
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.4rem' }}>Max Participants</label>
            <input
              type="number"
              name="maxParticipants"
              value={formData.maxParticipants}
              onChange={handleChange}
              min="1"
              required
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: 'none', fontSize: '1rem', background: '#f0f0f0' }}
            />
          </div>
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.4rem' }}>Max Volunteers</label>
            <input
              type="number"
              name="maxVolunteers"
              value={formData.maxVolunteers}
              onChange={handleChange}
              min="1"
              required
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: 'none', fontSize: '1rem', background: '#f0f0f0' }}
            />
          </div>
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.4rem' }}>Organizer USN</label>
            <input
              type="text"
              name="organizerUSN"
              value={formData.organizerUSN}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: 'none', fontSize: '1rem' }}
            />
          </div>
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.4rem' }}>Club ID</label>
            <input
              type="number"
              name="OrgCid"
              value={formData.OrgCid}
              onChange={handleChange}
              min="1"
              required
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: 'none', fontSize: '1rem', background: '#f0f0f0' }}
            />
          </div>
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.4rem' }}>Registration Fee</label>
            <input
              type="number"
              name="registrationFee"
              value={formData.registrationFee}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: 'none', fontSize: '1rem', background: '#f0f0f0' }}
            />
          </div>
          <button
            type="submit"
            style={{
              display: 'block',
              width: '100%',
              backgroundColor: '#fff',
              color: '#333',
              padding: '1rem',
              borderRadius: '10px',
              fontWeight: 'bold',
              fontSize: '1rem',
              border: 'none',
              cursor: 'pointer',
              marginTop: '1rem',
              transition: 'background-color 0.3s'
            }}
          >
            Create Event
          </button>
        </form>
      </div>
    </div>
  )
}

export default EventForm
