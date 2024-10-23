// backend/server.js

require('dotenv').config(); // Load environment variables

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const path = require('path'); // For file path operations
const { DocumentAnalysisClient, AzureKeyCredential } = require('@azure/ai-form-recognizer'); // Azure SDK

const app = express();
const upload = multer({ dest: 'uploads/' });

const ragRoutes = require('./routes/ragRoutes'); // RAG路由

app.use(cors());
app.use(express.json()); // To parse JSON bodies

// Ensure the temporary directory exists
const tempDirectory = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDirectory)) {
    fs.mkdirSync(tempDirectory);
}

// File upload and data extraction route
app.post('/api/upload/extract', upload.single('file'), async (req, res) => {
    try {
        const filePath = req.file.path;
        console.log('File received at:', filePath);  // Log when file is received

        const endpoint = process.env.AZURE_FORM_RECOGNIZER_ENDPOINT;
        const apiKey = process.env.AZURE_FORM_RECOGNIZER_KEY;

        const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(apiKey));

        // Read the file as binary data
        const fileData = fs.readFileSync(filePath);
        console.log('File read successfully, calling Form Recognizer API...');  // Log before calling Form Recognizer API

        // Call Azure Form Recognizer API
        const poller = await client.beginAnalyzeDocument('prebuilt-invoice', fileData, {
            contentType: req.file.mimetype
        });
        const result = await poller.pollUntilDone();
        console.log('Form Recognizer response received');  // Log when the response is received

        // Generate a filename with timestamp
        const timestamp = Date.now();
        const jsonFilename = `result_${timestamp}.json`;
        const jsonFilePath = path.join(tempDirectory, jsonFilename);

        // Save the result to a JSON file
        fs.writeFileSync(jsonFilePath, JSON.stringify(result, null, 2));
        console.log(`Result saved to ${jsonFilePath}`);  // Log the save operation

        // Delete the temporary uploaded file
        fs.unlinkSync(filePath);
        console.log('Temporary file deleted:', filePath);  // Log after deleting the temporary file

        // Send the response with the result and the path of the saved file
        res.json({ data: result, savedFile: jsonFilePath });
    } catch (error) {
        console.error('An error occurred while processing the invoice:', error);
        res.status(500).json({ error: 'Failed to process the invoice.' });
    }
});

// 使用RAG路由
app.use('/api/rag', ragRoutes);

// 确保服务器在端口5000上运行
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
