// backend/routes/uploadRoutes.js

const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

// 定义文件上传的API端点
router.post('/extract', uploadController.extractData);

module.exports = router;
