import React, { useEffect, useState } from "react";
import axios from "axios";
import Papa from "papaparse";
import { useColumnInfo } from "../Contexts/columnInfoContext.js";
import { useFilesInfo } from "../Contexts/filesContext.js";
import { useNavigate, useLocation } from "react-router-dom";
const OutputPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
    const columnInfo = useColumnInfo();
  const filesInfo = useFilesInfo();
  const [outputFromServer, setOutputFromServer] = useState(location.state?.output || []);
  const [hasNavigated, setHasNavigated] = useState(false);

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

      const response = await axios.post(
        "http://localhost:5000/extractData",
        objectToSend,
        { headers: { "Content-Type": "application/json" } }
      );

      // Parse CSV properly with PapaParse
      const parsed = Papa.parse(response.data.data, { header: false });
      setOutputFromServer(parsed.data);
      //navigate("/outputPage", { state: { output: parsed.data } });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    //navigate("/loadingPage");
    result();
  }, []);
//   useEffect(() => {
//     if (!hasNavigated) {
//         if (outputFromServer.length <= 0) {
//             navigate("/loadingPage");
//         } else {
//             navigate("/outputPage");
//         }
//             setHasNavigated(true);
//     }
//   }, [outputFromServer, hasNavigated, navigate]);
  return (
    <div>
      <h1>Output Page</h1>
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
