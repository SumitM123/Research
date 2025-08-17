import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useFilesInfo } from '../Components/Context.js';
import { useNavigate } from 'react-router-dom';

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

//MIGHT HAVE TO DELETE THE AXIOS POST REQUEST HERE
const LoadingPage = () => {
  const { databaseFile, dataFile } = useFilesInfo();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const uploadFiles = async () => {
      try {
        const formData = new FormData();
        formData.append('dataFile', dataFile);
        formData.append('dataBaseFile', databaseFile);

        const response = await axios.post('http://localhost:5000/processFiles', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log('Files processed successfully:', response.data);
        // Navigate to results page after successful processing
        navigate('/results');
      } catch (error) {
        console.error('Error processing files:', error);
        setError(error.message);
      }
    };

    if (databaseFile && dataFile) {
      uploadFiles();
    } else {
      navigate('/'); // Redirect back if no files
    }
  }, [databaseFile, dataFile, navigate]);

  if (error) {
    return (
      <div style={loaderStyle}>
        <div style={textStyle}>Error</div>
        <div style={subTextStyle}>{error}</div>
      </div>
    );
  }

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
