import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Events from './Events';
import Participants from './Participants';
import Organisers from './Organisers';
import Volunteers from './Volunteers';
import EventForm from './EventForm';
import RegisterEvent from './RegisterEvent';
import VolunteerEvents from './VolunteerEvents';
import QRCodePage from './QR';
import Scanner from './Scanner';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/events.html" element={<Events />} />
        <Route path="/participants.html" element={<Participants />} />
        <Route path="/organisers.html" element={<Organisers />} />
        <Route path="/volunteers.html" element={<Volunteers />} />
        <Route path="/event_form.html" element={<EventForm />} />
        <Route path="/registerevent.html" element={<RegisterEvent />} />
        <Route path="/volunteer_events.html" element={<VolunteerEvents />} />
        <Route path="/qr.html" element={<QRCodePage />} />
        <Route path="/scanner.html" element={<Scanner />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}


export default App;
