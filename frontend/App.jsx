import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './Index';
import Events from './Events';
import EventForm from './EventForm';
import Organisers from './Organisers';
import Participants from './Participants';
import QR from './QR';
import RegisterEvent from './RegisterEvent';
import Scanner from './Scanner';
import Ticket from './Ticket';
import Ticket2 from './Ticket2';
import Ticket3 from './Ticket3';
import Volunteers from './Volunteers';
import VolunteerEvents from './VolunteerEvents';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/events" element={<Events />} />
        <Route path="/event_form" element={<EventForm />} />
        <Route path="/organisers" element={<Organisers />} />
        <Route path="/participants" element={<Participants />} />
        <Route path="/qr" element={<QR />} />
        <Route path="/registerevent" element={<RegisterEvent />} />
        <Route path="/scanner" element={<Scanner />} />
        <Route path="/ticket" element={<Ticket />} />
        <Route path="/ticket2" element={<Ticket2 />} />
        <Route path="/ticket3" element={<Ticket3 />} />
        <Route path="/volunteers" element={<Volunteers />} />
        <Route path="/volunteer_events" element={<VolunteerEvents />} />
      </Routes>
    </Router>
  );
}
