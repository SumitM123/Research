import { createContext, useState, useContext } from "react";

const columnInfo = createContext();

// This is the custom hook to use the column info context
export const useColumnInfo = () => {
    const context = useContext(columnInfo);
    if (!context) {
        throw new Error("useColumnInfo must be used within a ColumnInfoProvider");
    }
    return context;
}

export const ColumnInfoProvider = ({ children }) => {
    //setting the initial match
    const [dataFileColumn, setDataFileColumn] = useState("")
    const [dataBaseFileColumn, setDataBaseFileColumn] = useState("");
    //available info to choose from for intial match
    const [dataFileAvailableTopics, setDataFileAvailableTopics] = useState([]);
    const [dataBaseFileAvailableTopics, setDataBaseFileAvailableTopics] = useState([]);
    const [topicMatch, setTopicMatch] = useState({});
    //each column from the dataFile to the dataBaseFile
    const [matches, setMatches] = useState([{}]);
    return (
        <columnInfo.Provider value={{ dataFileColumn, setDataFileColumn, dataBaseFileColumn, setDataBaseFileColumn, 
        dataFileAvailableTopics, setDataFileAvailableTopics, dataBaseFileAvailableTopics, setDataBaseFileAvailableTopics, 
        matches, setMatches, topicMatch, setTopicMatch }}>
            {children}
        </columnInfo.Provider>
    );
}