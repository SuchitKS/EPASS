import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './participants.css'

const API_BASE = 'https://epass-backend.onrender.com'

function Participants() {
  const navigate = useNavigate()
  const [events, setEvents] = useState({ ongoing: [], completed: [], upcoming: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthAndLoadEvents()
  }, [])

  const checkAuthStatus = async () => {
    try {
      console.log('Checking auth status...')
      const response = await fetch(`${API_BASE}/api/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log('Auth response status:', response.status)

      if (response.status === 401) {
        console.log('User not authenticated, redirecting to login')
        navigate('/')
        return false
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const userData = await response.json()
      console.log('User authenticated:', userData)
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
    await loadParticipantEvents()
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

  const categorizeEvents = (events) => {
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    const categorized = {
      ongoing: [],
      completed: [],
      upcoming: []
    }

    events.forEach(event => {
      const eventDate = new Date(event.eventDate)
      eventDate.setHours(0, 0, 0, 0)

      const diffTime = eventDate.getTime() - currentDate.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 0) {
        categorized.ongoing.push(event)
      } else if (diffDays < 0) {
        categorized.completed.push(event)
      } else {
        categorized.upcoming.push(event)
      }
    })

    return categorized
  }

  const getParticipantStatus = (status) => {
    switch (status) {
      case 0:
      case false:
        return 'Registered'
      case 1:
      case true:
        return 'Attended'
      default:
        return 'Unknown'
    }
  }

  const getButtonText = (eventType) => {
    switch (eventType) {
      case 'ongoing': return 'View Details'
      case 'completed': return 'View Certificate'
      case 'upcoming': return 'View Details'
      default: return 'View'
    }
  }

  const handleEventButtonClick = (eventId, eventType) => {
    console.log(`Button clicked for event ${eventId} (${eventType})`)
    // Fixed: Use React Router navigate instead of window.location.href
    navigate(`/ticket3?eventId=${eventId}`)
  }

  const loadParticipantEvents = async () => {
    try {
      console.log('Loading participant events...')
      setLoading(true)

      const response = await fetch(`${API_BASE}/api/my-participant-events`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log('Participant events response status:', response.status)

      if (response.status === 401) {
        console.log('Unauthorized - redirecting to login')
        navigate('/')
        return
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Received participant events data:', data)

      const participantEvents = data.participantEvents || []
      const categorizedEvents = categorizeEvents(participantEvents)

      console.log('Categorized events:', categorizedEvents)

      setEvents(categorizedEvents)
    } catch (error) {
      console.error('Error fetching participant events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      console.log('Logging out...')

      const response = await fetch(`${API_BASE}/api/signout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      console.log('Logout response:', data)

      if (data.success) {
        console.log('Logout successful, redirecting...')
        navigate('/')
      } else {
        alert('Error logging out. Please try again.')
      }
    } catch (error) {
      console.error('Logout error:', error)
      alert('Error logging out. Please try again.')
    }
  }

  const renderEventList = (eventList, eventType) => {
    if (!Array.isArray(eventList) || eventList.length === 0) {
      return (
        <div className="event-item">
          <p><strong>No events available</strong></p>
        </div>
      )
    }

    return eventList.map(event => (
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
            onClick={() => handleEventButtonClick(event.eid, eventType)}
          >
            {getButtonText(eventType)}
          </button>
        </div>
      </div>
    ))
  }

  return (
    <>
      <div className="logout-container">
        <button id="logoutBtn" className="logout-btn" onClick={handleLogout}>
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
                <div className="card__details">
                  {loading ? (
                    <div className="event-item">
                      <p>Loading...</p>
                    </div>
                  ) : (
                    renderEventList(events.ongoing, 'ongoing')
                  )}
                </div>
              </div>
            </div>
            <div className="card" id="completed-card">
              <div className="card__background"></div>
              <div className="card__content">
                <h3 className="card__heading">Completed Events</h3>
                <div className="card__details">
                  {loading ? (
                    <div className="event-item">
                      <p>Loading...</p>
                    </div>
                  ) : (
                    renderEventList(events.completed, 'completed')
                  )}
                </div>
              </div>
            </div>
            <div className="card" id="upcoming-card">
              <div className="card__background"></div>
              <div className="card__content">
                <h3 className="card__heading">Upcoming Events</h3>
                <div className="card__details">
                  {loading ? (
                    <div className="event-item">
                      <p>Loading...</p>
                    </div>
                  ) : (
                    renderEventList(events.upcoming, 'upcoming')
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="button-container">
            <button onClick={() => navigate('/registerevent')}>
              Participate in other Event
            </button>
          </div>
        </div>
      </section>
    </>
  )
}

export default Participants
