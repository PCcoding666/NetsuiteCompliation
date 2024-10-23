// backend/controllers/uploadController.js

const multer = require('multer');
const path = require('path');
const { spawn } = require('child_process');

// 设置Multer存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // 例如: 1618033988749.pdf
  }
});

const upload = multer({ storage: storage });

exports.extractData = (req, res) => {
  upload.single('file')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json({ error: err.message });
    } else if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;

    // 调用Python脚本进行数据提取（例如，使用Form Recognizer或其他OCR工具）
    const extractScript = path.join(__dirname, '../../rag_system/services/extract_data.py');
    const extractProcess = spawn('python3', [extractScript, filePath]);

    let extractOutput = '';
    let extractError = '';

    extractProcess.stdout.on('data', (data) => {
      extractOutput += data.toString();
    });

    extractProcess.stderr.on('data', (data) => {
      extractError += data.toString();
    });

    extractProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(extractOutput);
          res.json({ data: result });
        } catch (err) {
          res.status(500).json({ error: 'Invalid extract output' });
        }
      } else {
        res.status(500).json({ error: 'Extraction script failed', details: extractError });
      }
    });
  });
};
