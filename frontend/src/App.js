import React, { useState } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';
import { useFilesInfo } from './Components/Context.js';
function App() {
  // This is the custom for the context
  const fileInfo = useFilesInfo();
  const { databaseFile, setDatabaseFile, dataFile, setDataFile } = fileInfo;

  const navigate = useNavigate(); 

  const isCSV = (file) => {
    return file && file.name.toLowerCase().endsWith('.csv');
  };

  const handleSubmit = (e) => {
    e.preventDefault(); 

    if (!databaseFile && !dataFile) {
      alert("Please upload both files.");
      return;
    } else if (!databaseFile) {
      alert("Please upload the database file.");
      return;
    } else if (!dataFile) {
      alert("Please upload the data collection file.");
      return;
    }

    // Check that both are CSV files
    if (!isCSV(databaseFile)) {
      alert("Database file must be a .csv file.");
      return;
    }
    if (!isCSV(dataFile)) {
      alert("Data collection file must be a .csv file.");
      return;
    }

    navigate('/loading');
  };

  return (
    <div className="app-container">
      <h1 className="title">CSV Data Extractor</h1>
      <form className="upload-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="label">
            Database File (.csv):
            <input
              className="file-input"
              type="file"
              accept=".csv"
              onChange={(e) => setDatabaseFile(e.target.files[0])}
            />
          </label>
        </div>
        <div className="form-group">
          <label className="label">
            Data Collection File (.csv):
            <input
              className="file-input"
              type="file"
              accept=".csv"
              onChange={(e) => setDataFile(e.target.files[0])}
            />
          </label>
        </div>
        <button className="submit-button" type="submit">Extract Data</button>
      </form>
    </div>
  );
}

export default App;
