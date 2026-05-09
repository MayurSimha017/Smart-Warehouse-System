import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const Scanner = ({ onScanSuccess }) => {
  const scannerRef = useRef(null);

  useEffect(() => {
    // Only start if not already started
    if (!scannerRef.current) {
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;

      html5QrCode.start(
  { facingMode: "environment" },
  { 
    fps: 20,              // Increased from 10 to 20 for faster detection
    qrbox: { width: 280, height: 280 }, // Slightly larger box
    aspectRatio: 1.0 
  },
  (decodedText) => {
    onScanSuccess(decodedText);
  },
  (errorMessage) => { /* ignore */ }
)
    }

    // Cleanup: Stop the camera when component is closed
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop()
          .then(() => {
            scannerRef.current.clear();
            scannerRef.current = null;
          })
          .catch(err => console.log("Stop error", err));
      }
    };
  }, [onScanSuccess]);

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <div id="reader" style={{ borderRadius: '15px', overflow: 'hidden', border: '4px solid #00d1b2' }}></div>
    </div>
  );
};

export default Scanner;