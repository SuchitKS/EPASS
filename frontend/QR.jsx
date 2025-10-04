import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';

function QRCodePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [qrData, setQrData] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    const eventId = searchParams.get('eventId');
    const usn = searchParams.get('usn');

    if (!eventId || !usn) {
      setError(true);
      return;
    }

    const qrText = `https://epass-backend.onrender.com/api/scan-qr?usn=${usn}&eid=${eventId}`;
    setQrData(qrText);
  }, [searchParams]);

  return (
    <div style={{
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
      background: '#00416A',
      background: '-webkit-linear-gradient(to right, #E4E5E6, #00416A)',
      background: 'linear-gradient(to right, #E4E5E6, #00416A)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ color: '#2c3e50', fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Event Check-in</h1>
          <p style={{ color: '#34495e', fontSize: '16px' }}>Present your QR code at the venue</p>
        </div>
        
        {error && (
          <div style={{
            textAlign: 'center',
            color: '#ff6b6b',
            padding: '2rem',
            background: 'rgba(255, 107, 107, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 107, 107, 0.3)'
          }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Error</h3>
            <p style={{ fontSize: '1rem', opacity: 0.9 }}>Unable to generate QR code. Please try again.</p>
          </div>
        )}
        
        {!error && qrData && (
          <div style={{
            width: '280px',
            height: '350px',
            borderRadius: '30px',
            background: '#212121',
            boxShadow: '5px 5px 10px rgb(40, 40, 40), -5px -5px 10px rgb(60, 60, 60)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            margin: '20px 0'
          }}>
            <div style={{ color: '#ffffff', marginBottom: '20px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>QR Code</h2>
              <p style={{ color: '#b0b0b0', fontSize: '14px' }}>Scan to check-in</p>
            </div>
            <div style={{
              background: 'white',
              padding: '15px',
              borderRadius: '15px',
              boxShadow: 'inset 5px 5px 10px rgba(0, 0, 0, 0.2)'
            }}>
              <QRCodeCanvas
                value={qrData}
                size={180}
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
              />
            </div>
          </div>
        )}
        
        <a
          href="javascript:history.back()"
          onClick={(e) => { e.preventDefault(); navigate(-1); }}
          style={{
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontWeight: 600,
            padding: '12px 24px',
            marginTop: '20px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textDecoration: 'none',
            display: 'inline-block'
          }}
        >
          Back to Ticket
        </a>
      </div>
    </div>
  );
}

export default QRCodePage;