require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const multer = require('multer');
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { SystemMessage, HumanMessage } = require('@langchain/core/messages');
const papa = require('papaparse');  // For CSV parsing
const googleGemini = new ChatGoogleGenerativeAI({ 
  model: "gemini-pro",
  apiKey: process.env.GEMINI_API_KEY});

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
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-app';
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
  });

const dataFileColumnArr = [];
const dataBaseFileColumnArr = [];
app.post('/processFiles', upload.fields([
  { name: "dataFile", maxCount: 1 }, 
  { name: "dataBaseFile", maxCount: 1 }
]), async (req, res) => {  
  try {
    if (!req.files || !req.files.dataFile || !req.files.dataBaseFile) {
      return res.status(400).json({ message: 'Both dataFile and dataBaseFile are required' });
    }
    const dataFilePath = req.files.dataFile[0].path;
    const dataBaseFilePath = req.files.dataBaseFile[0].path;

    // console.log("Here is the dataFile path: " + dataFilePath);
    // console.log("Here is the dataBaseFile path: " + dataBaseFilePath);
    
    const dataFileColumn = req.body.dataFileColumn;
    const dataBaseFileColumn = req.body.dataBaseFileColumn;
    const description = req.body.description;
   
    // console.log("Request body:", req.body);
    // console.log("DataFile Column:", dataFileColumn);
    // console.log("DataBaseFile Column:", dataBaseFileColumn);
    // console.log("Description:", description);

    if (!dataFileColumn || !dataBaseFileColumn || !description) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        received: {
          dataFileColumn,
          dataBaseFileColumn,
          description
        }
      });
    }

    //console.log(JSON.stringify(req.body));
    const dataFileContent = fs.readFileSync(dataFilePath, 'utf8');
    const dataBaseFileContent = fs.readFileSync(dataBaseFilePath, 'utf8');

    const dataFileSplit = dataFileContent.split('\n');
    const dataBaseFileSplit = dataBaseFileContent.split('\n');

    const dataDocuments = [dataFileSplit[0], dataFileSplit[1]];
    const dataBaseDocuments = [dataBaseFileSplit[0], dataBaseFileSplit[1]];

    // // Convert to string for Gemini
    // const contentData = JSON.stringify(dataFileData.data, null, 2);
    // const contentDataBase = JSON.stringify(dataBaseFileData.data, null, 2);
    
    //Determining if the files are valid
    if(dataDocuments[0] === undefined || dataBaseDocuments[0] === undefined) {
      return res.status(400).json({ message: 'Invalid CSV files provided' });
    }
    //checking if the columns exist in the files
    if(!dataDocuments[0].includes(dataFileColumn) || !dataBaseDocuments[0].includes(dataBaseFileColumn)) {
      return res.status(400).json({message: 'Specified columns not found in the provided CSV files. Please ensure the columns exist and is exactly spelled as you provided.'});
    }
    console.log("Checking if columns exist");
    //extracting the columns from the files
    dataFileColumnArr = dataDocuments[0].split(',');
    dataBaseFileColumnArr = dataBaseDocuments[0].split(',');

    if(dataDocuments[1] === undefined) {
      return res.status(400).json({message: 'No data found in the provided CSV files. Please ensure the files are not empty.'});
    }

    const columnsToMatch = dataDocuments[1].split(',');
    const diffBetweenColumns = dataFileColumnArr.length - columnsToMatch.length;
    if(diffBetweenColumns <= 0) {
      return res.status(400).json({message: 'No columns to match found in the provided CSV files. Please ensure the files are not empty.'});
    }
    const potentialToMatch = [];
    for(let i = dataFileColumnArr.length - 1; i < diffBetweenColumns; i++) {
      potentialToMatch.push(dataFileColumnArr[i]);
    }

    
    const columnsToMatch2 = dataBaseDocuments[1].split(',');
    const diffBetweenColumns2 = dataBaseFileColumnArr.length - columnsToMatch2.length;
    if(diffBetweenColumns2 <= 0) {
      return res.status(400).json({message: 'No columns to match found in the provided CSV files. Please ensure the files are not empty.'});
    }
    const potentialToMatch2 = [];
    for(let i = dataBaseFileColumnArr.length - 1; i < diffBetweenColumns2; i++) {
      potentialToMatch2.push(dataBaseFileColumnArr[i]);
    }

    return res.status(200).json({
      message: 'Files processed successfully',
      data: {
        dataFileColumnArr,
        dataBaseFileColumnArr,
        potentialToMatch,
        potentialToMatch2,
      }
    });
  } catch (error) {
    console.error('Error processing files:', error);
    res.status(500).json({
      message: 'Error processing files',
      error: error.message
    });
  }
});

