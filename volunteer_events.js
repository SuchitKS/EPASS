// volunteer_events.js
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

  // Show message to user
  function showMessage(text, isError = false) {
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
      existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isError ? 'error' : 'success'}`;
    messageDiv.textContent = text;

    messageDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 5px;
      color: white;
      font-weight: normal;
      z-index: 1000;
      animation: slideIn 0.3s ease-in-out;
    `;

    if (!document.querySelector('#message-styles')) {
      const style = document.createElement('style');
      style.id = 'message-styles';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(messageDiv);

    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.style.animation = 'slideIn 0.3s ease-in-out reverse';
        setTimeout(() => {
          if (messageDiv.parentNode) {
            messageDiv.remove();
          }
        }, 300);
      }
    }, 5000);
  }

  // Create event HTML with volunteer button or no volunteers message
  function createEventHTML(events) {
    if (!Array.isArray(events) || events.length === 0) {
      return `<div class="event-item">
        <div class="event-info">
          <p><strong>No events available for volunteering</strong></p>
        </div>
      </div>`;
    }

    return events.map(event => {
      const remainingVolunteers = event.maxVoln - (event.volunteerCount || 0);
      const volunteerButton = remainingVolunteers > 0 
        ? `<button class="volunteer-btn" data-event-id="${event.eid}">Volunteer</button>`
        : `<p class="no-volunteers">No more volunteers</p>`;

      return `
        <div class="event-item">
          <div class="event-info">
            <p><strong>${event.ename || 'N/A'}</strong></p>
            <p>Date: ${formatDate(event.eventDate)}</p>
            <p>Time: ${formatTime(event.eventTime)}</p>
            <p>Location: ${event.eventLoc || 'N/A'}</p>
            <p>Volunteers Needed: ${remainingVolunteers > 0 ? remainingVolunteers : 0}/${event.maxVoln || 'N/A'}</p>
          </div>
          <div class="event-actions">
            ${volunteerButton}
          </div>
        </div>
      `;
    }).join('');
  }

  // Fetch events with volunteer counts
  async function fetchEvents() {
    try {
      const response = await fetch('/api/events', {
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        if (response.status === 401) {
          showMessage('Please sign in to view events.', true);
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
          return;
        }
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const allEvents = [
        ...data.events.ongoing,
        ...data.events.upcoming
      ];

      // Fetch volunteer counts for each event
      const eventsWithCounts = await Promise.all(allEvents.map(async event => {
        const countResponse = await fetch(`/api/events/${event.eid}/volunteer-count`);
        const countData = await countResponse.json();
        return { ...event, volunteerCount: countData.count };
      }));

      return eventsWithCounts;
    } catch (error) {
      console.error('Error fetching events:', error);
      showMessage('Could not load events.', true);
      return [];
    }
  }

  // Update event list
  async function updateEventList() {
    const events = await fetchEvents();
    const detailsContainer = document.querySelector('.events-list');
    if (!detailsContainer) {
      console.error('Events list container not found');
      showMessage('Error: Page structure is incorrect.', true);
      return;
    }
    detailsContainer.innerHTML = createEventHTML(events);

    // Add event listeners to volunteer buttons
    document.querySelectorAll('.volunteer-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const eventId = btn.getAttribute('data-event-id');
        await handleVolunteer(eventId);
      });
    });
  }

  // Handle volunteer action
  async function handleVolunteer(eventId) {
    try {
      const response = await fetch(`/api/events/${eventId}/volunteer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('Successfully volunteered for the event!');
        // Refresh the events list
        await updateEventList();
      } else {
        if (response.status === 401) {
          showMessage('Please sign in to volunteer.', true);
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        } else {
          showMessage(`Failed to volunteer: ${data.error}`, true);
        }
      }
    } catch (error) {
      console.error('Error volunteering:', error);
      showMessage('Error volunteering for the event.', true);
    }
  }

  // Initial load
  updateEventList();

  // Back button functionality
  document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = '/volunteers.html';
  });

  // Logout functionality
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
      const response = await fetch('/api/signout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      
      if (data.success) {
        window.location.href = '/';
      } else {
        showMessage('Error logging out. Please try again.', true);
      }
    } catch (error) {
      console.error('Logout error:', error);
      showMessage('Error logging out. Please try again.', true);
    }
  });
});