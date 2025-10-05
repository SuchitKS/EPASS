import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './volunteers.css'

const API_BASE = 'https://epass-backend.onrender.com'

function VolunteerEvents() {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])

  useEffect(() => {
    updateEventList()
  }, [])

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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A'
    const timeParts = timeString.split(':')
    let hours = parseInt(timeParts[0])
    const minutes = timeParts[1]
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12
    hours = hours ? hours : 12
    return `${hours}:${minutes} ${ampm}`
  }

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/events`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        if (response.status === 401) {
          showMessage('Please sign in to view events.', true)
          setTimeout(() => {
            navigate('/')
          }, 2000)
          return []
        }
        throw new Error('Network response was not ok')
      }

      const data = await response.json()
      const allEvents = [
        ...data.events.ongoing,
        ...data.events.upcoming
      ]

      const eventsWithCounts = await Promise.all(allEvents.map(async event => {
        const countResponse = await fetch(`${API_BASE}/api/events/${event.eid}/volunteer-count`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        })
        const countData = await countResponse.json()
        return { ...event, volunteerCount: countData.count }
      }))

      return eventsWithCounts
    } catch (error) {
      console.error('Error fetching events:', error)
      showMessage('Could not load events.', true)
      return []
    }
  }

  const updateEventList = async () => {
    const fetchedEvents = await fetchEvents()
    setEvents(fetchedEvents)
  }

  const handleVolunteer = async (eventId) => {
    try {
      const response = await fetch(`${API_BASE}/api/events/${eventId}/volunteer`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()

      if (response.ok) {
        showMessage('Successfully volunteered for the event!')
        await updateEventList()
      } else {
        if (response.status === 401) {
          showMessage('Please sign in to volunteer.', true)
          setTimeout(() => {
            navigate('/')
          }, 2000)
        } else {
          showMessage(`Failed to volunteer: ${data.error}`, true)
        }
      }
    } catch (error) {
      console.error('Error volunteering:', error)
      showMessage('Error volunteering for the event.', true)
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/signout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        navigate('/')
      } else {
        showMessage('Error logging out. Please try again.', true)
      }
    } catch (error) {
      console.error('Logout error:', error)
      showMessage('Error logging out. Please try again.', true)
    }
  }

  const renderEventItem = (event) => {
    const remainingVolunteers = event.maxVoln - (event.volunteerCount || 0)

    return (
      <div key={event.eid} className="event-item">
        <div className="event-info">
          <p><strong>{event.ename || 'N/A'}</strong></p>
          <p>Date: {formatDate(event.eventDate)}</p>
          <p>Time: {formatTime(event.eventTime)}</p>
          <p>Location: {event.eventLoc || 'N/A'}</p>
          <p>Volunteers Needed: {remainingVolunteers > 0 ? remainingVolunteers : 0}/{event.maxVoln || 'N/A'}</p>
        </div>
        <div className="event-actions">
          {remainingVolunteers > 0 ? (
            <button 
              onClick={() => handleVolunteer(event.eid)}
              style={{
                fontSize: '15px',
                padding: '0.7em 2.7em',
                letterSpacing: '0.06em',
                position: 'relative',
                fontFamily: 'inherit',
                borderRadius: '0.6em',
                overflow: 'hidden',
                transition: 'all 0.3s',
                lineHeight: '1.4em',
                border: '2px solid #1BFD9C',
                background: 'linear-gradient(to right, rgba(27, 253, 156, 0.1) 1%, transparent 40%, transparent 60%, rgba(27, 253, 156, 0.1) 100%)',
                color: '#1BFD9C',
                boxShadow: 'inset 0 0 10px rgba(27, 253, 156, 0.4), 0 0 9px 3px rgba(27, 253, 156, 0.1)',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#82ffc9'
                e.currentTarget.style.boxShadow = 'inset 0 0 10px rgba(27, 253, 156, 0.6), 0 0 9px 3px rgba(27, 253, 156, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#1BFD9C'
                e.currentTarget.style.boxShadow = 'inset 0 0 10px rgba(27, 253, 156, 0.4), 0 0 9px 3px rgba(27, 253, 156, 0.1)'
              }}
            >
              Volunteer
            </button>
          ) : (
            <p className="no-volunteers" style={{ color: '#ff4d4d', fontWeight: 'bold', margin: '0.5rem 0' }}>No more volunteers</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{
      margin: 0,
      padding: 0,
      height: '100%',
      fontFamily: "'Montserrat', sans-serif",
      background: 'linear-gradient(135deg, #667eea, #764ba2)'
    }}>
      <div className="nav-container" style={{
        position: 'absolute',
        top: '20px',
        right: '20px'
      }}>
        <button
          onClick={() => navigate('/volunteers.html')}
          className="nav-btn back-btn"
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
        >
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <button
          onClick={handleLogout}
          className="nav-btn logout-btn"
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
        >
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>

      <section className="hero-section" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        minHeight: '100vh',
        padding: '2rem 0'
      }}>
        <div className="container" style={{
          width: '100%',
          maxWidth: '600px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '10px',
          padding: '2rem',
          color: '#fff',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            textAlign: 'center',
            marginBottom: '1.5rem',
            color: '#fff',
            fontWeight: 700
          }}>Volunteer for Events</h2>
          <div className="events-list" style={{
            maxHeight: '60vh',
            overflowY: 'auto',
            padding: '0.5rem'
          }}>
            {events.length === 0 ? (
              <div className="event-item">
                <div className="event-info">
                  <p><strong>No events available for volunteering</strong></p>
                </div>
              </div>
            ) : (
              events.map(event => renderEventItem(event))
            )}
          </div>
        </div>
      </section>
      <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    </div>
  )
}

export default VolunteerEvents
