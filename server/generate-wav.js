const fs = require('fs');

// WAV文件头部结构
const generateWavHeader = (dataLength) => {
  const buffer = Buffer.alloc(44);
  
  // RIFF chunk descriptor
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write('WAVE', 8);
  
  // fmt sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size
  buffer.writeUInt16LE(1, 20); // AudioFormat (PCM)
  buffer.writeUInt16LE(1, 22); // NumChannels (Mono)
  buffer.writeUInt32LE(44100, 24); // SampleRate
  buffer.writeUInt32LE(44100 * 2, 28); // ByteRate
  buffer.writeUInt16LE(2, 32); // BlockAlign
  buffer.writeUInt16LE(16, 34); // BitsPerSample
  
  // data sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataLength, 40);
  
  return buffer;
};

// 生成一个简单的正弦波
const generateSineWave = (frequency, duration) => {
  const sampleRate = 44100;
  const amplitude = 32767;
  const samples = Math.floor(sampleRate * duration);
  const buffer = Buffer.alloc(samples * 2);
  
  for (let i = 0; i < samples; i++) {
    const value = Math.sin((2 * Math.PI * frequency * i) / sampleRate);
    const sample = Math.floor(value * amplitude);
    buffer.writeInt16LE(sample, i * 2);
  }
  
  return buffer;
};

// 生成WAV文件
const frequency = 440; // 440Hz (A4音符)
const duration = 3; // 3秒
const dataBuffer = generateSineWave(frequency, duration);
const headerBuffer = generateWavHeader(dataBuffer.length);

// 将头部和数据写入文件
fs.writeFileSync('sample.wav', Buffer.concat([headerBuffer, dataBuffer]));
console.log('已生成示例WAV文件：sample.wav'); 