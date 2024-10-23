// backend/controllers/ragController.js

const { spawn } = require('child_process');
const path = require('path');
const config = require('../config/config'); // 更新后的路径

exports.checkCompliance = (req, res) => {
    const structuredData = req.body; // 前端发送的结构化数据

    // 后端自行管理数据库路径，不需要前端传递
    structuredData.database_path = path.resolve(__dirname, '../../rag_system/database/real_estates.db');

    // 调用RAG系统的Python脚本
    const ragScript = path.join(__dirname, '../../rag_system/services/rag_service.py');
    const ragProcess = spawn('python3', [ragScript]);

    let ragOutput = '';
    let ragError = '';

    ragProcess.stdout.on('data', (data) => {
        ragOutput += data.toString();
    });

    ragProcess.stderr.on('data', (data) => {
        ragError += data.toString();
    });

    ragProcess.on('close', (code) => {
        if (code === 0) {
            try {
                const result = JSON.parse(ragOutput);
                res.json(result);
            } catch (err) {
                res.status(500).json({ error: 'Invalid RAG output' });
            }
        } else {
            res.status(500).json({ error: 'RAG script failed', details: ragError });
        }
    });

    // 发送结构化数据到RAG系统的标准输入
    ragProcess.stdin.write(JSON.stringify(structuredData));
    ragProcess.stdin.end();
};
