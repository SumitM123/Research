import React, { useEffect, useRef} from "react";
import { useColumnInfo } from "../Contexts/columnInfoContext";
import "../pages/collectDetails.css"
const ColumnCollection = require("../Components/columnCollection.jsx");
const CollectDetails = () => {
  //Can only use hooks at the top most level of the functional component. Cannot use hooks inside of a inner function
  const {
    dataFileAvailableTopics, //data collection file headers
    dataBaseFileAvailableTopics,  //data base file headers
    potentialToMatch
  } = useColumnInfo();
  let lightUpNextButton = false;
  let inFirstHalf = true;
  const dataFileRef = useRef();
  const dataBaseRef = useRef();
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
  const getUpdatedDataBaseHeadersArr = () => {
    let updatedArr = [];
    for(const ele in dataBaseFileAvailableTopics) {
      if(!dataBaseHeadersSelected.has(ele)) {
        updatedArr.push(ele);
      }
    }
    return updatedArr;
  }
  const goToSecondHalf = () => {
    inFirstHalf = false;
    lightUpNextButton = true;
  }
  const buttonValForFirstHalf = () => {
    if(inFirstHalf) {
      return "Next";
    } else {
      return "Back";
    }
  }
  const potentialToMatchSelectOptions = () => {
    const dataCollectionHeaders = getUpdatedDataCollectionArr();
    const matchRef = useRef();
    const elementsToReturn = "";
    if(dataCollectionHeaders.length <= 0) {
      elementsToReturn = ["Done"];
      return elementsToReturn;
    } else {
      elementsToReturn = ["Continue", 
        <select ref={matchRef} defaultValue="">
          <option value="" disabled>
            -- Select a column from your database collection to match with your data collection file--
          </option>
          {(dataFileAvailableTopics || []).map((topic, idx) => (
            <option key={idx} value={topic}>
              {topic}
            </option>
          ))}
        </select>
      , 
        dataBaseHeadersSelected.has(matchRef.current.value) ? 'Warning: this column has already been selected for another data collection column', '';
      ];
    }
    if(matchref)
  }
  useEffect( () => {
    if(dataFileRef.current.value !== "" && dataBaseRef.current.value !== "" && inFirstHalf) {
      lightUpNextButton = true;
      columnMatches.set(dataFileRef.current.value, dataBaseRef.current.value); //Do this line and the next line once the first half is submitted
      dataCollectionHeadersSelected.push(dataFileRef.current.value);
      dataBaseHeadersSelected.push(dataBaseRef.current.value);
    }

  }, [dataFileRef, dataBaseRef]);
  const updatedDataCollectionRef = useRef();
  useEffect( () => {
    dataBaseHeadersSelected.push(updatedDataCollectionRef.current.value); //Do this line and the next line once in the second half of the page, and the user clicked on continue
  }, [updatedDataCollectionRef])
  return (
    <div className="collect-details-page">
      <div className="collect-details-card">
        <h1 className="collect-details-title">
          Match Columns Between Files
        </h1>

        <form className="collect-details-form">
          <div className="firstHalfWrapper">
            <div>
              <label className="collect-details-label">
                Select a column from your <span style={{ color: "#2563eb" }}>Data Collection File</span>:
              </label>
              <select required className="collect-details-select" defaultValue="" ref={dataFileRef} disabled={!inFirstHalf}> 
                <option value="" disabled>
                  -- Select a column --
                </option>
                {(dataFileAvailableTopics || []).map((topic, idx) => (
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
              <select required className="collect-details-select" defaultValue="" ref={dataBaseRef} disabled={!inFirstHalf}>
                <option value="" disabled>
                  -- Select a column --
                </option>
                <option value="" disabled>
                  -- Select a column --
                </option>
              </select>
            </div>
            <button onClick={goToSecondHalf} disabled={!lightUpNextButton}>
                {buttonValForFirstHalf()}
            </button>
          </div>
          {/* For each potentialToMatch from the data collection file, you have to match with one of the columns in the database headers file.  */}
          {/* ADD LOGIC SO THAT THIS ONLY POPS UP WITH THE RIGHT UPDATED COLUMNS AND IF THE PAST TWO FIELDS HAVE BEEN INPUTTED*/}
          <div>
            <h2 className="collect-details-subtitle">Enter Sample Values</h2>
            <div className="collect-details-grid">
              <select required defaultValue="" disabled={inFirstHalf}>
                <ColumnCollection columnsToMatch={potentialToMatch} headers={dataBaseFileAvailableTopics}></ColumnCollection>
              </select>
            </div>
          </div>
          {/* Submit Button */}
          <div style={{ textAlign: "center" }}>
            <button type="submit" className="collect-details-button">
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CollectDetails;
