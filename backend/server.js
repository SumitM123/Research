const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const multer = require('multer');
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");

const googleGemini = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GEMINI_API_KEY});

require('dotenv').config();

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

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); 
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); 
    }
});

const upload = multer({ storage: storage });


// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-app';
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
  });


app.post('/processFiles', upload.fields([{ name: 'dataFile' , maxCount: 1}, { name: 'dataBaseFile', maxCount: 1}]), async (req, res) => {  
  const dataFile = req.files.dataFile[0]; // Assuming only one file per field
  const dataBaseFile = req.files.dataBaseFile[0];

  // Access the file paths
  console.log('dataFile path:', dataFile.path); 
  console.log('dataBaseFile path:', dataBaseFile.path);
  /* 
    You are given two CSV files:

dataBaseFile.csv – contains four columns: Food Group, Food Sub-Group, Food Name, Food ID.

dataFile.csv – contains five columns:
sample_foodon_fullhierarchy_ids,
sample_food_product_name,
Antioxidant content in mmol per 100g,
Polyphenol Food ID,
Polyphenol Match Confidence (-1(low),0(mid),1(exact)).

Your task:

For each row in dataFile.csv, read the value in the sample_food_product_name column.

Search for the exact matching Food Name in dataBaseFile.csv (case-insensitive match, ignoring extra spaces, punctuation differences like hyphens vs. spaces, and bracketed descriptors like [Red] if necessary).

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
  
  googleGemini.invoke(message)
    .then(response => {
      // Assuming the response contains the processed data
      res.status(200).json({ message: 'Files processed successfully', data: response });
    })
    .catch(error => {
      console.error('Error processing files:', error);
      res.status(500).json({ message: 'Error processing files', error: error.message });
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
