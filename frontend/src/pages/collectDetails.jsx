import React, { useEffect, useRef, useState} from "react";
import { useColumnInfo } from "../Contexts/columnInfoContext.js";
import "./collectDetails.css"
import ColumnCollection from "../Components/columnCollection.jsx";
import { useNavigate } from "react-router-dom";
const CollectDetails = () => {
  //Can only use hooks at the top most level of the functional component. Cannot use hooks inside of a inner function
  const {
    dataFileAvailableTopics, //data collection file headers
    dataBaseFileAvailableTopics,  //data base file headers
    potentialToMatch,
    initialTopicMatch, 
    setIntialTopicMatch,
  } = useColumnInfo();
  const navigate = useNavigate();
  const [inFirstHalf, setInFirstHalf] = useState(true);
  //first half page tag references
  const selectDataFileRef = useRef(null);
  const selectDataBaseRef = useRef(null);
  const [dataFileRef, setDataFileRef] = useState("");
  const [dataBaseRef, setDataBaseRef] = useState("");
  const [resetKey, setResetKey] = useState(0); // for resetting child
  //key is the data collection file column name, and the value is the data base file column
  const [initialMatch, setInitialMatch] = useState({});
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
    selectDataFileRef.current.value = "";
    selectDataBaseRef.current.value = "";
    setInitialMatch({});
    setDataFileRef("");
    setDataBaseRef("");
    setInFirstHalf(true);
    setResetKey(prev => prev + 1); // force child remount
  }
  const goToSecondHalf = () => {
    //console.log("Inside goToSecondHalf");
    setInFirstHalf(false);
    setInitialMatch({dataFileMatch: dataFileRef, dataBaseMatch: dataBaseRef});
  }
  const buttonValForFirstHalf = () => {
    if(inFirstHalf) {
      return "Next";
    } else {
      return "Back";
    }
  }
  return (
    <div className="collect-details-page">
      <div className="collect-details-card">
        <h1 className="collect-details-title">
          Match Columns Between Files
        </h1>

        <form className="collect-details-form">
          {/* FIRST HALF WRAPPER */}
          <div
            className="firstHalfWrapper"
            style={inFirstHalf ? {} : { opacity: 0.5, pointerEvents: "none" }}
          >
            {/* Data Collection File */}
            <div>
              <label className="collect-details-label">
                Select a column from your <span style={{ color: "#2563eb" }}>Data Collection File</span>:
              </label>
              <select required className="collect-details-select" defaultValue="" disabled={!inFirstHalf}
                onChange={(e) => setDataFileRef(prevValue => e.target.value)} ref={selectDataFileRef}>
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
              <select required className="collect-details-select" defaultValue="" disabled={!inFirstHalf}
                onChange={(e) => setDataBaseRef(prevValue => e.target.value)} ref={selectDataBaseRef}>
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
            <button
              type="button"
              onClick={goToSecondHalf}
              disabled={!(dataFileRef && dataBaseRef)}
              className="collect-details-btn"
              style={{
                marginTop: '1.5rem',
                background: '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '0.5rem 1.5rem',
                fontWeight: 'bold',
                cursor: !(dataFileRef && dataBaseRef) ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                minWidth: '120px',
              }}
            >
              Next
            </button>
          </div>

          {/* SECOND HALF WRAPPER */}
          <div
            className="secondHalfWrapper"
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: '0.5rem',
              opacity: !inFirstHalf ? 1 : 0.5,
              pointerEvents: !inFirstHalf ? 'auto' : 'none',
              transition: 'opacity 0.2s',
            }}
          >
              <ColumnCollection
                columnsToMatch={potentialToMatch || []}
                headers={dataBaseFileAvailableTopics || []}
                disabled={inFirstHalf}
                topicMatch={initialMatch}
                key={resetKey}
              />
            <div style={{ display: !inFirstHalf ? 'flex' : 'none', justifyContent: 'center', marginTop: '2rem' }}>
              <button
                type="button"
                onClick={goBackToFirstHalf}
                className="collect-details-btn"
                style={{
                  background: '#fff',
                  color: '#1976d2',
                  border: '1px solid #1976d2',
                  borderRadius: '6px',
                  padding: '0.5rem 1.5rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  minWidth: '120px',
                }}
              >
                Back to first half
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CollectDetails;
