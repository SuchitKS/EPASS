document.addEventListener('DOMContentLoaded', function () {
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

  // Categorize events based on current date
  function categorizeEvents(events) {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
    
    const categorized = {
      ongoing: [],
      completed: [],
      upcoming: []
    };

    events.forEach(event => {
      const eventDate = new Date(event.eventDate);
      eventDate.setHours(0, 0, 0, 0); // Reset time to start of day
      
      const diffTime = eventDate.getTime() - currentDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        categorized.ongoing.push(event);
      } else if (diffDays < 0) {
        categorized.completed.push(event);
      } else {
        categorized.upcoming.push(event);
      }
    });

    return categorized;
  }

  // Modified event HTML creation with buttons for each event
  function createEventHTML(events, eventType) {
    if (!Array.isArray(events) || events.length === 0) {
      return `<div class="event-item">
        <p><strong>No events available</strong></p>
      </div>`;
    }

    return events.map(event => `
      <div class="event-item" data-event-id="${event.eid}">
        <div class="event-info">
          <p><strong>${event.ename || 'N/A'}</strong></p>
          <p>Date: ${formatDate(event.eventDate)}</p>
          <p>Time: ${formatTime(event.eventTime)}</p>
          <p>Location: ${event.eventLoc || 'N/A'}</p>
          ${event.clubName ? `<p>Club: ${event.clubName}</p>` : ''}
          <p>Status: ${getParticipantStatus(event.PartStatus)}</p>
        </div>
        <div class="event-actions">
          <button class="event-btn" data-event-id="${event.eid}" data-event-type="${eventType}">
            ${getButtonText(eventType)}
          </button>
        </div>
      </div>
    `).join('');
  }

  // Get participant status text
  function getParticipantStatus(status) {
    switch(status) {
      case 0: return 'Registered';
      case 1: return 'Attended';
      default: return 'Unknown';
    }
  }

  // Get appropriate button text based on event type
  function getButtonText(eventType) {
    switch(eventType) {
      case 'ongoing': return 'View Details';
      case 'completed': return 'View Certificate';
      case 'upcoming': return 'View Details';
      default: return 'View';
    }
  }

  // Handle event button clicks
  function handleEventButtonClick(eventId, eventType) {
    console.log(`Button clicked for event ${eventId} (${eventType})`);
    // Redirect to event details page
    window.location.href = `/ticket3.html?eventId=${eventId}`;
  }

  // Update card contents
  function updateCards(data) {
    ['ongoing', 'completed', 'upcoming'].forEach(type => {
      const card = document.getElementById(`${type}-card`);
      const detailsContainer = card.querySelector('.card__details');
      detailsContainer.innerHTML = createEventHTML(data[type], type);
    });

    // Add event listeners to all event buttons
    document.querySelectorAll('.event-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent card hover effects from interfering
        const eventId = btn.getAttribute('data-event-id');
        const eventType = btn.getAttribute('data-event-type');
        handleEventButtonClick(eventId, eventType);
      });
    });
  }

  // Fetch and display event data
  fetch('/api/my-participant-events')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Received data:', data); // Debug log
      
      // Handle the participant events data structure
      const participantEvents = data.participantEvents || [];
      
      // Categorize events by date
      const categorizedEvents = categorizeEvents(participantEvents);
      
      console.log('Categorized events:', categorizedEvents); // Debug log
      
      // Update the cards with categorized data
      updateCards(categorizedEvents);

      // Add hover effects to cards
      document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mouseover', () => card.classList.add('hover'));
        card.addEventListener('mouseout', () => card.classList.remove('hover'));
      });
    })
    .catch(error => {
      console.error('Error fetching participant events:', error);
      
      // Show error message in all cards
      document.querySelectorAll('.card__details').forEach(el => {
        el.innerHTML = `<div class="event-item">
          <p><strong>Error:</strong> Could not load events. ${error.message}</p>
        </div>`;
      });
    });

  // "Participate in other Event" button handler
  const button = document.querySelector('.button-container button');
  if (button) {
    button.addEventListener('click', () => {
      window.location.href = '/registerevent.html';
    });
  }

  // Logout button handler
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        const response = await fetch('/api/signout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        
        if (data.success) {
          // Redirect to login page
          window.location.href = '/';
        } else {
          alert('Error logging out. Please try again.');
        }
      } catch (error) {
        console.error('Logout error:', error);
        alert('Error logging out. Please try again.');
      }
    });
  }
});