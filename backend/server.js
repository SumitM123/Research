// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

// Node built-in modules
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { createRequire } from 'module'; // Only needed if you must use require for some legacy package

// Express and middleware
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import multer from 'multer';
import { fileURLToPath } from 'url';

// Convert import.meta.url to __filename
const __filename = fileURLToPath(import.meta.url);

// Derive __dirname from __filename
const __dirname = path.dirname(__filename);

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';

import { GoogleGenAI  } from '@google/genai';


const googleGemini = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GEMINI_API_KEY,
});

const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//File Upload Setup

//change the storage to DiskStorage, so that you get the actual file instead of a buffer object 
const uploadDir = path.join(__dirname, "uploads")
if(!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage(
  {
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },  
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    }
  });
const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 50 * 1024 * 1024 // Limit file size to 50MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'text/csv') {
      return cb(new Error('Only CSV files are allowed'));
    }
    cb(null, true);
  }
});

// MongoDB Connection
// const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-app';
// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     console.log('✅ Connected to MongoDB');
//   })
//   .catch((error) => {
//     console.error('❌ MongoDB connection error:', error);
//   });

app.post(
  "/processFiles",
  upload.fields([
    { name: "dataFile", maxCount: 1 },
    { name: "dataBaseFile", maxCount: 1 },
  ]),
  async (req, res) => {

    try {
      // Ensure both files exist
      if (!req.files || !req.files.dataFile || !req.files.dataBaseFile) {
        return res.status(400).json({
          message: "Both dataFile and dataBaseFile are required",
        });
      }

      //const dataFileOriginalName = req.files.dataFile[0].originalname;
      //const dataBaseFileOriginalName = req.files.dataBaseFile[0].originalname;

      const dataFilePath = req.files.dataFile[0].path;
      const dataBaseFilePath = req.files.dataBaseFile[0].path;

      const { topic } = req.body;

      // Validate required fields
      if (!topic || topic === "") {
        return res.status(400).json({
          message: "Missing required fields",
          received: { dataFileColumn, dataBaseFileColumn, description },
        });
      }

      // // Read file contents

      //spliting the data from each lin
      let dataFileSplit = [];
      let dataBaseFileSplit = [];

      //Ths is ASYNC code
      // const dataFileContent = fs.readFileSync(dataFilePath, "utf8", (err, data) => {
      //   if (err) {
      //     console.error("Error reading dataFile:", err);
      //     return res.status(500).json({ message: "Error reading dataFile" });
      //   }
      //   dataFileSplit = data.split("\n").filter(Boolean);
      // });

      // const dataBaseContent = fs.readFile(dataBaseFilePath, "utf8", (err, data) => {
      //   if (err) {
      //     console.error("Error reading dataBaseFile:", err);
      //     return res.status(500).json({ message: "Error reading dataBaseFile" });
      //   }
      //   dataBaseSplit = data.split("\n").filter(Boolean);
      // });

      const dataFileContent = fs.readFileSync(dataFilePath, "utf8");
      const dataBaseContent = fs.readFileSync(dataBaseFilePath, "utf8");
      dataFileSplit = dataFileContent.split("\n").filter(Boolean);
      dataBaseFileSplit = dataBaseContent.split("\n").filter(Boolean);
    
      if (dataFileSplit.length <= 0 || dataBaseFileSplit.length <= 0) {
        return res.status(400).json({ message: "CSV files cannot be empty" });
      }

      // Extract headers + first row
      //const dataFileHeaders = dataFileSplit[0].split(",").map((h) => h.trim());
      const getHeaders = (dataString) => {
        let headers = [];
        let currentHeader = "";
        //let quotation = false;
        // for(let i = 0; i < dataString.length; i++) {
        //   if(dataString[i] === '"') {
        //     quotation = !quotation;
        //     continue;
        //   }
        //   if(dataString[i] === "," && quotation) {
        //     currentHeader += dataString[i];
        //   } else if (dataString[i] === "," && !quotation) {
            
        //     headers.push(currentHeader.trim());
        //     currentHeader = "";
        //   } else if(dataString[i] !== ",") {
        //     currentHeader += dataString[i];
        //   }
        // }
        for(let i = 0; i < dataString.length; i++) { 
          if(dataString[i] === '"') {
            let j = i + 1;
            currentHeader = '"';
            while(j < dataString.length && dataString[j] !== '"') {
              currentHeader += dataString[j];
              j++;
            }
            currentHeader = currentHeader.trim();
            currentHeader += '"';
            if(currentHeader !== '""' && currentHeader !== "") {
              headers.push(currentHeader);
            }
            currentHeader = "";
            i = j;
            continue;
          } else if(dataString[i] === ",") {
            const trimmedHeader = currentHeader.trim();
            if (trimmedHeader !== "" && trimmedHeader !== '""') {   // FIX: skip empty values
              headers.push(trimmedHeader);
            }
            currentHeader = "";
          } else if(dataString[i] !== "," && dataString[i] !== '"') {
            currentHeader += dataString[i];
          }
        }
        const trimmedHeader = currentHeader.trim();  // FIX: check before pushing last one
        if (trimmedHeader !== "" && trimmedHeader !== '""') {
          headers.push(trimmedHeader);
        }
        return headers;
      }
      const dataFileHeaders = getHeaders(dataFileSplit[0]);
      const dataBaseFileHeaders = getHeaders(dataBaseFileSplit[0]);
      
      const dataFileRow = getHeaders(dataFileSplit[1] || "");
      console.log("Data file headers: " + dataFileHeaders + " Length of data file headers: " + dataFileHeaders.length); //good
      console.log("Data base file headers: " + dataBaseFileHeaders + " Length of data base file headers: " + dataBaseFileHeaders.length); //good
      console.log("Data file first row: " + dataFileRow + " Length of data file first row: " + dataFileRow.length); //bad
      //const dataFileRow = dataFileSplit[1]?.split(",") || [];
      //const dataBaseFileRow = dataBaseFileSplit[1]?.split(",") || [];
      // // Ensure chosen columns exist in headers
      // if (!dataFileHeaders.includes(dataFileColumn)) {
      //   return res.status(400).json({
      //     message: `Column "${dataFileColumn}" not found in dataFile headers`,
      //     availableHeaders: dataFileHeaders,
      //   });
      // }
      // if (!dataBaseFileHeaders.includes(dataBaseFileColumn)) {
      //   return res.status(400).json({
      //     message: `Column "${dataBaseFileColumn}" not found in dataBaseFile headers`,
      //     availableHeaders: dataBaseFileHeaders,
      //   });
      // }

      // Find columns that need data to be extract
      // const potentialToMatch = dataFileHeaders.filter(
      //   (col) => 
      // );
      // const potentialToMatch2 = dataBaseFileHeaders.filter(
      //   (col) => !dataBaseFileRow.includes(col)
      // );

      let potentialToMatchSet = new Set();
      for(let i = 0; i < dataFileHeaders.length; i++) {
        if(i >= dataFileRow.length) {
          potentialToMatchSet.add(dataFileHeaders[i]);
        }
      }

      const potentialToMatch = Array.from(potentialToMatchSet);
      // let potentialToMatch2 = [];
      // for(let i = 0; i < dataBaseFileHeaders.length; i++) {
      //   if(i >= dataBaseFileRow.length) {
      //     potentialToMatch2.push(dataBaseFileHeaders[i]);
      //   }
      // }
      // console.log("Data file headers:" + dataFileHeaders);
      // console.log("Database file headers: " + dataBaseFileHeaders);
      let strPotentialToMatch = "";
      for(const item of potentialToMatch) {
        strPotentialToMatch += item + ", ";
      }
      console.log("Data file potential string:" + strPotentialToMatch);

      //RETURN THE FILE CONTENT OF BOTH FILES TO CLIENT AND SAVE IT
      return res.status(200).json({
        message: "Files processed successfully",
        payload: {
          dataFileHeaders,
          dataBaseFileHeaders,
          potentialToMatch,
          dataFileContent,
          dataBaseContent
        }
      });
    } catch (error) {
      console.error("Error processing files:", error);
      return res.status(500).json({
        message: "Error processing files",
        error: error.message,
      });
    }
  }
);

