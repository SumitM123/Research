import { createContext, useState, useContext } from "react";

const columnInfo = createContext();

// This is the custom hook to use the files context
export const useColumnInfo= () => {
    const context = useContext(filesInfo);
    if (!context) {
        throw new Error("useFilesInfo must be used within a FilesProvider");
    }
    return context;
}

export const ColumnInfoProvider = ({ children }) => {
    const [topic, setTopic] = useState("");
    const [dataFileColumn, setDataFileColumn] = useState("");
    const [dataBaseFileColumn, setDataBaseFileColumn] = useState("");
    const [matches, setMatches] = useState([]);
    return (
        <columnInfo.Provider value={{ topic, setTopic, dataFileColumn, setDataFileColumn, dataBaseFileColumn, setDataBaseFileColumn, matches, setMatches }}>
            {children}
        </columnInfo.Provider>
    );
}