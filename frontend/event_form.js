document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = 'https://epass-backend.onrender.com';

  // Show message function (unchanged)
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

    // Basic validation (unchanged)
    if (!data.eventName || !data.eventDescription || !data.eventDate || !data.eventTime || !data.eventLocation || !data.organizerUSN || !data.OrgCid) {
      showMessage('Please fill in all required fields.', true);
      return;
    }

    if (!/^1BM\d{2}[A-Z]{2}\d{3}$/.test(data.organizerUSN)) {
      showMessage('Invalid USN format. Example: 1BM23CS101', true);
      return;
    }

    if (data.OrgCid <= 0) {
      showMessage('Club ID must be a positive number.', true);
      return;
    }

    const eventDate = new Date(data.eventDate);
    const currentDate = new Date();
    if (eventDate <= currentDate) {
      showMessage('Event date must be in the future.', true);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/events/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (res.ok) {
        showMessage('Event created successfully!');
        document.getElementById('eventForm').reset();
        setTimeout(() => {
          window.location.href = 'organisers.html';
        }, 2000);
      } else {
        if (res.status === 401) {
          showMessage('Please sign in to create an event.', true);
          setTimeout(() => {
            window.location.href = 'index.html';
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
