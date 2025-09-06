import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
function ColumnCollection(props) {
    const potentialToMatch = props.columnsToMatch;
    const dataBaseHeaders = props.headers;
    const inFirstHalf = props.disabled;
    
    const navigate = useNavigate();
    const usedDataBaseHeaders = new Set();
    const indexToDataBaseHeaders = new Map();
    const dataFileToDataBaseHeader = new Map();
    const selectRef = useRef();
    const arrIndex = 0;

    const continueDisabled = false;
    const backDisabled = true;
    const valueOfNext = "Continue";
    const [warning, setWarning] = useState("");
    
    const checkBackDisabled = (index) => {
        const backVal = false;
        if(index <= 0) {
            backVal = true;
        } else {
            backVal = false;
        }
        return backVal;
    }
    const handleContinueClick = (e) => {
        //MouseEvent which is a subclass of Event interface
        //insert the current element of the shi into usedDataBaseHeaders and indexToDataBaseHeaders
        if(valueOfNext === "Done") {
            navigate('/outputPage');
        }
        usedDataBaseHeaders.add(selectRef.current.value);
        indexToDataBaseHeaders.set(arrIndex, selectRef.current.value);
        dataFileToDataBaseHeader.set(potentialToMatch[arrIndex], selectRef.current.value);
        arrIndex++;
        if(arrIndex >= (potentialToMatch.length - 1)) {
            valueOfNext = "Done";
        }
        backDisabled = checkBackDisabled(arrIndex);
        selectOptions(arrIndex);
    }
    const handleBackClick = (e) => {
        arrIndex--;
        const valToRemove = indexToDataBaseHeaders.remove(arrIndex);
        usedDataBaseHeaders.remove(valToRemove);
        backDisabled = checkBackDisabled(arrIndex);
        selectOptions(arrIndex);
    }
    const handleSelect = (e) => {
        //e.target references the specific dom element that triggered the event listener
        if(usedDataBaseHeaders.has(e.target.value)) {
            setWarning("Warning: this data base header has already been assigned to a different column");
        }
        setWarning("");
    }
    function selectOptions(index) {
        const currentMatch = potentialToMatch[index];
        return (
            <select onChange={handleSelect} disabled={inFirstHalf}>
                Please select a column from the data base file to match with {currentMatch}
                <option value="" disabled>
            -- Select a column from your database collection to match with your data collection file--
                </option>
                {(dataBaseHeaders || []).map((topic, idx) => (
                    <option key={idx} value={topic}>
                    {topic}
                    </option>
                ))}
                <p style={{ color: "red" }}>
                    {warning}
                </p>
            </select>

        )
    }
    return (
        <div>
            {selectOptions(arrIndex)};
            <button onClickdisabled={backDisabled}>
                Back
            </button>
            <button onClick={handleContinueClick} disabled={continueDisabled}>
                {valueOfNext}
            </button>
        </div>
    )
}
export default ColumnCollection;