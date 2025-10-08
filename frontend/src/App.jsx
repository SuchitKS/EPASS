import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ApiProvider } from './contexts/ApiContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Events from './pages/Events';
import Participants from './pages/Participants';
import Organizers from './pages/Organizers';
import Volunteers from './pages/Volunteers';
import RegisterEvent from './pages/RegisterEvent';
import EventForm from './pages/EventForm';
import Ticket from './pages/Ticket';
import NotFound from './pages/NotFound';
import './App.css';

// Wrapper component to handle layout and routing
const AppContent = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  // Define routes that should have the layout
  const routesWithLayout = [
    '/', '/events', '/participants', '/organizers', 
    '/volunteers', '/register-event', '/event-form', '/ticket'
  ];

  const shouldShowLayout = routesWithLayout.some(route => 
    location.pathname === route || location.pathname.startsWith(`${route}/`)
  );

  // Create a layout wrapper if needed
  const withLayout = (element) => {
    if (!shouldShowLayout) return element;
    return <Layout>{element}</Layout>;
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={isLoginPage ? <Login /> : <Navigate to="/" />} />
      
      {/* Protected Routes with Layout */}
      <Route path="/" element={
        <ProtectedRoute>
          {withLayout(<Events />)}
        </ProtectedRoute>
      } />
      
      <Route path="/participants" element={
        <ProtectedRoute>
          {withLayout(<Participants />)}
        </ProtectedRoute>
      } />
      
      <Route path="/organizers" element={
        <ProtectedRoute>
          {withLayout(<Organizers />)}
        </ProtectedRoute>
      } />
      
      <Route path="/volunteers" element={
        <ProtectedRoute>
          {withLayout(<Volunteers />)}
        </ProtectedRoute>
      } />
      
      <Route path="/register-event" element={
        <ProtectedRoute>
          {withLayout(<RegisterEvent />)}
        </ProtectedRoute>
      } />
      
      <Route path="/event-form" element={
        <ProtectedRoute>
          {withLayout(<EventForm />)}
        </ProtectedRoute>
      } />
      
      <Route path="/ticket/:eventId" element={
        <ProtectedRoute>
          {withLayout(<Ticket />)}
        </ProtectedRoute>
      } />
      
      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// Main App component with providers
function App() {
  return (
    <Router>
      <AuthProvider>
        <ApiProvider>
          <AppContent />
        </ApiProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
