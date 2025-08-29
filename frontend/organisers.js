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

  // Modified event HTML creation with buttons for each event
  function createEventHTML(events, eventType) {
    if (!Array.isArray(events) || events.length === 0) {
      return `<div class="event-item">
        <p><strong>No events organized by you</strong></p>
      </div>`;
    }

    return events.map(event => `
      <div class="event-item">
        <div class="event-info">
          <p><strong>${event.ename || 'N/A'}</strong></p>
          <p><em>${event.eventdesc || 'No description'}</em></p>
          <p>Date: ${formatDate(event.eventDate)}</p>
          <p>Time: ${formatTime(event.eventTime)}</p>
          <p>Location: ${event.eventLoc || 'N/A'}</p>
          <p>Max Participants: ${event.maxPart || 'No limit'}</p>
          <p>Max Volunteers: ${event.maxVoln || 'No limit'}</p>
          <p>Registration Fee: ₹${event.regFee || '0'}</p>
          ${event.clubName ? `<p>Club: ${event.clubName}</p>` : ''}
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
      case 'ongoing': return 'View Event';
      case 'completed': return 'View Event';
      case 'upcoming': return 'View Event';
      default: return 'View';
    }
  }

  // Handle event button clicks - Updated to navigate to ticket.html
  function handleEventButtonClick(eventId, eventType) {
    console.log(`Button clicked for event ${eventId} (${eventType})`);
    
    // Navigate to ticket.html with event ID as parameter
    window.location.href = `/ticket.html?eventId=${eventId}`;
  }

  // Logout functionality
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
      const response = await fetch('https://epass-backend.onrender.com/api/signout', {
        method: 'POST',
        credentials: 'include',
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

  // Back button functionality
  document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = '/events.html';
  });

  // Update card contents with organized events categorized by date
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
      const detailsContainer = card.querySelector('.card__details');
      detailsContainer.innerHTML = createEventHTML(categorizedEvents[type], type);
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

  // Fetch and display organized events data (only events organized by the logged-in user)
  fetch('https://epass-backend.onrender.com/api/my-organized-events',{
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }}
       )
    .then(response => {
      if (!response.ok) {
        if (response.status === 401) {
          // User not authenticated, redirect to login
          window.location.href = '/';
          return;
        }
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('Organized events data:', data);
      
      // Update cards with the organized events
      updateCards(data.organizerEvents || []);

      // Add hover effects
      document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mouseover', () => card.classList.add('hover'));
        card.addEventListener('mouseout', () => card.classList.remove('hover'));
      });
    })
    .catch(error => {
      console.error('Error:', error);
      document.querySelectorAll('.card__details').forEach(el => {
        el.innerHTML = `<div class="event-item">
          <p><strong>Error:</strong> Could not load organized events</p>
        </div>`;
      });
    });

  // Organize Event button handler
  const button = document.querySelector('.button-container button');
  if (button) {
    button.addEventListener('click', () => {
      window.location.href = '/event_form.html';
    });
  }
});
