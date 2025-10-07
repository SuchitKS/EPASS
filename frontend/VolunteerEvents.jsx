import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './volunteers.css'

const API_BASE = 'https://epass-backend.onrender.com'

function VolunteerEvents() {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthAndLoadEvents()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.status === 401) {
        navigate('/')
        return false
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return true
    } catch (error) {
      console.error('Auth check failed:', error)
      navigate('/')
      return false
    }
  }

  const checkAuthAndLoadEvents = async () => {
    const isAuthenticated = await checkAuthStatus()
    if (!isAuthenticated) {
      return
    }
    await fetchEvents()
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
      setLoading(true)
      const response = await fetch(`${API_BASE}/api/events`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.status === 401) {
        navigate('/')
        return
      }

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const data = await response.json()
      const allEvents = [
        ...data.events.ongoing,
        ...data.events.upcoming
      ]

      const eventsWithCounts = await Promise.all(allEvents.map(async event => {
        try {
          const countResponse = await fetch(`${API_BASE}/api/events/${event.eid}/volunteer-count`, {
            credentials: 'include'
          })
          const countData = await countResponse.json()
          return { ...event, volunteerCount: countData.count }
        } catch (error) {
          console.error('Error fetching volunteer count:', error)
          return { ...event, volunteerCount: 0 }
        }
      }))

      setEvents(eventsWithCounts)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching events:', error)
      alert('Could not load events.')
      setLoading(false)
    }
  }

  const handleVolunteer = async (eventId) => {
    try {
      const response = await fetch(`${API_BASE}/api/events/${eventId}/volunteer`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (response.ok) {
        alert('Successfully volunteered for the event!')
        await fetchEvents()
      } else {
        if (response.status === 401) {
          alert('Please sign in to volunteer.')
          navigate('/')
        } else {
          alert(`Failed to volunteer: ${data.error}`)
        }
      }
    } catch (error) {
      console.error('Error volunteering:', error)
      alert('Error volunteering for the event.')
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
        alert('Error logging out. Please try again.')
      }
    } catch (error) {
      console.error('Logout error:', error)
      alert('Error logging out. Please try again.')
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
              className="volunteer-btn event-btn"
              onClick={() => handleVolunteer(event.eid)}
            >
              Volunteer
            </button>
          ) : (
            <p className="no-volunteers" style={{ color: '#fff', fontSize: '0.9rem' }}>No more volunteers</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="nav-container" style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        right: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        zIndex: 1000
      }}>
        <button className="nav-btn back-btn logout-btn" onClick={() => navigate('/volunteers')}>
          <i className="fas fa-arrow-left"></i>
          Back
        </button>
        <button className="nav-btn logout-btn" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i>
          Logout
        </button>
      </div>

      <section className="hero-section">
        <div className="container">
          <h2 style={{
            color: 'white',
            textAlign: 'center',
            marginBottom: '2rem',
            fontSize: '2rem',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            Available Events to Volunteer
          </h2>
          <div className="events-list" style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            padding: '2rem',
            borderRadius: '15px',
            backdropFilter: 'blur(10px)'
          }}>
            {loading ? (
              <div className="event-item">
                <p style={{ color: 'white' }}><strong>Loading events...</strong></p>
              </div>
            ) : events.length === 0 ? (
              <div className="event-item">
                <p style={{ color: 'white' }}><strong>No events available for volunteering</strong></p>
              </div>
            ) : (
              events.map(event => renderEventItem(event))
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default VolunteerEvents

