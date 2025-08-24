import React from 'react';
const axios = require('axios');
const loaderStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)',
  fontFamily: 'Segoe UI, Arial, sans-serif',
};

const spinnerStyle = {
  width: '70px',
  height: '70px',
  border: '8px solid #e0eafc',
  borderTop: '8px solid #3498db',
  borderRadius: '50%',
  animation: 'spin 1.2s linear infinite',
  marginBottom: '30px',
};

const textStyle = {
  color: '#3498db',
  fontSize: '2rem',
  fontWeight: 600,
  letterSpacing: '2px',
  marginBottom: '10px',
};

const subTextStyle = {
  color: '#555',
  fontSize: '1.1rem',
  fontWeight: 400,
  letterSpacing: '1px',
};

const LoadingPage = () => {
  return (
  <div style={loaderStyle}>
    <style>
      {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}
    </style>
    <div style={spinnerStyle}></div>
    <div style={textStyle}>Loading...</div>
    <div style={subTextStyle}>Please wait while we prepare your data</div>
  </div>
  );
}
export default LoadingPage;
