import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useColumnInfo } from '../Contexts/columnInfoContext';
function ColumnCollection(props) {
    //getting props
    const potentialToMatch = props.columnsToMatch;
    const dataBaseHeaders = props.headers;
    const inFirstHalf = props.disabled;
    // Add key to force remount on reset
    const key = props.resetKey || 0;
    //dataFileMatch and dataBaseMatch
    const topicMatch = props.topicMatch;
    //context column info for setting the matches
    const {matches, setMatches} = useColumnInfo();
    
    const navigate = useNavigate();
    //When updating these objects, ALWAYS return a new object, instead of just modifying the previous object because react will not re-render the component if the reference to the object does not change. You have to treat it as immutable   
    const [usedDataBaseHeaders, setUsedDataBaseHeaders] = useState(new Set(topicMatch.dataBaseMatch ));
    const [indexToDataBaseHeaders, setIndexToDataBaseHeaders] = useState(() => new Map([[-1, topicMatch.dataBaseMatch]]));    
    const [dataFileToDataBaseHeader, setDataFileToDataBaseHeaders] = useState(() => new Map([[topicMatch.dataFileMatch, topicMatch.dataBaseMatch ]]));
    const selectRef = useRef();
    const [arrIndex, setArrIndex] = useState(0);

    const [continueDisabled, setContinueDisabled] = useState(false);
    const [backDisabled, setBackDisabled] = useState(true);
    const [submitDisabled, setSubmitDisabled] = useState(true);
    const [valueOfNext, setValueOfNext] = useState(arrIndex < potentialToMatch.length - 1 ? "Continue" : "Done" );
    const [warning, setWarning] = useState("");
    
    //will return true if back button should be disabled, and false otherwise
    const checkBackDisabled = (index) => {
        return index <= 0;
    }
    const checkContinueDisabled = (index) => {
        return index >= potentialToMatch.length;
    }
    const checkSubmitDisabled = (index) => { 
        return index < potentialToMatch.length;
    }
    //will update the value of the next button 
    const handleContinueClick = (e) => {
        //MouseEvent which is a subclass of Event interface
        //insert the current element of the shi into usedDataBaseHeaders and indexToDataBaseHeaders
        
        // if(valueOfNext === "Done" || arrIndex >= potentialToMatch.length) {
        //     for(const [key, value] of dataFileToDataBaseHeader) {
        //         setMatches(prevValue => [...prevValue, {dataFileColumn: key, dataBaseFileColumn: value}]);
        //     }
            
        // }
        setUsedDataBaseHeaders(prevValue => new Set([...prevValue, selectRef.current.value]));
        //usedDataBaseHeaders.add(selectRef.current.value);
        setIndexToDataBaseHeaders(prevValue => {
            const newMap = new Map(prevValue);
            newMap.set(arrIndex, selectRef.current.value);
            return newMap;
        });
        //indexToDataBaseHeaders.set(arrIndex, selectRef.current.value);
        setDataFileToDataBaseHeaders(prevValue => {
            const newMap = new Map(prevValue);
            newMap.set(potentialToMatch[arrIndex], selectRef.current.value);
            return newMap;
        });
        //dataFileToDataBaseHeader.set(potentialToMatch[arrIndex], selectRef.current.value);
        setArrIndex(prevValue => prevValue + 1);
        //arrIndex++;
        if(arrIndex >= (potentialToMatch.length - 1)) {
            setValueOfNext("Done");
        }
        setBackDisabled(checkBackDisabled(arrIndex));
        setContinueDisabled(checkContinueDisabled(arrIndex));
        setSubmitDisabled(checkSubmitDisabled(arrIndex));
        selectOptions(arrIndex);
    }
    const handleBackClick = (e) => {
        setArrIndex(prevValue => {
            const newIndex = prevValue - 1;
            // Remove mapping for previous index
            setUsedDataBaseHeaders(prevSet => {
                const newSet = new Set(prevSet);
                // Remove the value for previous index
                const valToRemove = indexToDataBaseHeaders.get(newIndex);
                newSet.delete(valToRemove);
                return newSet;
            });
            setIndexToDataBaseHeaders(prevMap => {
                const newMap = new Map(prevMap);
                newMap.delete(newIndex);
                return newMap;
            });
            setBackDisabled(checkBackDisabled(newIndex));
            setContinueDisabled(checkContinueDisabled(newIndex));
            setSubmitDisabled(checkSubmitDisabled(newIndex));
            return newIndex;
        });
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
        const selected = indexToDataBaseHeaders.get(index) || "";
        return (
            <select defaultValue="" onChange={handleSelect} disabled={inFirstHalf} ref={selectRef} required>
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
        );
    }
    const handleSubmit = (e) => {
        for(const [key, value] of dataFileToDataBaseHeader) {
            setMatches(prevValue => [...prevValue, {dataFileColumn: key, dataBaseFileColumn: value}]);
        }
        navigate('/outputPage');
    }

    return (
        <>
            <div key={key}>
                <label>
                    Select the database header to match with the {currentMatch} column:
                </label>
                {selectOptions(arrIndex)}
                <button onClick={handleBackClick} disabled={backDisabled}>
                    Back
                </button>
                <button onClick={handleContinueClick} disabled={continueDisabled}>
                    Continue
                </button>
            </div>
            <button onClick={handleSubmit} disabled={submitDisabled}>
                Submit
            </button>
        </>
    );
}

export default ColumnCollection;
