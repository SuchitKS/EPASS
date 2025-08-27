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
      const detailsContainer = card.querySelector('.card__details');
      detailsContainer.innerHTML = createEventHTML(categorizedEvents[type], type);
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

  // Fetch and display volunteer events
  fetch('/api/my-volunteer-events')
    .then(response => {
      if (!response.ok) {
        if (response.status === 401) {
          console.log('Unauthorized, redirecting to login');
          window.location.href = '/';
          return;
        }
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('Volunteer events data:', data);
      updateCards(data.volunteerEvents || []);

      // Add hover effects
      document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mouseover', () => card.classList.add('hover'));
        card.addEventListener('mouseout', () => card.classList.remove('hover'));
      });
    })
    .catch(error => {
      console.error('Error fetching events:', error);
      document.querySelectorAll('.card__details').forEach(el => {
        el.innerHTML = `<div class="event-item">
          <p><strong>Error:</strong> Could not load events</p>
        </div>`;
      });
    });

  // Volunteer in other Event button handler
  console.log('User USN:', sessionStorage.getItem('userUSN')); // Debug authentication
  const button = document.querySelector('#volunteerOtherEvent');
  console.log('Button found:', button); // Debug button
  if (button) {
    button.addEventListener('click', () => {
      console.log('Volunteer button clicked'); // Debug click
      try {
        window.location.assign('/volunteer_events.html');
        console.log('Navigation attempted to /volunteer_events.html');
      } catch (error) {
        console.error('Navigation error:', error);
      }
    });
  } else {
    console.error('Volunteer button not found');
  }

  // Logout functionality
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
      const response = await fetch('/api/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        window.location.href = '/';
      } else {
        alert('Error logging out. Please try again.');
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('Error logging out. Please try again.');
    }
  });
});
