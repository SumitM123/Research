import React, { useEffect, useState } from "react";
import axios from "axios";
import Papa from "papaparse";
import { useColumnInfo } from "../Contexts/columnInfoContext.js";
import { useFilesInfo } from "../Contexts/filesContext.js";
import { useLocation } from "react-router-dom";
const OutputPage = () => {
    const location = useLocation();
    const [outputFromServer, setOutputFromServer] = useState(location.state.output || []);
    const [urlDownload, setUrlDownload] = useState("");
    useEffect(() => {
        //you're getting a file
        const fetchData = async () => {
          const response = await axios.post('http://localhost:5000/createDownload', { editedDataFile: outputFromServer }, { responseType: 'blob' });
          setUrlDownload(URL.createObjectURL(new Blob([response.data], { type: 'text/csv' })));
        };
        fetchData();
    }, []);
  return (
    <div>
      <h1>Output Page</h1>
      <a href={urlDownload} download="extracted_data.csv">Download Extracted Data</a>
      <table border="1" cellPadding="5" style={{ borderCollapse: "collapse" }}>
        <thead>
          {outputFromServer.length > 0 && (
            <tr>
              {outputFromServer[0].map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          )}
        </thead>
        <tbody>
          {outputFromServer.slice(1).map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OutputPage;
