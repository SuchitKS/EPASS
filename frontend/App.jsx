import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Login from './Login'
import Events from './Events'
import EventForm from './EventForm'
import Organisers from './Organisers'
import Participants from './Participants'
import Volunteers from './Volunteers'
import RegisterEvent from './RegisterEvent'
import VolunteerEvents from './VolunteerEvents'
import './style.css'

function App() {
  const location = useLocation()
  
  // Add page-specific class to body based on route
  React.useEffect(() => {
    const path = location.pathname
    document.body.className = path === '/' ? 'login-page' : ''
    
    // Cleanup function to remove class when component unmounts
    return () => {
      document.body.className = ''
    }
  }, [location])

  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/events" element={<Events />} />
        <Route path="/event_form" element={<EventForm />} />
        <Route path="/organisers" element={<Organisers />} />
        <Route path="/participants" element={<Participants />} />
        <Route path="/volunteers" element={<Volunteers />} />
        <Route path="/registerevent" element={<RegisterEvent />} />
        <Route path="/volunteer_events" element={<VolunteerEvents />} />
        {/* Add a catch-all route for 404 pages */}
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </div>
  )
}

export default App

