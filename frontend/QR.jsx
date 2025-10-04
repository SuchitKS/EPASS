import React, { useEffect } from 'react';

export default function QR() {
  useEffect(() => {
    // QR code generation logic can be added here using a React QR library
  }, []);

  return (
    <div className="qr-container">
      <div className="qr-header">
        <h1>Event Check-in</h1>
        <p className="subtitle">Present your QR code at the venue</p>
      </div>
      <div id="errorMessage" className="error-message" style={{ display: 'none' }}>
        <h3>Error</h3>
        <p>Unable to generate QR code. Please try again.</p>
      </div>
      <div className="card">
        <div className="card-header">
          <h2>QR Code</h2>
          <p className="card-subtitle">Scan to check-in</p>
        </div>
        <div id="qrcode" className="qr-code"></div>
      </div>
      <a href="#" className="back-btn" onClick={() => window.history.back()}>Back to Ticket</a>
    </div>
  );
}
