import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useColumnInfo } from '../Contexts/columnInfoContext';
function ColumnCollection(props) {
    //getting props
    const potentialToMatch = props.columnsToMatch;
    const dataBaseHeaders = props.headers;
    const inFirstHalf = props.disabled;
    //context column info for setting the matches
    const {matches, setMatches} = useColumnInfo();
    
    const navigate = useNavigate();
    //When updating these objects, ALWAYS return a new object, instead of just modifying the previous object because react will not re-render the component if the reference to the object does not change. You have to treat it as immutable   
    const [usedDataBaseHeaders, setUsedDataBaseHeaders] = useState(new Set());
    const [indexToDataBaseHeaders, setIndexToDataBaseHeaders] = useState(new Map());
    const [dataFileToDataBaseHeader, setDataFileToDataBaseHeaders] = useState(new Map());
    const selectRef = useRef();
    const [arrIndex, setArrIndex] = useState(0);

    const [continueDisabled, setContinueDisabled] = useState(false);
    const [backDisabled, setBackDisabled] = useState(true);
    const [valueOfNext, setValueOfNext] = useState("Continue");
    const [warning, setWarning] = useState("");
    
    //will return true if back button should be disabled, and false otherwise
    const checkBackDisabled = (index) => {
        const backVal = false;
        if(index <= 0) {
            backVal = true;
        } else {
            backVal = false;
        }
        return backVal;
    }

    //will update the value of the next button 
    const handleContinueClick = (e) => {
        //MouseEvent which is a subclass of Event interface
        //insert the current element of the shi into usedDataBaseHeaders and indexToDataBaseHeaders
        if(valueOfNext === "Done" && arrIndex >= potentialToMatch.length) {
            for(const [key, value] of dataFileToDataBaseHeader) {
                setMatches(prevValue => [...prevValue, {dataFileColumn: key, dataBaseFileColumn: value}]);
            }
            navigate('/outputPage');
        }
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
        backDisabled = checkBackDisabled(arrIndex);
        selectOptions(arrIndex);
    }
    const handleBackClick = (e) => {
        setArrIndex(prevValue => {
            const newIndex = prevValue - 1;
            // Remove mapping for previous index
            setIndexToDataBaseHeaders(prevMap => {
                const newMap = new Map(prevMap);
                newMap.delete(newIndex);
                return newMap;
            });
            setUsedDataBaseHeaders(prevSet => {
                const newSet = new Set(prevSet);
                // Remove the value for previous index
                const valToRemove = indexToDataBaseHeaders.get(newIndex);
                newSet.delete(valToRemove);
                return newSet;
            });
            setBackDisabled(checkBackDisabled(newIndex));
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
            <select value={selected} onChange={handleSelect} disabled={inFirstHalf} ref={selectRef}>
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
    return (
        <div>
            {selectOptions(arrIndex)}
            <button onClick={handleBackClick} disabled={backDisabled}>
                Back
            </button>
            <button onClick={handleContinueClick} disabled={continueDisabled}>
                {valueOfNext}
            </button>
        </div>
    )
}
export default ColumnCollection;