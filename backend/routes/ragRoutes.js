// backend/routes/ragRoutes.js

const express = require('express');
const router = express.Router();
const ragController = require('../controllers/ragController'); // 确保路径正确

router.post('/check-compliance', ragController.checkCompliance);

module.exports = router;
