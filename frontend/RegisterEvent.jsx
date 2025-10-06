import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE = 'https://epass-backend.onrender.com'

function RegisterEvent() {
  const navigate = useNavigate()
  const [allEvents, setAllEvents] = useState([])
  const [currentFilter, setCurrentFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadAllEvents()
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

  const loadAllEvents = async () => {
    const isAuthenticated = await checkAuthStatus()
    if (!isAuthenticated) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_BASE}/api/events`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/')
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const events = [
        ...data.events.upcoming.map(e => ({ ...e, status: 'upcoming' })),
        ...data.events.ongoing.map(e => ({ ...e, status: 'ongoing' })),
        ...data.events.completed.map(e => ({ ...e, status: 'completed' }))
      ]

      setAllEvents(events)
      setLoading(false)
    } catch (error) {
      console.error('Error loading events:', error)
      setError('Failed to load events. Please try again.')
      setLoading(false)
    }
  }

  const formatTime = (timeString) => {
    if (!timeString) return 'Time TBA'

    const [hours, minutes] = timeString.split(':')
    const hour24 = parseInt(hours)
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
    const ampm = hour24 >= 12 ? 'PM' : 'AM'

    return `${hour12}:${minutes} ${ampm}`
  }

  const filterEvents = (status) => {
    setCurrentFilter(status)
  }

  const registerForEvent = async (eventId) => {
    try {
      const response = await fetch(`${API_BASE}/api/events/${eventId}/join`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (response.ok) {
        alert('✅ ' + data.message)
        loadAllEvents()
      } else {
        if (response.status === 401) {
          navigate('/')
          return
        }
        alert('❌ ' + (data.error || 'Registration failed'))
      }
    } catch (error) {
      console.error('Registration error:', error)
      alert('❌ Registration failed. Please try again.')
    }
  }

  const getFilteredEvents = () => {
    if (currentFilter === 'all') {
      return allEvents
    }
    return allEvents.filter(event => event.status === currentFilter)
  }

  const getButtonClass = (filter) => {
    const baseClass = 'flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 text-sm font-medium leading-normal'
    return filter === currentFilter
      ? `${baseClass} bg-[#00416A] text-white`
      : `${baseClass} bg-[#f1f2f4] text-[#121416] hover:bg-[#e1e2e4] transition-all`
  }

  const renderEventCard = (event) => {
    const eventDate = new Date(event.eventDate)
    const formattedDate = eventDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const timeFormatted = formatTime(event.eventTime)

    const statusColors = {
      upcoming: 'bg-blue-100 text-blue-800',
      ongoing: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800'
    }

    const regFee = event.regFee || 0
    const feeText = regFee > 0 ? `₹${regFee}` : 'Free'

    return (
      <div key={event.eid} className="bg-white border border-[#dde1e3] rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-wrap justify-between gap-3 p-4">
          <div className="flex min-w-72 flex-col gap-3">
            <div className="flex items-center gap-3">
              <p className="text-[#121416] tracking-light text-[24px] font-bold leading-tight">{event.ename}</p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[event.status]} capitalize`}>
                {event.status}
              </span>
            </div>
            <p className="text-[#6a7681] text-sm font-normal leading-normal">{event.eventdesc || 'No description available'}</p>
          </div>
          {event.status === 'upcoming' && (
            <button
              onClick={() => registerForEvent(event.eid)}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#00416A] text-white text-sm font-medium leading-normal hover:bg-opacity-90 transition-all"
            >
              <span className="truncate">Register</span>
            </button>
          )}
        </div>

        <h3 className="text-[#121416] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Event Details</h3>
        <div className="p-4 grid grid-cols-[20%_1fr] gap-x-6">
          <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#dde1e3] py-5">
            <p className="text-[#6a7681] text-sm font-normal leading-normal">Date & Time</p>
            <p className="text-[#121416] text-sm font-normal leading-normal">{formattedDate}, {timeFormatted}</p>
          </div>
          <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#dde1e3] py-5">
            <p className="text-[#6a7681] text-sm font-normal leading-normal">Location</p>
            <p className="text-[#121416] text-sm font-normal leading-normal">{event.eventLoc || 'Location TBA'}</p>
          </div>
          <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#dde1e3] py-5">
            <p className="text-[#6a7681] text-sm font-normal leading-normal">Organizer</p>
            <p className="text-[#121416] text-sm font-normal leading-normal">{event.organizerName || event.clubName || 'Event Organizer'}</p>
          </div>
          <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#dde1e3] py-5">
            <p className="text-[#6a7681] text-sm font-normal leading-normal">Registration Fee</p>
            <p className="text-[#121416] text-sm font-normal leading-normal">{feeText}</p>
          </div>
          {event.maxPart && (
            <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#dde1e3] py-5">
              <p className="text-[#6a7681] text-sm font-normal leading-normal">Max Participants</p>
              <p className="text-[#121416] text-sm font-normal leading-normal">{event.maxPart}</p>
            </div>
          )}
          {event.maxVoln && (
            <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#dde1e3] py-5">
              <p className="text-[#6a7681] text-sm font-normal leading-normal">Max Volunteers</p>
              <p className="text-[#121416] text-sm font-normal leading-normal">{event.maxVoln}</p>
            </div>
          )}
        </div>

        <h3 className="text-[#121416] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">About the Event</h3>
        <div className="text-[#121416] text-base font-normal leading-normal pb-3 pt-1 px-4">
          {event.eventdesc || 'Join us for this exciting event! More details will be available soon. Don\'t miss this opportunity to be part of something special.'}
        </div>
      </div>
    )
  }

  const filteredEvents = getFilteredEvents()

  return (
    <div
      className="relative size-full min-h-screen flex-col group/design-root overflow-x-hidden"
      style={{
        fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif',
        background: 'linear-gradient(to right, #E4E5E6, #00416A)',
        display: 'flex'
      }}
    >
      <div className="layout-container flex h-full grow flex-col w-full">
        <div className="px-40 flex flex-1 justify-center py-5 w-full">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1 bg-white rounded-xl p-6 shadow-lg">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <h1 className="text-[#121416] tracking-light text-[32px] font-bold leading-tight">All Events</h1>
                <p className="text-[#6a7681] text-sm font-normal leading-normal">Discover and join events happening around you</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => filterEvents('all')} className={getButtonClass('all')}>All</button>
                <button onClick={() => filterEvents('upcoming')} className={getButtonClass('upcoming')}>Upcoming</button>
                <button onClick={() => filterEvents('ongoing')} className={getButtonClass('ongoing')}>Ongoing</button>
                <button onClick={() => filterEvents('completed')} className={getButtonClass('completed')}>Completed</button>
              </div>
            </div>

            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#00416A]"></div>
                <p className="mt-2 text-[#6a7681]">Loading events...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <p className="text-red-500 font-medium">Failed to load events</p>
                <button
                  onClick={loadAllEvents}
                  className="mt-2 flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#00416A] text-white text-sm font-medium leading-normal hover:bg-opacity-90 mx-auto"
                >
                  Try Again
                </button>
              </div>
            )}

            {!loading && !error && filteredEvents.length === 0 && (
              <div className="text-center py-8">
                <p className="text-[#6a7681] text-lg">No events found</p>
              </div>
            )}

            {!loading && !error && filteredEvents.length > 0 && (
              <div className="space-y-6">
                {filteredEvents.map(event => renderEventCard(event))}
              </div>
            )}

            <div className="px-4 py-4">
              <button
                onClick={() => window.history.back()}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#f1f2f4] text-[#121416] text-sm font-medium leading-normal hover:bg-[#e1e2e4] transition-all"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
      <link
        rel="stylesheet"
        as="style"
        href="https://fonts.googleapis.com/css2?display=swap&family=Noto+Sans%3Awght%40400%3B500%3B700%3B900&family=Plus+Jakarta+Sans%3Awght%40400%3B500%3B700%3B800"
      />
      <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
    </div>
  )
}

export default RegisterEvent
