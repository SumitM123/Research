import React from 'react';
import { useFilesInfo } from '../Contexts/filesContext';


const CollectDetails = () => {
    //scan the files and check for the respective column details
    //check what needs to be done based on the second line of the file
        //If the second line is empty, then we need to ask the user for the column details
        const fileInfo = useFilesInfo();

        return (
        //File object
        
        <div className="collect-details-container">
            <form>
                <select required>
                    {(fileInfo.dataFileAvailableTopics || []).map((dataFileTopics) => (
                        <option value={dataFileTopics}>
                        {dataFileTopics}
                        </option>
                    ))}
                </select>

                <input type="text" placeholder="Enter first value" />
                <input type="text" placeholder="Enter second value" />
                <input type="text" placeholder="Enter third value" />
                <input type="text" placeholder="Enter fourth value" />
            </form>
        </div>
    );
}
export default CollectDetails;