app.get('/extractData', async (req, res) => {
  message = [
    new SystemMessage(`You are a helpful assistant that extracts data from CSV files.
      
    You are given two CSV files. One is a database file, and another is a data collection file. You're task is to extract data from the database file based on the criteria of the data collection file. I'm going to
    be saying dataFile and dataBaseFile. The dataFile is the data collection file, and the dataBaseFile is the database file.

      Topic of interest: {topic}

    Your task:
    For each row in dataFile.csv, read the value in the ${dataFileColumn} column. Based on that value, find the corresponding value in the ${dataBaseFileColumn} column in dataBaseFile.csv.
    There are three types of matches. For the examples being provided, assume the topic of interest is "Food":
    1. Close match:
      For a match to be considered close, it doesn't have to be an exact match, it just has be similar enough to be considered a close match. For example, if the value in the dataFile.csv is "Apple", it could match with "apple", "Apple", "APPLE", "apple ", "apple.", or
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
    
      2. Moderate match: 
        Another instance of a match is a moderate match. A moderate match is when the value of interest in the dataFileColumn is found in the dataBaseFileColumn, but it has additional topics within the information. It's not describing the topic of interest, rather 
        it's providing one to two more irrelvant topics. Or it's not mostly semantically equalivalent, but it's close enough to be considered a moderate match. For instances like this, input a 0 under the Confidence column.
        Some examples of moderate matches are:
          DataFile Column | DataBaseFile Column | Polyphenol Match Confidence 
          Wheat Flour,	0.126666667	45% oat bran and 50% wheat flour bread,	0 <- Moderate match because wheat flour, which is the topic of interest, is found in the information, b
          Quinoa,		Quinoa High Fiber Porridge,	0 -< Moderate match because quinoa is found in the information, other topics are also found. It's not describing the quinoa, but it's adding irrelavent topics to it, such as 'poridge' in this case.
          buckwheat flour,	"Buckwheat bread, 50% dehusked buckwheat groats and 50% white wheat flour", 	0 <- Moderate match because buckwheat flour is found in the information, but other topics are also found. The additional information is not describing the buckwheat flour, rather it's adding irrelavent topics to it, such as 'bread' and 'groats' in this case. Since there were only within 1-2 additional topics, it's considered a moderate match.
          pecorino romano cheese, Chami (cottage cheese), 0 <- Since they both are cheese, it's considered a match. But the fact that they are different types of cheese, it's not a close match. Although they aren't additional irrelevant topics in the dataBaseFile, since they're not semantically the same, it's not a close match.
          goat milk butter,		Goat Milk Drink, Symbiotics Low GI, powder prepared with water	-1
        You see how 
      3. Low match:
        A low match is when the value of interest in the dataFileColumn is found in the dataBaseFileColumn, but it has additional topics within the information and/or they're not close to being semantically equivalent. It's additional information isn't describing the topic of interest, rather adding 3 or more irrelvant topics to the information. For such matches, input -1 under the Confidence column.
        Some examples of low matches are:
          DataFile Column | DataBaseFile Column | Polyphenol Match Confidence
          goat milk butter,		"Goat Milk Drink, Symbiotics Low GI, powder prepared with water", -1 <- Low match because goat milk butter is found in the information, but it's not describing the goat milk butter, rather it's adding irrelavent topics to it, such as 'drink', 'symbiotics', 'low GI', and 'powder prepared with water' in this case. Since there were more than 2 additional topics, it's considered a low match.
    If there are multiple matches, choose the one that's the best match. A best 
    match is con

    Search for the  matching Food Name in dataBaseFile.csv (case-insensitive match, ignoring extra spaces, punctuation differences like hyphens vs. spaces, and bracketed descriptors like [Red] if necessary).

    When a match is found, take the corresponding Food ID from dataBaseFile.csv and insert it into that row’s Polyphenol Food ID column in dataFile.csv.

    If no match is found, leave the Polyphenol Food ID cell as it is.

    Preserve all other columns and rows exactly as they are.

    Output the updated dataFile.csv with the filled Polyphenol Food ID values.

    Special matching rules:

    Match should be exact after applying case normalization and removing minor formatting differences.

    If multiple matches exist in dataBaseFile.csv, choose the first one that appears in order.

    Do not change the Polyphenol Match Confidence values — leave them as is.

    Return the updated CSV as valid UTF-8 text.
    `),
    new HumanMessage(`Process the following files: ${dataFile} and ${dataBaseFile}`)
  ];
  
  try {
    const response = await googleGemini.invoke(message);
    res.status(200).json({ 
      message: 'Files processed successfully', 
      data: response 
    });
  } catch (error) {
    console.error('Error processing with Gemini:', error);
    res.status(500).json({ 
      message: 'Error processing files', 
      error: error.message 
    });
  }
  fs.rmdir(path.join(__dirname, 'uploads'), {
    recursive: false
  }).then(isfulFilled => {
    console.log("Successfully deleted the upload directory.")
    return;
  }).catch(isRejected => {
    console.log("Failed to delete the upload directory. ");
    return;
  });
});
  // Ask the user 

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}`);
  console.log(`🌐 Frontend should be running at http://localhost:3000`);
});
