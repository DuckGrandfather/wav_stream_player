import { useEffect, useRef, useState } from 'react';
import './WavPlayer.css';

interface WavPlayerProps {
  streamUrl: string;
}

const WavPlayer: React.FC<WavPlayerProps> = ({ streamUrl }) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAudio = async () => {
      try {
        // 使用fetch预请求音频文件并打印请求信息
        console.log('音频文件请求URL:', streamUrl);
        const response = await fetch(streamUrl);
        console.log('请求头:', {
          method: 'GET',
          headers: Array.from(response.headers.entries()).reduce((obj, [key, value]) => {
            obj[key] = value;
            return obj;
          }, {} as Record<string, string>)
        });
        console.log('响应状态:', response.status, response.statusText);
        console.log('响应头:', {
          type: response.type,
          headers: Array.from(response.headers.entries()).reduce((obj, [key, value]) => {
            obj[key] = value;
            return obj;
          }, {} as Record<string, string>)
        });

        // 初始化音频元素
        audioElementRef.current = new Audio();
        audioContextRef.current = new AudioContext();
        
        const audioElement = audioElementRef.current;
        audioElement.src = streamUrl;
        
        // 设置音频元素事件监听器
        audioElement.addEventListener('timeupdate', handleTimeUpdate);
        audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
        audioElement.addEventListener('ended', handleEnded);
        audioElement.addEventListener('error', handleError);
        audioElement.addEventListener('canplay', () => setIsLoading(false));

        // 预加载音频
        audioElement.load();
      } catch (err) {
        console.error('音频加载失败:', err);
        setError(err instanceof Error ? err.message : '加载音频时发生错误');
        setIsLoading(false);
      }
    };

    initAudio();

    return () => {
      audioElementRef.current?.removeEventListener('timeupdate', handleTimeUpdate);
      audioElementRef.current?.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioElementRef.current?.removeEventListener('ended', handleEnded);
      audioElementRef.current?.removeEventListener('error', handleError);
      audioContextRef.current?.close();
    };
  }, [streamUrl]);

  const handleError = (e: Event) => {
    const target = e.target as HTMLAudioElement;
    setError(target.error?.message || '加载音频时发生错误');
    setIsLoading(false);
  };

  const handleTimeUpdate = () => {
    if (audioElementRef.current) {
      setCurrentTime(audioElementRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioElementRef.current) {
      setDuration(audioElementRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (audioElementRef.current) {
      if (isPlaying) {
        audioElementRef.current.pause();
      } else {
        audioElementRef.current.play().catch(e => {
          setError(e.message);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (audioElementRef.current) {
      audioElementRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  };

  const handleSeek = (time: number) => {
    if (audioElementRef.current) {
      audioElementRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (error) {
    return <div className="wav-player error">{error}</div>;
  }

  if (isLoading) {
    return <div className="wav-player loading">加载中...</div>;
  }

  return (
    <div className="wav-player">
      <div className="controls">
        <button onClick={togglePlay} className="play-button">
          {isPlaying ? '暂停' : '播放'}
        </button>
        <div className="progress-container">
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={(e) => handleSeek(Number(e.target.value))}
            className="progress-bar"
          />
          <span className="time-display">{formatTime(currentTime)} / {formatTime(duration)}</span>
        </div>
        <div className="volume-control">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="volume-slider"
          />
        </div>
      </div>
    </div>
  );
};

export default WavPlayer; 