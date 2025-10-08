import { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApi } from '../contexts/ApiContext';
import { AuthContext } from '../contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import QRCode from 'qrcode.react';
import '../styles/Ticket.css';

const Ticket = () => {
  const { api } = useApi();
  const { user } = useContext(AuthContext);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAttended, setIsAttended] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTicketData = async () => {
      try {
        setLoading(true);
        const searchParams = new URLSearchParams(location.search);
        const eventId = searchParams.get('eventId');
        
        if (!eventId) {
          throw new Error('No event ID provided');
        }

        // Fetch event details and ticket info in parallel
        const [{ data: eventData, error: eventError }, 
                { data: ticketData, error: ticketError }] = await Promise.all([
          api.getEvent(eventId),
          api.getUserTicket(eventId)
        ]);

        if (eventError) throw new Error(eventError);
        if (ticketError) throw new Error(ticketError);
        
        setEvent(eventData);
        setIsAttended(ticketData?.attended || false);
        setTicketId(ticketData?._id || '');
        
      } catch (err) {
        console.error('Error fetching ticket data:', err);
        setError(err.message || 'Failed to load ticket information');
      } finally {
        setLoading(false);
      }
    };

    fetchTicketData();
  }, [location.search, api]);

  const handleDownload = () => {
    // Create a temporary link to trigger download
    const link = document.createElement('a');
    link.download = `ticket-${event?._id || 'event'}.png`;
    
    // Get the QR code canvas and convert to data URL
    const canvas = document.getElementById('ticket-qr-code');
    if (canvas) {
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Ticket</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/events')}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-yellow-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Ticket Found</h2>
          <p className="text-gray-600 mb-6">
            You don't have a ticket for this event or the event doesn't exist.
          </p>
          <button
            onClick={() => navigate('/events')}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Browse Events
          </button>
        </div>
      </div>
    );
  }

  const eventDate = event.date ? parseISO(event.date) : new Date();
  const formattedDate = format(eventDate, 'EEEE, MMMM d, yyyy');
  const formattedTime = format(eventDate, 'h:mm a');

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8 print:bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden print:shadow-none">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold">Event Ticket</h1>
                <p className="text-blue-100">Present this ticket at the event entrance</p>
              </div>
              <div className="bg-white text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                {isAttended ? 'ATTENDED' : 'VALID'}
              </div>
            </div>
          </div>
          
          {/* Ticket Content */}
          <div className="p-6 md:flex">
            {/* Event Details */}
            <div className="md:flex-1 md:pr-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{event.name}</h2>
                <p className="text-gray-600">{event.description}</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-blue-600">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Date & Time</p>
                    <p className="text-sm text-gray-900">
                      {formattedDate} at {formattedTime}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-blue-600">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Location</p>
                    <p className="text-sm text-gray-900">{event.location || 'TBA'}</p>
                  </div>
                </div>
                
                {event.organizer && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 text-blue-600">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Organizer</p>
                      <p className="text-sm text-gray-900">{event.organizer.name}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-blue-600">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Attendee</p>
                    <p className="text-sm text-gray-900">
                      {user?.name || 'Guest'}
                      {user?.email && <span className="block text-gray-500 text-xs">{user.email}</span>}
                    </p>
                  </div>
                </div>
                
                {event.registrationFee > 0 && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 text-blue-600">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Amount Paid</p>
                      <p className="text-sm text-gray-900">
                        ₹{event.registrationFee.toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-8 flex space-x-3 print:hidden">
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Download
                </button>
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                  </svg>
                  Print Ticket
                </button>
              </div>
              
              <div className="mt-4 text-xs text-gray-500 print:hidden">
                <p>• Present this ticket (digital or printed) at the event entrance.</p>
                <p>• The QR code is your unique identifier for this event.</p>
                <p>• For any issues, please contact the event organizer.</p>
              </div>
            </div>
            
            {/* QR Code */}
            <div className="mt-8 md:mt-0 md:ml-8 flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="p-2 bg-white rounded">
                  <QRCode
                    id="ticket-qr-code"
                    value={`${window.location.origin}/verify-ticket?event=${event._id}&ticket=${ticketId}&user=${user?.id || 'guest'}`}
                    size={180}
                    level="H"
                    includeMargin={true}
                    renderAs="canvas"
                  />
                </div>
                <div className="mt-2 text-center text-xs text-gray-500">
                  <p>Ticket ID: {ticketId.substring(0, 8).toUpperCase()}</p>
                  <p className="text-blue-600 font-medium">SCAN AT ENTRANCE</p>
                </div>
              </div>
              
              <div className="mt-4 text-center text-sm text-gray-600">
                <p className="font-medium">Need Help?</p>
                <p className="text-xs">Email: {event.organizer?.email || 'support@example.com'}</p>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 text-center text-xs text-gray-500 print:hidden">
            <p>This ticket is non-transferable. The event organizer reserves the right to refuse entry.</p>
            <p className="mt-1">© {new Date().getFullYear()} {event.organizer?.name || 'Event Management System'}. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ticket;
