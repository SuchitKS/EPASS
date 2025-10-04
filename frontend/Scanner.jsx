import React, { useEffect, useRef, useState } from 'react';

function Scanner() {
  const [lastResult, setLastResult] = useState('');
  const [scanning, setScanning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const html5QrcodeScannerRef = useRef(null);

  useEffect(() => {
    // Load html5-qrcode library
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.3.8/html5-qrcode.min.js';
    script.async = true;
    script.onload = () => {
      initScanner();
    };
    document.body.appendChild(script);

    return () => {
      if (html5QrcodeScannerRef.current) {
        html5QrcodeScannerRef.current.clear();
      }
      document.body.removeChild(script);
    };
  }, []);

  const initScanner = () => {
    setScanning(true);
    setShowResult(false);

    const Html5QrcodeScanner = window.Html5QrcodeScanner;
    
    if (html5QrcodeScannerRef.current) {
      html5QrcodeScannerRef.current.clear();
    }

    html5QrcodeScannerRef.current = new Html5QrcodeScanner('reader', {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 20,
      aspectRatio: 1.0,
      showTorchButtonIfSupported: true,
      showZoomSliderIfSupported: true,
      defaultZoomValueIfSupported: 2,
    });

    html5QrcodeScannerRef.current.render(onScanSuccess, onScanError);
  };

  const onScanSuccess = (decodedText, decodedResult) => {
    console.log(`QR Code detected: ${decodedText}`, decodedResult);
    
    setLastResult(decodedText);
    setShowResult(true);
    setScanning(false);
    
    if (html5QrcodeScannerRef.current) {
      html5QrcodeScannerRef.current.clear();
      html5QrcodeScannerRef.current = null;
    }
  };

  const onScanError = (errorMessage) => {
    console.log(`Scan error: ${errorMessage}`);
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const copyToClipboard = () => {
    if (lastResult) {
      navigator.clipboard.writeText(lastResult).then(() => {
        const copyBtn = document.getElementById('copy-btn');
        if (copyBtn) {
          const originalText = copyBtn.textContent;
          copyBtn.textContent = '✅ Copied!';
          copyBtn.style.background = 'rgba(76, 175, 80, 0.3)';
          
          setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = '';
          }, 2000);
        }
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    }
  };

  const scanAgain = () => {
    setShowResult(false);
    initScanner();
  };

  return (
    <div style={{
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        padding: '32px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px',
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>📱</div>
          <h1 style={{ color: '#2c3e50', fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>QR Code Scanner</h1>
          <p style={{ color: '#7f8c8d', fontSize: '16px' }}>Point your camera at a QR code to scan</p>
        </div>

        <div style={{ position: 'relative', margin: '24px 0', borderRadius: '16px', overflow: 'hidden', background: '#000', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)' }}>
          <div id="reader" style={{ width: '100%', minHeight: '300px', borderRadius: '16px' }}></div>
          {scanning && (
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(76, 175, 80, 0.9)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              animation: 'pulse 2s infinite'
            }}>
              🔍 Scanning...
            </div>
          )}
        </div>

        {showResult && (
          <div style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            borderRadius: '16px',
            padding: '24px',
            marginTop: '24px',
            animation: 'slideIn 0.4s ease'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>✅</div>
            <div style={{ color: 'white', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>Scan Successful!</div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              padding: '16px',
              wordBreak: 'break-all',
              fontFamily: 'Monaco, Menlo, monospace',
              fontSize: '14px',
              color: '#2c3e50',
              maxHeight: '120px',
              overflowY: 'auto'
            }}>
              {lastResult}
            </div>
            <div style={{ marginTop: '16px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {isValidUrl(lastResult) && (
                <a
                  href={lastResult}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px',
                    padding: '10px 20px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textDecoration: 'none',
                    display: 'inline-block'
                  }}
                >
                  🔗 Open Link
                </a>
              )}
              <button
                id="copy-btn"
                onClick={copyToClipboard}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  padding: '10px 20px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                📋 Copy
              </button>
              <button
                onClick={scanAgain}
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: '#667eea',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  padding: '10px 20px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                🔄 Scan Again
              </button>
            </div>
          </div>
        )}

        <div style={{
          background: 'rgba(108, 117, 125, 0.1)',
          borderRadius: '12px',
          padding: '16px',
          marginTop: '24px',
          color: '#6c757d',
          fontSize: '14px',
          lineHeight: '1.5',
          textAlign: 'left'
        }}>
          <div style={{ fontWeight: 600, marginBottom: '8px', color: '#495057' }}>📋 Instructions:</div>
          • Allow camera access when prompted<br />
          • Hold your device steady<br />
          • Make sure the QR code is well-lit<br />
          • Keep the code within the camera frame
        </div>

        <style>{`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
          }
        `}</style>
      </div>
    </div>
  );
}

export default Scanner;