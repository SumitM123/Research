import React from 'react';
import { useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { useColumnInfo } from '../Contexts/columnInfoContext.js';
import { useFilesInfo } from '../Contexts/filesContext.js';
import Papa from 'papaparse';
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

//maybe add props to tell it what to prompt to output so what stage it is at
const LoadingPage = () => {
  const navigate = useNavigate();
  const columnInfo = useColumnInfo();
  const filesInfo = useFilesInfo();
  const result = async () => {
    try {
      const objectToSend = {
        dataFile: filesInfo.dataFile.name,
        dataBaseFile: filesInfo.databaseFile.name,
        topic: filesInfo.topic,
        initialDataFileColumn: columnInfo.initialTopicMatch.dataFileMatch,
        initialDataBaseColumn: columnInfo.initialTopicMatch.dataBaseMatch,
        potentialToMatch: columnInfo.potentialToMatch,
        matches: columnInfo.matches,
        dataBaseContent: columnInfo.dataBaseContent,
        dataFileContent: columnInfo.dataFileContent
      };
      console.log("Before asking to extract data")
      const response = await axios.post(
        "http://localhost:5000/extractData",
        objectToSend,
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("After asking to extract data")
      // Parse CSV properly with PapaParse
      const parsed = Papa.parse(response.data.data, { header: false });
      navigate("/output", { state: { output: parsed.data } });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    result();
  }, []);
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
    <div style={subTextStyle}>Please wait while we read your data</div>
  </div>
  );
}
export default LoadingPage;
