import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useColumnInfo } from '../Contexts/columnInfoContext';
/* 
    Things to fix tomorrow:
        * Fix columnMatch not showing up anything
        * The back and continue button aren't working once all the matches are done
*/

function ColumnCollection(props) {
    // Track the selected value for the select box
    const [selectedValue, setSelectedValue] = useState("");
    //getting props
    const potentialToMatch = props.columnsToMatch;
    const dataBaseHeaders = props.headers;
    const inFirstHalf = props.disabled;
    // Add key to force remount on reset
    const key = props.resetKey || 0;
    //dataFileMatch and dataBaseMatch. This is the initial match
    const topicMatch = props.topicMatch;
    //context column info for setting the matches
    const {matches, setMatches, initialTopicMatch, setInitialTopicMatch} = useColumnInfo();
    
    const navigate = useNavigate();
    //When updating these objects, ALWAYS return a new object, instead of just modifying the previous object because react will not re-render the component if the reference to the object does not change. You have to treat it as immutable   
    const [usedDataBaseHeaders, setUsedDataBaseHeaders] = useState(new Set(topicMatch.dataBaseMatch ));
    const [indexToDataBaseHeaders, setIndexToDataBaseHeaders] = useState(() => new Map([[-1, topicMatch.dataBaseMatch]]));    
    const [dataFileToDataBaseHeader, setDataFileToDataBaseHeaders] = useState(() => new Map([[topicMatch.dataFileMatch, topicMatch.dataBaseMatch ]]));
    const selectRef = useRef();
    const [arrIndex, setArrIndex] = useState(0);
    const currentMatch = potentialToMatch[arrIndex];
    const [continueDisabled, setContinueDisabled] = useState(true);
    const [backDisabled, setBackDisabled] = useState(true);
    const [submitDisabled, setSubmitDisabled] = useState(true);
    const [valueOfNext, setValueOfNext] = useState("Continue");
    const [warning, setWarning] = useState("");
    
    console.log("Potential to match: ", potentialToMatch);
    //will return true if back button should be disabled, and false otherwise
    const checkBackDisabled = (index) => {
        return index <= 0;
    }
    const checkContinueDisabled = (index) => {
        return index >= potentialToMatch.length;
    }
    const checkSubmitDisabled = (index) => { 
        //submit it enabled only when all the matches are done
        return index < potentialToMatch.length;
    }
    //will update the value of the next button

    //All state changes that depend on arrIndex should be inside of the setter function of arrIndex so it's allays in sync
    const handleContinueClick = (e) => {
    // Reset select to first option for next match
    setSelectedValue("");
        //MouseEvent which is a subclass of Event interface
        setUsedDataBaseHeaders(prevSet => {
            const newSet = new Set(prevSet);
            newSet.add(selectRef.current.value);
            return newSet;
        });
        setIndexToDataBaseHeaders(prevMap => {
            const newMap = new Map(prevMap);
            newMap.set(arrIndex, selectRef.current.value);
            return newMap;
        });
        setDataFileToDataBaseHeaders(prevMap => {
            const newMap = new Map(prevMap);
            newMap.set(potentialToMatch[arrIndex], selectRef.current.value);
            return newMap;
        });
        const newIndex = arrIndex + 1;
        setArrIndex(newIndex);
        setBackDisabled(checkBackDisabled(newIndex));
        setContinueDisabled(checkContinueDisabled(newIndex));
        setSubmitDisabled(checkSubmitDisabled(newIndex));
        setValueOfNext(newIndex >= potentialToMatch.length - 1 ? "Done" : "Continue");
        selectOptions(newIndex);
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
            setContinueDisabled(true);
            setSubmitDisabled(checkSubmitDisabled(newIndex));
            setValueOfNext(newIndex >= potentialToMatch.length - 1 ? "Done" : "Continue");
            selectOptions(newIndex);
            return newIndex;
        });
    }
    const handleSelect = (e) => {
        //e.target references the specific dom element that triggered the event listener
        setSelectedValue(e.target.value);
        if(e.target.value !== "None" && e.target.value !== "Automated" && usedDataBaseHeaders.has(e.target.value)) {
            setWarning("Warning: this data base header has already been assigned to a different column");
        } else {
            setWarning("");
        }
        setContinueDisabled(e.target.value === "");
    }
    function selectOptions(index) {
        console.log("Arr Index: ", index);
        return (
            <div className="collect-details-card" style={{ padding: '1.5rem', marginBottom: '1rem', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <select
                    className="collect-details-select"
                    value={selectedValue}
                    onChange={handleSelect}
                    disabled={inFirstHalf}
                    ref={selectRef}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', marginBottom: '0.5rem' }}
                >
                    <option value="" disabled>
                        -- Select a column from your data collection to match with your database file--
                    </option>
                    {(dataBaseHeaders || []).map((topic, idx) => (
                        <option key={idx} value={topic}>
                            {topic}
                        </option>
                    ))}
                    <option value="None">None</option>
                    <option value="Automated">Automated</option>
                </select>
                {warning && (
                    <div className="collect-details-warning" style={{ color: 'red', fontSize: '0.95rem', marginTop: '0.25rem' }}>
                        {warning}
                    </div>
                )}
            </div>
        );
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        for(const [key, value] of dataFileToDataBaseHeader) {
            setMatches(prevValue => [...prevValue, {dataFileColumn: key, dataBaseFileColumn: value}]);
        }
        setInitialTopicMatch(topicMatch)
        navigate('/loading');
    }

    return (
        <div
            key={key}
            className="collect-details-wrapper"
            style={{
                maxWidth: '480px',
                margin: '3rem auto',
                background: '#f7f7f7',
                borderRadius: '16px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
                padding: '2.5rem 1.5rem 2rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <h2> Enter Sample Values</h2>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <label className="collect-details-label" style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '1.25rem', display: 'block', textAlign: 'center' }}>
                    Select the database header to match with the <span style={{ color: '#1976d2' }}>{currentMatch || "..."}</span> column:
                </label>
                {selectOptions(arrIndex)}
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <button
                    className="collect-details-btn"
                    onClick={handleBackClick}
                    disabled={backDisabled}
                    style={{
                        background: backDisabled ? '#e0e0e0' : '#fff',
                        color: backDisabled ? '#aaa' : '#1976d2',
                        border: '1px solid #1976d2',
                        borderRadius: '6px',
                        padding: '0.5rem 1.5rem',
                        fontWeight: 'bold',
                        cursor: backDisabled ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        minWidth: '100px',
                    }}
                >
                    Back
                </button>
                <button
                    className="collect-details-btn"
                    onClick={handleContinueClick}
                    disabled={continueDisabled}
                    style={{
                        background: continueDisabled ? '#e0e0e0' : '#1976d2',
                        color: continueDisabled ? '#aaa' : '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.5rem 1.5rem',
                        fontWeight: 'bold',
                        cursor: continueDisabled ? 'not-allowed' : 'pointer',
                        boxShadow: continueDisabled ? 'none' : '0 2px 8px rgba(25,118,210,0.08)',
                        transition: 'all 0.2s',
                        minWidth: '100px',
                    }}
                >
                    {valueOfNext}
                </button>
            </div>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <button
                    className="collect-details-btn"
                    onClick={handleSubmit}
                    disabled={submitDisabled}
                    style={{
                        marginTop: '2.5rem',
                        background: submitDisabled ? '#e0e0e0' : '#43a047',
                        color: submitDisabled ? '#aaa' : '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.75rem 2rem',
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        cursor: submitDisabled ? 'not-allowed' : 'pointer',
                        boxShadow: submitDisabled ? 'none' : '0 2px 8px rgba(67,160,71,0.08)',
                        transition: 'all 0.2s',
                        minWidth: '120px',
                    }}
                >
                    Submit
                </button>
            </div>
        </div>
    );
}

export default ColumnCollection;
