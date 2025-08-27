import React, { useEffect, useRef} from "react";
import { useColumnInfo } from "../Contexts/columnInfoContext";
import "../pages/collectDetails.css"

const CollectDetails = () => {
  const {
    dataFileAvailableTopics,
    dataBaseFileAvailableTopics,
  } = useColumnInfo();
  let lightUpNextButton = false;
  const dataFileRef = useRef(null);
  const dataBaseRef = useRef(null);

  const goToSecondHalf = () => {

  }
  useEffect( () => {
    if(dataFileRef.current.value !== "" && dataBaseRef.current.value !== "") {
      lightUpNextButton = true;
    }

  }, [dataFileRef, dataBaseRef]);
  return (
    <div className="collect-details-page">
      <div className="collect-details-card">
        <h1 className="collect-details-title">
          Match Columns Between Files
        </h1>

        <form className="collect-details-form">
          <div>
            <label className="collect-details-label">
              Select a column from your <span style={{ color: "#2563eb" }}>Data Collection File</span>:
            </label>
            <select required className="collect-details-select" defaultValue="" ref={dataFileRef}>
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
            <select required className="collect-details-select" defaultValue="" ref={dataBaseRef}>
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
          <button onClick={goToSecondHalf} disabled={!lightUpNextButton}>
            Next
          </button>
          {/* ADD LOGIC SO THAT THIS ONLY POPS UP WITH THE RIGHT UPDATED COLUMNS AND IF THE PAST TWO FIELDS HAVE BEEN INPUTTED*/}
          <div>
            <h2 className="collect-details-subtitle">Enter Sample Values</h2>
            <div className="collect-details-grid">
              <input type="text" placeholder="Enter first value" className="collect-details-input" />
              <input type="text" placeholder="Enter second value" className="collect-details-input" />
              <input type="text" placeholder="Enter third value" className="collect-details-input" />
              <input type="text" placeholder="Enter fourth value" className="collect-details-input" />
            </div>
          </div>
          <div>
            <button > Next </button>
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
