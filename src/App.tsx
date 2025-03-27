import WavPlayer from './components/WavPlayer'
import './App.css'

function App() {
  const streamUrl = 'http://localhost:3000/audio-stream';

  return (
    <div className="app">
      <h1>WAV流式播放器</h1>
      <WavPlayer streamUrl={streamUrl} />
    </div>
  )
}

export default App
