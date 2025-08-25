import React from 'react';
import './App.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useFilesInfo } from './Contexts/filesContext.js';
import { useColumnInfo } from './Contexts/columnInfoContext.js'
function App() {
  // This is the custom for the context
  //for fileInfo, you only have the data file and the dataBaseFile
  const fileInfo = useFilesInfo();
  //for columnInfo, you have topic, dataFileColumn, dataBaseFileColumn, dataFileAva
  const columnInfo = useColumnInfo();
  const { databaseFile, setDatabaseFile, dataFile, setDataFile, topic, setTopic} = fileInfo;

  const navigate = useNavigate(); 

  const isCSV = (file) => {
    return file && file.name.toLowerCase().endsWith('.csv');
  };

  const handleSubmit = async (e) => {
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

    if(topic === "") {
      alert("Please fill in the topic field It's necessary");
      return;
    }
    const formData = new FormData();
    formData.append('dataFile', dataFile);
    formData.append('dataBaseFile', databaseFile);
    formData.append('topic', topic);
    // formData.append('dataFileColumn', dataFileColumn);
    // formData.append('dataBaseFileColumn', dataBaseFileColumn);
    // formData.append('description', description);
    formData.append('topic', topic);
    try {
      const response = await axios.post("/processFiles", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      //it's an array consisting of the topics that the user can selecct
      
      columnInfo.setDataFileAvailableTopics(response.data.payload.dataFileHeaders);
      columnInfo.setDataBaseFileAvailableTopics(response.data.payload.dataBaseFileHeaders);
      
      console.log(JSON.stringify(response.data));

      //console.log(response.data);
      console.log("Response from server" + response.message);
    } catch (error) {
      console.error('Error uploading files:', error);
      //alert("Error uploading files. Please try again.");
      return;
    }

    navigate('/collectDetails');
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
              name="dataBaseFile"
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
              name="dataFile"
            />
          </label>
        </div>
        <div className="form-group">
          <label className="label">
            Topic:
            <input
              className="file-input"
              type="text"
              onChange={(e) => setTopic(e.target.value)}
              name="description"
            />
          </label>
        </div>
        <button className="submit-button" type="submit">
          Extract Data
        </button>
      </form>

    </div>
  );
}

export default App;
