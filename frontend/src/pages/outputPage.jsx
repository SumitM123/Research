import React from "react";
import axios from "axios";
const { useColumnInfo } = require("../Contexts/columnInfoContext.js");
const { useFilesInfo } = require("../Contexts/filesContext.js");

const OutputPage = () => {
    const columnInfo = useColumnInfo();
    const filesInfo = useFilesInfo();
    const result = async () => {
        try {
            const objectToSend = {
                dataFile: filesInfo.dataFile,
                dataBaseFile: filesInfo.databaseFile,
                topic: filesInfo.topic,
                dataFileColumn: columnInfo.dataFileColumn,
                dataBaseFileColumn: columnInfo.dataBaseFileColumn,
                potentialToMatch: Array.from(columnInfo.potentialToMatch),
                matches: columnInfo.matches
            }
            //const dataFileVal = JSON.stringify(filesInfo.dataFile);
            //console.log("dataFileVal: ", dataFileVal);
            const response = axios.get('/extractData', matches, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        } catch(error) {
            console.error("Error fetching data:", error);
        }
    }
  return (
    <div>
      <h1>Output Page</h1>

    </div>
  );
}