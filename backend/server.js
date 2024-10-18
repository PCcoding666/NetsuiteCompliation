require('dotenv').config(); // Load environment variables
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const { DocumentAnalysisClient, AzureKeyCredential } = require('@azure/ai-form-recognizer'); // Azure SDK

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());

// File upload and data extraction route
app.post('/api/extract', upload.single('file'), async (req, res) => {
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
    console.log('Form Recognizer response received:', result);  // Log the full response from Form Recognizer

    // 删除临时文件
    fs.unlinkSync(filePath);
    console.log('Temporary file deleted:', filePath);  // Log after deleting the temporary file

    // 返回从Azure获取的响应数据
    res.json({ data: result });
  } catch (error) {
    console.error('An error occurred while processing the invoice:', error);
    res.status(500).json({ error: 'Failed to process the invoice.' });
  }
});

app.listen(5000, '0.0.0.0', () => {
  console.log('Server running on port 5000');
});