app.post('/extractData', async (req, res) => {
  const {dataFile, dataBaseFile, topic, initialDataFileColumn, initialDataBaseColumn, potentialToMatch, matches, dataBaseContent, dataFileContent} = req.body;
  const prompt = ` "You are a CSV editing bot. Your only function is to take data and instructions and return a valid, edited CSV file as plain text. You do not provide commentary or code."
      
    You're given the following information: 
      - data collection file (or sometimes, I call it dataFile): ${dataFile}
      - database file: ${dataBaseFile}
      - topic of interest: ${topic}
      - initial match of columns between the two files: ${initialDataFileColumn} in dataFile corresponds to ${initialDataBaseColumn} in dataBaseFile.
      - potential columns of data collection file to match with database file: ${potentialToMatch}
      - Other matches between columns of dataFile and dataBaseFile: ${JSON.stringify(matches)}

  
    *** VERY IMPORTANT: Your're going to be making edits to the data collection file based on the information provided in the database file. ENSURE THAT THE OUTPUT OF THE EDITTED DATA COLLECTION FILE IS A VALID CSV FILE. AND NEVER MAKE EDITS TO THE COLUMN FROM THE DATA COLLECTION FILE THAT'S ALREADY THERE. YOU JUST HAVE TO FILL OUT THE EMPTY ROW AND COLUMNS IF FOUND *** 
    
    Your task:
      1) For each row in the dataFile, look at the ${initialDataFileColumn} column. If left blank, skip. If not left blank, find the corresponding value in the ${initialDataBaseColumn} column in dataBaseFile. This is the initial match that helps you understand how to match other columns.
            const trimmedHeader = currentHeader.trim();
            if(trimmedHeader !== "" && trimmedHeader !== '""') {
              headers.push(trimmedHeader);
            }
          "apple, raw", "apple (raw)", etc. are all considered close matches. They have to be semantically equivalent, in which additional details that describe the topic of interest are ok, and it doesn't have to be an exact match. For such matches, inside the match confidence column, you should put 1. 
          Other examples of close matches are:
            DataFile Column | DataBaseFile Column | Polyphenol Match Confidence
            Chickpea,	Chickpeas,	1
            Long grain brown rice,	Brown Rice,	1 <- Close match because long grain brown rice is semantically equivalent to brown rice, even though it's not an exact match. The 'long grain' part is essentially just describing the topic of interest. 
            Long grain white rice,	Doongara white Rice (SunRice CleverRice),	1 <- Close match because long grain white rice is semantically equivalent to Doongara white Rice, even though it's not an exact match. The 'long grain' part is essentially just describing the topic of interest. And doongara white rice is a type of white rice and a description of the topic of interest, so both values are semantically equivalent. 
            Strawberry,		"Strawberry 100% Pure Fruite Spread, no added sugar", 1
            carrot,	"Carrots, raw", 1 <- Close match because carrot is semantically equivalent to carrots, even though it's not an exact match. The 's' at the end is just a plural form of the topic of interest. And 'raw' is just a description of the topic of interest, so both values are semantically equivalent.
            sweet potato, Sweet Potato Kumara,	1 <- Close match because sweet potato is semantically equivalent to Sweet Potato Kumara, even though it's not an exact match. The 'Kumara' part is just a description of the topic of interest, so both values are semantically equivalent.
            brown lentils, "Lentils, brown, canned, drained, Edgell's™ brand",	1 <- Close match because brown lentils is semantically equivalent to Lentils, brown, canned, drained, Edgell's™ brand, even though it's not an exact match. The 'canned' and 'drained' parts are just a description of the topic of interest. Also, 'Edgell's™ brand' is just the company name that's selling the sweet potato, so it's a description as well. Since both values are semantically equivalent, we put a 1 inside the Confidence column.
            red lentils, "Lentils, red, dried, boiled",	1 <- Close match because red lentils is semantically equivalent to Lentils, red, dried, boiled, even though it's not an exact match. The 'dried' and 'boiled' parts are just a description of the topic of interest. Since both values are semantically equivalent, we put a 1 inside the Confidence column.
            Farmers Cheese, Chami (Cottage Cheese), 1 <- Although not the same, it's semantically the same. Farmer's cheese is essentialyl pressed cottage cheese, so it's not a different type of cheese. That's why we put a 1 inside the Confidence column.
          You see how it's not an exact match, but it's close enough to be considered a close match in which they are semantically equivalent without addition irrelvant topics. It can contain a desciption of the information, but not adding another topic to the information.
        
        b) Moderate match: 
          Another instance of a match is a moderate match. A moderate match is when the value of interest in the dataFileColumn is found in the dataBaseFileColumn, but it has additional topics within the information. It's not describing the topic of interest, rather 
          it's providing one to two more irrelvant topics. Or it's not mostly semantically equalivalent, but it's close enough to be considered a moderate match. For instances like this, input a 0 under the Confidence column.
          Some examples of moderate matches are:
            DataFile Column | DataBaseFile Column | Polyphenol Match Confidence 
            Wheat Flour,	0.126666667	45% oat bran and 50% wheat flour bread,	0 <- Moderate match because wheat flour, which is the topic of interest, is found in the information, b
            Quinoa,		Quinoa High Fiber Porridge,	0 -< Moderate match because quinoa is found in the information, other topics are also found. It's not describing the quinoa, but it's adding irrelavent topics to it, such as 'poridge' in this case.
            buckwheat flour,	"Buckwheat bread, 50% dehusked buckwheat groats and 50% white wheat flour", 	0 <- Moderate match because buckwheat flour is found in the information, but other topics are also found. The additional information is not describing the buckwheat flour, rather it's adding irrelavent topics to it, such as 'bread' and 'groats' in this case. Since there were only within 1-2 additional topics, it's considered a moderate match.
            pecorino romano cheese, Chami (cottage cheese), 0 <- Since they both are cheese, it's considered a match. But the fact that they are different types of cheese, it's not a close match. Although they aren't additional irrelevant topics in the dataBaseFile, since they're not semantically the same, it's not a close match.
          
        c) Low match:
          A low match is when the value of interest in the dataFileColumn is found in the dataBaseFileColumn, but it has additional topics within the information and/or they're not close to being semantically equivalent. It's additional information isn't describing the topic of interest, rather adding 3 or more irrelvant topics to the information. For such matches, input -1 under the Confidence column.
          Some examples of low matches are:
            DataFile Column | DataBaseFile Column | Polyphenol Match Confidence
            goat milk butter,		"Goat Milk Drink, Symbiotics Low GI, powder prepared with water", -1 <- Low match because goat milk butter is found in the information, but it's not describing the goat milk butter, rather it's adding irrelavent topics to it, such as 'drink', 'symbiotics', 'low GI', and 'powder prepared with water' in this case. Since there were more than 2 additional topics, it's considered a low match.
            Fast Food Burger, "Soy, Burger", -1 <- Low match because fast food burger and soy burger, are although both burgers, they're both very semantically inequivalent. They're not describing each other, rather they're two different types of burgers. Since they're not semantically equivalent, it's considered a low match. But the fact that the word 'burger' is found in both values, it's still considered a match.
            Cauliflower, "Lentil and cauliflower curry with rice", -1 <- Low match because although cauliflower is found in the information, it's not describing the cauliflower, rather it's adding irrelavent topics to it, such as 'lentil', 'curry', and 'rice' in this case. Since there were more than 2 additional topics, it's considered a low match.
            Cucumber, "White rice (Satou Co. Ltd, Japan) with pickled vinegar and pickled cucumber, consumed together", -1 <- Low match because although cucumber is found in the information, it's not describing the cucumber, rather it's adding irrelavent topics to it, such as 'white rice', 'Satou Co. Ltd, Japan', 'pickled vinegar', and 'consumed together' in this case. Since there were more than 2 additional topics, it's considered a low match. And since cucumber isn't the biggest topic that's being described in the data base column. 
            steel cut oats, "Porridge, made from steel-cut oats, cooked in water", -1 <- Low match because although steel cut oats is found in the information, it's not describing the steel cut oats, rather it's adding irrelavent topics to it, such as 'porridge', 'cooked', and 'in water' in this case. Since there were more than 2 additional topics, it's considered a low match.
        
        If there are multiple matches, choose the one that's the best match. The best match is considered to be Close Match, Moderate Match, and then Low Match in terms of order of preference. If there are multiple of the same type of matches, choose the one that is highest in preference, and if still multiple, then choose the one that appears first in the dataBaseFile. 
        If there are no matches for the initial match, then put in the term "No Match Found" for the respective column in the dataFile, and go to the next one. 

        Sometimes, the data file might ask you for the initial match. If so, put that initial match found in the dataBaseFile in the respective column inside the data file csv. If not asking for it, the don't need write about the initial match that was found.
      
      2) If the initial match is found, proceed to match the other columns specified. Within that same row that's matched inside the data base file, look at the other columns. For every object inside the ${JSON.stringify(matches)} object, look at the key, which is the column from dataFile.csv, and look at the value, which is the column from dataBaseFile.csv. For each of these columns, if the cell in dataFile.csv is empty, fill it with the corresponding value from dataBaseFile.csv. If it's not empty, leave it as is.
        If the value for a match is null, or None, or empty, then you don't have to worry about that column. 
        If the value for a match is "Automated", it's likely to be Confidence or Comments column. For Confidence column, fill it with 1 if it's a close match, 0 if it's a moderate match, and -1 if it's a low match. For Comments column, answer to why you made the specific initial match, and the respective confidence score.
      
      3) Now, if there is a confidence column inside the dataFile, then fill in 1 if it's a close match, 0 if it's a moderate match, and -1 if it's a low match. If there are multiple matches, choose the one that's the best match. The best match is considered to be Close Match, Moderate Match, and then Low Match in terms of order of preference. If there are multiple Close Matches, choose the one that appears first in the dataBaseFile. If there are no matches for the initial match, don't make edits to that row, and go to the next one. 
      
      4) If there is something like a comments column inside the dataFile, then answer to why you made the specific initial match, and the respective confidence score. 
      
      5) Repeat this process for every row in dataFile.csv, and make edits to the data file 

      VERY IMPORTANT: Return the updated CSV as valid UTF-8 text.

      ** HERE IS THE CONTENTS OF THE FILES **: 
       - Here is the content of the data collection file: ${dataFileContent}.
       - Here is the content of the database file: ${dataBaseContent}.
      
      ** DO NOT ** use any markdown formatting, including triple backticks, in your response. Just return the plain editted CSV text of the data file content. 
      ** DO NOT ** provide code or pseudocode for the process.
    `
    ;
  try {
    console.log("Processing with Gemini...");

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    /* THIS WORKS. Model is connected */
    // const response = await client.models.generateContent({
    //   model: "gemini-2.5-flash",
    //   contents: "Hello, what's your model name?",
    // })

    const generatedText = response.text || "No output generated";

    res.status(200).json({
      message: "Files processed successfully",
      data: generatedText
    });

    console.log("Successfully processed with Gemini");

  } catch (error) {
    console.error("Error processing with Gemini:", error);
    res.status(500).json({
      message: "Error processing files",
      error: error.message
    });
  }
  const dataFilePath = path.join(__dirname, "uploads", dataFile);
  const dataBasePath = path.join(__dirname, "uploads", dataBaseFile);
  console.log("Data File path: " + dataFilePath);
  console.log("Data Base File path: " + dataBasePath);
  // if (fs.existsSync(dataFilePath)) {
  //   try {
  //     await fs.unlink(dataFilePath);
  //     console.log("Successfully deleted dataFile");
  //   } catch (err) {
  //     console.error("Error deleting dataFile:", err);
  //   }
  // } else {
  //   console.warn("dataFile already deleted.");
  // }
  if (fs.existsSync(dataFilePath)) {
    try {
      await fsPromises.unlink(dataFilePath);
      console.log("Successfully deleted dataFile");
    } catch (err) {
      console.error("Error deleting dataFile:", err);
    }
  } else {
    console.warn("dataFile already deleted.");
  }
  if (fs.existsSync(dataBasePath)) {
    try {
      await fsPromises.unlink(dataBasePath);
      console.log("Successfully deleted dataBaseFile");
    } catch (err) {
      console.error("Error deleting dataBaseFile:", err);
    }
  } else {
    console.warn("dataBaseFile already deleted.");
  }
});
app.post('/createDownload', async (req, res) => {
  //editedDataFile is an array. I need to convert it to a string
  const {editedDataFile} = req.body;
  const fileName = `edited_dataFile_${Date.now()}.csv`;
  const filePath = path.join(__dirname, "/uploads", fileName);
  var editedDataFileString = "";
  for(const row of editedDataFile) {
    let rowString = row + "\n";
    editedDataFileString += rowString;
  }
  try {
    await fsPromises.writeFile(filePath, editedDataFileString, 'utf8');
    console.log("Successfully created download file");
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.status(200).sendFile(filePath, async (err) => {
      if (err) {
        console.error("Error sending file:", err);
      } else {
        console.log("File sent successfully.");
      }
      
      // Attempt to delete the file regardless of whether the send succeeded
      try {
        await fsPromises.unlink(filePath);
        console.log("Successfully deleted temp file.");
      } catch (unlinkErr) {
        if (unlinkErr.code === 'ENOENT') {
          console.warn("Attempted to delete a file that was already gone.");
        } else {
          console.error("Error deleting file:", unlinkErr);
        }
      }
    });

  } catch (error) {
    console.error("Error creating download file:", error);
    res.status(500).json({ message: "Error creating or sending download file", error: error.message });
  }
});
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}`);
  console.log(`🌐 Frontend should be running at http://localhost:3000`);
});
