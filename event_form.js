document.addEventListener('DOMContentLoaded', () => {
  // Show message to user
  function showMessage(text, isError = false) {
    // Remove any existing message
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
      existingMessage.remove();
    }

    // Create new message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isError ? 'error' : 'success'}`;
    messageDiv.textContent = text;

    // Style the message
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

    // Add CSS animation
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

    // Remove message after 5 seconds
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

  // Form submission handler
  document.getElementById('eventForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
      eventName: document.getElementById('eventName').value,
      eventDescription: document.getElementById('eventDescription').value,
      eventDate: document.getElementById('eventDate').value,
      eventTime: document.getElementById('eventTime').value,
      eventLocation: document.getElementById('eventLocation').value,
      maxParticipants: parseInt(document.getElementById('maxParticipants').value),
      maxVolunteers: parseInt(document.getElementById('maxVolunteers').value),
      organizerUSN: document.getElementById('organizerUSN').value,
      OrgCid: parseInt(document.getElementById('OrgCid').value) || null,
      registrationFee: parseFloat(document.getElementById('registrationFee').value)
    };

    // Basic validation
    if (!data.eventName || !data.eventDescription || !data.eventDate || !data.eventTime || !data.eventLocation || !data.organizerUSN || !data.OrgCid) {
      showMessage('Please fill in all required fields.', true);
      return;
    }

    // Validate USN format
    if (!/^1BM\d{2}[A-Z]{2}\d{3}$/.test(data.organizerUSN)) {
      showMessage('Invalid USN format. Example: 1BM23CS101', true);
      return;
    }

    // Validate Club ID
    if (data.OrgCid <= 0) {
      showMessage('Club ID must be a positive number.', true);
      return;
    }

    // Validate date (must be in the future)
    const eventDate = new Date(data.eventDate);
    const currentDate = new Date();
    if (eventDate <= currentDate) {
      showMessage('Event date must be in the future.', true);
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/events/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await res.json();
      console.log('Server response:', result);

      if (res.ok) {
        showMessage('Event created successfully!');
        document.getElementById('eventForm').reset();
        setTimeout(() => {
          window.location.href = '/organisers.html';
        }, 2000);
      } else {
        if (res.status === 401) {
          showMessage('Please sign in to create an event.', true);
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        } else {
          showMessage(`Failed to create event: ${result.error}`, true);
        }
      }
    } catch (err) {
      console.error('Error creating event:', err);
      showMessage(`Error: ${err.message}`, true);
    }
  });
});