import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import './organisers.css'

const API_BASE = 'https://epass-backend.onrender.com'

function Organisers() {
  const navigate = useNavigate()
  const [events, setEvents] = useState({ ongoing: [], completed: [], upcoming: [] })

  useEffect(() => {
    checkAuthAndLoadEvents()
  }, [])

  const checkAuthStatus = async () => {
    try {
      console.log('🔐 Checking auth status for organisers page...')
      const response = await fetch(`${API_BASE}/api/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log('🔐 Auth response status:', response.status)

      if (response.status === 401) {
        console.log('❌ User not authenticated, redirecting to login')
        navigate('/')
        return false
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const userData = await response.json()
      console.log('✅ User authenticated:', userData)
      return true
    } catch (error) {
      console.error('❌ Auth check failed:', error)
      navigate('/')
      return false
    }
  }

  const checkAuthAndLoadEvents = async () => {
    const isAuthenticated = await checkAuthStatus()
    if (!isAuthenticated) {
      return
    }
    loadOrganizedEvents()
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

  const getButtonText = (eventType) => {
    switch (eventType) {
      case 'ongoing': return 'View Event'
      case 'completed': return 'View Event'
      case 'upcoming': return 'View Event'
      default: return 'View'
    }
  }

  const handleEventButtonClick = (eventId, eventType) => {
    console.log(`Button clicked for event ${eventId} (${eventType})`)
    window.location.href = `/ticket.html?eventId=${eventId}`
  }

  const loadOrganizedEvents = async () => {
    try {
      console.log('📊 Loading organized events...')

      const response = await fetch(`${API_BASE}/api/my-organized-events`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log('📊 Organized events response status:', response.status)

      if (response.status === 401) {
        console.log('❌ Unauthorized - redirecting to login')
        navigate('/')
        return
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('📊 Organized events data:', data)

      const currentDate = new Date().toISOString().split('T')[0]

      const categorizedEvents = {
        ongoing: [],
        completed: [],
        upcoming: []
      }

      if (data.organizerEvents) {
        data.organizerEvents.forEach(event => {
          const eventDate = new Date(event.eventDate).toISOString().split('T')[0]
          if (eventDate === currentDate) {
            categorizedEvents.ongoing.push(event)
          } else if (eventDate < currentDate) {
            categorizedEvents.completed.push(event)
          } else {
            categorizedEvents.upcoming.push(event)
          }
        })
      }

      setEvents(categorizedEvents)
    } catch (error) {
      console.error('❌ Error fetching organized events:', error)
    }
  }

  const handleLogout = async () => {
    try {
      console.log('🚪 Logging out...')

      const response = await fetch(`${API_BASE}/api/signout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      console.log('🚪 Logout response:', data)

      if (data.success) {
        console.log('✅ Logout successful, redirecting...')
        navigate('/')
      } else {
        alert('Error logging out. Please try again.')
      }
    } catch (error) {
      console.error('❌ Logout error:', error)
      alert('Error logging out. Please try again.')
    }
  }

  const renderEventList = (eventList, eventType) => {
    if (!Array.isArray(eventList) || eventList.length === 0) {
      return (
        <div className="event-item">
          <p><strong>No events organized by you</strong></p>
        </div>
      )
    }

    return eventList.map(event => (
      <div key={event.eid} className="event-item">
        <div className="event-info">
          <p><strong>{event.ename || 'N/A'}</strong></p>
          <p><em>{event.eventdesc || 'No description'}</em></p>
          <p>Date: {formatDate(event.eventDate)}</p>
          <p>Time: {formatTime(event.eventTime)}</p>
          <p>Location: {event.eventLoc || 'N/A'}</p>
          <p>Max Participants: {event.maxPart || 'No limit'}</p>
          <p>Max Volunteers: {event.maxVoln || 'No limit'}</p>
          <p>Registration Fee: ₹{event.regFee || '0'}</p>
          {event.clubName && <p>Club: {event.clubName}</p>}
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
    <div>
      <div className="nav-container">
        <button className="nav-btn back-btn" onClick={() => navigate('/events')}>
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
          <div className="card-grid">
            <div className="card" id="ongoing-card">
              <div className="card__background"></div>
              <div className="card__content">
                <h3 className="card__heading">Ongoing Events</h3>
                <div className="card__details">
                  {renderEventList(events.ongoing, 'ongoing')}
                </div>
              </div>
            </div>
            <div className="card" id="completed-card">
              <div className="card__background"></div>
              <div className="card__content">
                <h3 className="card__heading">Completed Events</h3>
                <div className="card__details">
                  {renderEventList(events.completed, 'completed')}
                </div>
              </div>
            </div>
            <div className="card" id="upcoming-card">
              <div className="card__background"></div>
              <div className="card__content">
                <h3 className="card__heading">Upcoming Events</h3>
                <div className="card__details">
                  {renderEventList(events.upcoming, 'upcoming')}
                </div>
              </div>
            </div>
          </div>
          <div className="button-container">
            <button onClick={() => navigate('/event_form')}>Organise New Event</button>
          </div>
        </div>
      </section>
      <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    </div>
  )
}

export default Organisers


