document.addEventListener('DOMContentLoaded', function () {
  const API_BASE = 'https://epass-backend.onrender.com';

  // Enhanced authentication check
  async function checkAuthStatus() {
    try {
      console.log('🔐 Checking auth status for volunteers page...');
      const response = await fetch(`${API_BASE}/api/me`, {
        method: 'GET',
        credentials: 'include', // CRITICAL: Include credentials
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('🔐 Auth response status:', response.status);
      
      if (response.status === 401) {
        console.log('❌ User not authenticated, redirecting to login');
        window.location.href = '/';
        return false;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const userData = await response.json();
      console.log('✅ User authenticated:', userData);
      return true;
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      window.location.href = '/';
      return false;
    }
  }

  // Check authentication before proceeding
  checkAuthStatus().then(isAuthenticated => {
    if (!isAuthenticated) {
      return; // User will be redirected
    }
    
    // If authenticated, proceed with loading events
    loadVolunteerEvents();
  });

  // Formatting functions
  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function formatTime(timeString) {
    if (!timeString) return 'N/A';
    const timeParts = timeString.split(':');
    let hours = parseInt(timeParts[0]);
    const minutes = timeParts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  }

  // Get volunteer status text
  function getVolunteerStatus(status) {
    switch(status) {
      case 0:
      case false:
        return 'Registered';
      case 1:
      case true:
        return 'Attended';
      default:
        return 'Unknown';
    }
  }

  // Modified event HTML creation with buttons for each event
  function createEventHTML(events, eventType) {
    if (!Array.isArray(events) || events.length === 0) {
      return `<div class="event-item">
        <p><strong>No events available</strong></p>
      </div>`;
    }

    return events.map(event => `
      <div class="event-item">
        <div class="event-info">
          <p><strong>${event.ename || 'N/A'}</strong></p>
          <p>Date: ${formatDate(event.eventDate)}</p>
          <p>Time: ${formatTime(event.eventTime)}</p>
          <p>Location: ${event.eventLoc || 'N/A'}</p>
          ${event.clubName ? `<p>Club: ${event.clubName}</p>` : ''}
          <p>Status: ${getVolunteerStatus(event.VolnStatus)}</p>
        </div>
        <div class="event-actions">
          <button class="event-btn" data-event-id="${event.eid}" data-event-type="${eventType}">
            ${getButtonText(eventType)}
          </button>
        </div>
      </div>
    `).join('');
  }

  // Get appropriate button text based on event type
  function getButtonText(eventType) {
    switch(eventType) {
      case 'ongoing': return 'View Details';
      case 'completed': return 'View Details';
      case 'upcoming': return 'View Details';
      default: return 'View';
    }
  }

  // Handle event button clicks
  function handleEventButtonClick(eventId, eventType) {
    console.log(`Button clicked for event ${eventId} (${eventType})`);
    window.location.href = `/ticket2.html?eventId=${eventId}`;
  }

  // Update card contents
  function updateCards(events) {
    const currentDate = new Date().toISOString().split('T')[0];
    
    const categorizedEvents = {
      ongoing: [],
      completed: [],
      upcoming: []
    };

    events.forEach(event => {
      const eventDate = new Date(event.eventDate).toISOString().split('T')[0];
      if (eventDate === currentDate) {
        categorizedEvents.ongoing.push(event);
      } else if (eventDate < currentDate) {
        categorizedEvents.completed.push(event);
      } else {
        categorizedEvents.upcoming.push(event);
      }
    });

    ['ongoing', 'completed', 'upcoming'].forEach(type => {
      const card = document.getElementById(`${type}-card`);
      if (card) {
        const detailsContainer = card.querySelector('.card__details');
        if (detailsContainer) {
          detailsContainer.innerHTML = createEventHTML(categorizedEvents[type], type);
        }
      }
    });

    // Add event listeners to all event buttons
    document.querySelectorAll('.event-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const eventId = btn.getAttribute('data-event-id');
        const eventType = btn.getAttribute('data-event-type');
        handleEventButtonClick(eventId, eventType);
      });
    });
  }

  // Load volunteer events with enhanced error handling
  async function loadVolunteerEvents() {
    try {
      console.log('🤝 Loading volunteer events...');
      
      const response = await fetch(`${API_BASE}/api/my-volunteer-events`, {
        method: 'GET',
        credentials: 'include', // CRITICAL: Include credentials
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('🤝 Volunteer events response status:', response.status);

      if (response.status === 401) {
        console.log('❌ Unauthorized - redirecting to login');
        window.location.href = '/';
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('🤝 Volunteer events data:', data);
      
      updateCards(data.volunteerEvents || []);

      // Add hover effects
      document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mouseover', () => card.classList.add('hover'));
        card.addEventListener('mouseout', () => card.classList.remove('hover'));
      });

    } catch (error) {
      console.error('❌ Error fetching volunteer events:', error);
      document.querySelectorAll('.card__details').forEach(el => {
        if (el) {
          el.innerHTML = `<div class="event-item">
            <p><strong>Error:</strong> Could not load events. ${error.message}</p>
            <button onclick="location.reload()" class="retry-btn">Retry</button>
          </div>`;
        }
      });
    }
  }

  // Volunteer in other Event button handler
  const button = document.querySelector('#volunteerOtherEvent');
  if (button) {
    button.addEventListener('click', () => {
      console.log('🤝 Volunteer button clicked');
      try {
        window.location.assign('/volunteer_events.html');
        console.log('🔄 Navigation attempted to /volunteer_events.html');
      } catch (error) {
        console.error('❌ Navigation error:', error);
      }
    });
  } else {
    // Fallback: look for any button in button-container
    const fallbackButton = document.querySelector('.button-container button');
    if (fallbackButton) {
      fallbackButton.addEventListener('click', () => {
        console.log('🤝 Fallback volunteer button clicked');
        window.location.href = '/volunteer_events.html';
      });
    } else {
      console.error('❌ Volunteer button not found');
    }
  }

  // Enhanced logout functionality
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        console.log('🚪 Logging out...');
        
        const response = await fetch(`${API_BASE}/api/signout`, {
          method: 'POST',
          credentials: 'include', // CRITICAL: Include credentials
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        console.log('🚪 Logout response:', data);
        
        if (data.success) {
          console.log('✅ Logout successful, redirecting...');
          window.location.href = '/';
        } else {
          alert('Error logging out. Please try again.');
        }
      } catch (error) {
        console.error('❌ Logout error:', error);
        alert('Error logging out. Please try again.');
      }
    });
  }
});
