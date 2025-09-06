import React, { useEffect, useRef, useState} from "react";
import { useColumnInfo } from "../Contexts/columnInfoContext.js";
import "./collectDetails.css"
import ColumnCollection from "../Components/columnCollection.jsx";
const CollectDetails = () => {
  //Can only use hooks at the top most level of the functional component. Cannot use hooks inside of a inner function
  const {
    dataFileAvailableTopics, //data collection file headers
    dataBaseFileAvailableTopics,  //data base file headers
    potentialToMatch
  } = useColumnInfo();

  const [lightUpNextButton, setLightUpNextButton] = useState(false);
  const [inFirstHalf, setInFirstHalf] = useState(true);
  //first half page tag references
  const [dataFileRef, setDataFileRef] = useState("");
  const [dataBaseRef, setDataBaseRef] = useState("");
  //key is the data collection file column name, and the value is the data base file column
  const columnMatches = new Map();
  //the already selected data base headers
  const dataBaseHeadersSelected = new Set();
  //the already selected data collection headers
  const dataCollectionHeadersSelected = new Set();
  const getUpdatedDataCollectionArr = () => {
    //get the updated array
                //key is the data collection file column name, and the value is the data base file column
                  //columnMatches
                //potentialToMatch is a set
    let updatedArr = [];
    //potential to match is in data collection headers
    for(const ele in potentialToMatch) {
      if(!dataCollectionHeadersSelected.has(ele)) {
        updatedArr.push(ele);
      }
    }
    return updatedArr;
  }
  const goBackToFirstHalf = () => {
    //if going back to first half, then you have to restart the entire column matches setting lol
    
    //remove the previous column matches
    columnMatches.clear();
    
    inFirstHalf = true;

  }
  const goToSecondHalf = () => {
    //console.log("Inside goToSecondHalf");
    setInFirstHalf(false);
    setLightUpNextButton(true);
    columnMatches.set(dataFileRef, dataBaseRef); //Do this line and the next line once the first half is submitted
    dataCollectionHeadersSelected.add(dataFileRef);
    dataBaseHeadersSelected.add(dataBaseRef);
  }
  const buttonValForFirstHalf = () => {
    if(inFirstHalf) {
      return "Next";
    } else {
      return "Back";
    }
  }
  useEffect( () => {
    if(dataFileRef !== "" && dataBaseRef !== "") {
      setLightUpNextButton(true);
    }
  }, [dataFileRef, dataBaseRef]);

  return (
    <div className="collect-details-page">
      <div className="collect-details-card">
        <h1 className="collect-details-title">
          Match Columns Between Files
        </h1>

        <form className="collect-details-form">
          <div className="firstHalfWrapper">
            {/* Data Collection File */}
            <div>
              <label className="collect-details-label">
                Select a column from your <span style={{ color: "#2563eb" }}>Data Collection File</span>:
              </label>
              <select required className="collect-details-select" defaultValue=""  disabled={!inFirstHalf} 
                 onChange={(e) => setDataFileRef(prevValue => e.target.value)}> 
                <option value="" disabled>
                  -- Select a column --
                </option>
                {(getUpdatedDataCollectionArr() || []).map((topic, idx) => (
                  <option key={idx} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </div>

            {/* Database File */}
            <div>
              <label className="collect-details-label">
                Select a column from your <span style={{ color: "#16a34a" }}>Database File</span>:
              </label>
              <select required className="collect-details-select" defaultValue="" disabled={!inFirstHalf}
                onChange={(e) => setDataBaseRef(prevValue => e.target.value)}>
                <option value="" disabled>
                  -- Select a column --
                </option>
                {(dataBaseFileAvailableTopics || []).map((topic, idx) => (
                  <option key={idx} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </div>
            <button onClick={goToSecondHalf} disabled={!(dataFileRef && dataBaseRef)}>
              {buttonValForFirstHalf()}
            </button>
          </div>
          {/* For each potentialToMatch from the data collection file, you have to match with one of the columns in the database headers file.  */}
          {/* ADD LOGIC SO THAT THIS ONLY POPS UP WITH THE RIGHT UPDATED COLUMNS AND IF THE PAST TWO FIELDS HAVE BEEN INPUTTED*/}
          <div className="secondHalfWrapper">
            <h2 className="collect-details-subtitle">Enter Sample Values</h2>
            <div className="collect-details-grid">
              <ColumnCollection
                columnsToMatch={potentialToMatch || []}
                headers={dataBaseFileAvailableTopics || []}
                disabled={inFirstHalf}
              />            
            </div>
            {/* Submit Button */}
            <div style={{ textAlign: "center" }}>
              <button type="submit" className="collect-details-button">
                Continue
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CollectDetails;
