import React from "react";
import axios from "axios";
const { useColumnInfo } = require("../Contexts/columnInfoContext.js");
const { useFilesInfo } = require("../Contexts/filesContext.js");

const OutputPage = () => {
    const columnInfo = useColumnInfo();
    const filesInfo = useFilesInfo();
    const [outputFromServer, setOutputFromServer] = useState("");
    const result = async () => {
        try {
            const objectToSend = {
                dataFile: filesInfo.dataFile,
                dataBaseFile: filesInfo.databaseFile,
                topic: filesInfo.topic,
                initialDataFileColumn: columnInfo.initialTopicMatch.dataFileMatch,
                initialDataBaseColumn: columnInfo.initialTopicMatch.dataBaseMatch,
                potentialToMatch: columnInfo.potentialToMatch,
                matches: columnInfo.matches,
                dataBaseContent: columnInfo.dataBaseContent,
                dataFileContent: columnInfo.dataFileContent
            }
            //const dataFileVal = JSON.stringify(filesInfo.dataFile);
            //console.log("dataFileVal: ", dataFileVal);

            //MIGHT HAVE TO CHANGE TO POST REQUEST AND APPENDING THE OBJECT TO SEND TO THE REQ BODY
            const response = await axios.get('/extractData', {
                params: objectToSend
            });
            setOutputFromServer(response.data);
        } catch(error) {
            console.error("Error fetching data:", error);
        }
    }
  return (
    <div>
      <h1>Output Page</h1>
        <p>{outputFromServer}</p>
    </div>
  );
}