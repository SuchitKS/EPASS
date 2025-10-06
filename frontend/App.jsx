import React from 'react'

import { Routes, Route } from 'react-router-dom'

import Login from './Login'

import Events from './Events'

import EventForm from './EventForm'

import Organisers from './Organisers'

import Participants from './Participants'

import Volunteers from './Volunteers'

import RegisterEvent from './RegisterEvent'

import VolunteerEvents from './VolunteerEvents'



function App() {

  return (

    <Routes>

      <Route path="/" element={<Login />} />

      <Route path="/events.html" element={<Events />} />

      <Route path="/event_form.html" element={<EventForm />} />

      <Route path="/organisers.html" element={<Organisers />} />

      <Route path="/participants.html" element={<Participants />} />

      <Route path="/volunteers.html" element={<Volunteers />} />

      <Route path="/registerevent.html" element={<RegisterEvent />} />

      <Route path="/volunteer_events.html" element={<VolunteerEvents />} />

    </Routes>

  )

}



export default App

