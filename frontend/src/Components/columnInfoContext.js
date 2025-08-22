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