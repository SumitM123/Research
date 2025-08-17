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
const  { CSVLoader } = require('@langchain_community.document_loaders'); // Assuming you have a CSVLoader utility
const googleGemini = new ChatGoogleGenerativeAI({ 
  model: "gemini-2.5-flash",
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
const storage = multer.diskStorage(
  {
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, 'uploads'));;
    },  
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    }
  });
const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 10 * 1024 * 1024 // Limit file size to 10MB
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


app.post('/processFiles', upload.fields([
  { name: "dataFile", maxCount: 1 }, 
  { name: "dataBaseFile", maxCount: 1 },
  { name: "description"},
]), async (req, res) => {  
  try {
    if (!req.files || !req.files.dataFile || !req.files.dataBaseFile) {
      return res.status(400).json({ message: 'Both dataFile and dataBaseFile are required' });
    }
    //getting the files from the request. These are buffer objects
    const dataFilePath = req.files.dataFile[0].path;
    const dataBaseFilePath = req.files.dataBaseFile[0].path;

    
    const dataFileColumn = req.body.dataFileColumn;
    const dataBaseFileColumn = req.body.dataBaseFileColumn;
    const description = req.body.description;
   
    const dataFileLoader = CSVLoader({filePath: dataFilePath});
    const dataBaseFileLoader = CSVLoader({filePath: dataBaseFilePath});

    // List of Document objects
    const dataDocumnets = dataFileLoader.load()
    const dataBaseDocuments = dataBaseFileLoader.load();

    let contentData = "";
    for(const doc of dataDocumnets) {
      contentData += doc.pageContent + "\n";
    }
    let contentDataBase = "";
    for(const doc of dataBaseDocuments) {
      contentDataBase += doc.pageContent + "\n";
    }


    /* 
    You are given two CSV files. One is a database file, and another is a data collection file. You're task is to extract data from the database file based on the criteria of the data collection file. I'm going to
    be saying dataFile and dataBaseFile. The dataFile is the data collection file, and the dataBaseFile is the database file.

Your task:
  For each row in dataFile.csv, read the value in the ${dataFileColumn} column. Based on that value, find the corresponding value in the ${dataBaseFileColumn} column in dataBaseFile.csv.
    There are three types of matches:
    1. Close match:
      For a match to be considered close, it doesn't have to be an exact match, it just has be similar enough to be considered a close match. For example, if the value in the dataFile.csv is "Apple", it could match with "apple", "Apple", "APPLE", "apple ", "apple.", or
      "apple, raw", "apple (raw)", etc. are all considered close matches. Semantically, it should be the same, but it doesn't have to be an exact match. For such matches, inside the match confidence column, you should put 1. 
      Other examples of close matches are:
        DataFile Column | DataBaseFile Column | Polyphenol Match Confidence
        Chickpea,	Chickpeas,	1
        Long grain brown rice,	Brown Rice,	1
        Long grain white rice,	Doongara white Rice (SunRice CleverRice),	1
        Strawberry,		"Strawberry 100% Pure Fruite Spread, no added sugar", 1
        carrot,	"Carrots, raw", 1
        sweet potato, Sweet Potato Kumara,	1
        brown lentils, "Lentils, brown, canned, drained, Edgell's™ brand",	1
        red lentils, "Lentils, red, dried, boiled",	1
        Farmers Cheese, Chami (Cottage Cheese), 1 <- Although not the same, it's semantically the same. Farmer's cheese is essentialyl pressed cottage cheese, so it's not a different type of cheese. 
      You see how it's not an exact match, but it's close enough to be considered a close match in which they are semantically the same. It's essentially providing a desciption of the information, but not adding another topic to the information.
    
      2. Moderate match: 
      Another example of a match is a moderate match. A moderate match is when the value of interest in the dataFileColumn is found in the dataBaseFileColumn, but it has additional topics within the information. It's not describing the topic of interest, rather 
      it's providing more irrelvant topics. And/or it may not be completely semantically the same, but it's close enough to be considered a moderate match.
      Some examples of moderate matches are:
        DataFile Column | DataBaseFile Column | Polyphenol Match Confidence 
        Wheat Flour,	0.126666667	45% oat bran and 50% wheat flour bread,	0 <- Moderate match because wheat flour, which is the topic of interest, is found in the information, b
        Farmers Cheese		Chami (Cottage Cheese)	0 <- This is a moderate match because it's not semantically the same, but it's close enough to be considered a moderate match. They both are cheese but it's not farmer's cheese. 
      For a moderate match, 
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
  */
 // Ask the user 
  message = [
    new SystemMessage(`You are a helpful assistant that extracts data from CSV files.`),
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
  } catch (error) {
    console.error('Error handling files:', error);
    res.status(500).json({ 
      message: 'Error handling files', 
      error: error.message 
    });
  }

  path.unlink(dataFilePath, (err) => {
    if (err) console.error('Error deleting dataFile:', err);
  });
  path.unlink(dataBaseFilePath, (err) => {
    if (err) console.error('Error deleting dataBaseFile:', err);
  });

});

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
