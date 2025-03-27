const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// 启用CORS
app.use(cors());

// 模拟的WAV文件路径（我们将使用一个示例WAV文件）
const sampleWavPath = path.join(__dirname, 'sample.wav');

app.get('/audio-stream', (req, res) => {
  // 检查文件是否存在
  if (!fs.existsSync(sampleWavPath)) {
    return res.status(404).send('音频文件未找到');
  }

  // 获取文件大小
  const stat = fs.statSync(sampleWavPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    // 处理范围请求
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(sampleWavPath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'audio/wav',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    // 处理完整文件请求
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'audio/wav',
    };
    res.writeHead(200, head);
    fs.createReadStream(sampleWavPath).pipe(res);
  }
});

app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
}); 