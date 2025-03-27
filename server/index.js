const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');

const app = express();
const port = 3000;

// 启用CORS
app.use(cors());

// 延迟设置（毫秒）
const CHUNK_DELAY = 3; // 每个分片之间的延迟
const RANDOM_DELAY = 2; // 额外的随机延迟范围 (0-200ms)

// 创建一个延迟函数
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 模拟的WAV文件路径
const sampleWavPath = path.join(__dirname, 'sample.wav');

app.get('/audio-stream', async (req, res) => {
    if (!fs.existsSync(sampleWavPath)) {
        return res.status(404).send('音频文件未找到');
    }

    // 设置响应头
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Transfer-Encoding', 'chunked');
    
    console.log('开始流式传输音频...');

    // 读取文件到内存
    const fileBuffer = fs.readFileSync(sampleWavPath);
    const chunkSize = 80 * 1024; // 16KB 分片大小
    let chunkCounter = 0;
    let position = 0;

    // 设置客户端断开连接处理
    let clientDisconnected = false;
    req.on('close', () => {
        console.log('客户端断开连接');
        clientDisconnected = true;
    });

    // 使用自定义流控制逻辑发送分片
    while (position < fileBuffer.length && !clientDisconnected) {
        chunkCounter++;
        
        // 计算当前分片的结束位置
        const end = Math.min(position + chunkSize, fileBuffer.length);
        
        // 提取当前分片
        const chunk = fileBuffer.slice(position, end);
        
        // 生成随机延迟
        const randomDelay = Math.floor(Math.random() * RANDOM_DELAY);
        const totalDelay = CHUNK_DELAY + randomDelay;
        
        console.log(`准备发送第 ${chunkCounter} 个分片 (${chunk.length} 字节), 延迟 ${totalDelay}ms`);
        
        // 等待延迟
        await delay(totalDelay);
        
        if (clientDisconnected) {
            console.log('检测到客户端断开，停止发送');
            break;
        }
        
        // 发送数据块
        res.write(chunk);
        console.log(`已发送第 ${chunkCounter} 个分片 (位置: ${position}-${end})`);
        
        // 更新位置指针
        position = end;
    }
    
    console.log('音频传输完成');
    res.end();
});

// 提供静态文件访问
app.use(express.static(path.join(__dirname, '../public')));

app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
}); 