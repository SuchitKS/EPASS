import React, { useEffect } from 'react';

export default function Scanner() {
  useEffect(() => {
    // Place QR scanner logic here using a React QR library
  }, []);

  return (
    <div className="scanner-container">
      <div className="header">
        <div className="scanner-icon">📱</div>
        <h1>QR Code Scanner</h1>
        <p className="subtitle">Point your camera at a QR code to scan</p>
      </div>
      <div className="scanner-frame">
        <div id="reader"></div>
        <div className="scanning-indicator" id="scanning-indicator">🔍 Scanning...</div>
      </div>
      <div id="result-container" className="result-container">
        <div className="result-icon">✅</div>
        <div className="result-title">Scan Successful!</div>
        <div className="result-content" id="result-content"></div>
        <div className="result-actions">
          <a href="#" id="result-link" className="action-btn" target="_blank" rel="noopener noreferrer" style={{ display: 'none' }}>🔗 Open Link</a>
          <button className="action-btn" id="copy-btn">📋 Copy</button>
          <button className="action-btn scan-again-btn" id="scan-again-btn">🔄 Scan Again</button>
        </div>
      </div>
      <div className="instructions">
        <div className="instructions-title">📋 Instructions:</div>
        • Allow camera access when prompted<br />
        • Hold your device steady<br />
        • Make sure the QR code is well-lit<br />
        • Keep the code within the camera frame
      </div>
    </div>
  );
}
