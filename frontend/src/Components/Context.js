import { createContext } from "react";

const filesInfo = createContext();

export const useFilesInfo = () => {
    const context = useContext(filesInfo);
    if (!context) {
        throw new Error("useFilesInfo must be used within a FilesProvider");
    }
    return context;
}
export const FilesProvider = ({ children }) => {
  const [databaseFile, setDatabaseFile] = useState(null);
  const [dataFile, setDataFile] = useState(null);

  return (
    <filesInfo.Provider value={{ databaseFile, setDatabaseFile, dataFile, setDataFile }}>
      {children}
    </filesInfo.Provider>
  );
}