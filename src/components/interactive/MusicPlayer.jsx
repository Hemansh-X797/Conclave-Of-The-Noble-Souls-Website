import React, { useState, useEffect, useRef } from 'react';
import ' @/styles/interactive.css';

const MusicPlayer = ({
  playlist = DEFAULT_PLAYLIST,
  autoPlay = false,
  minimizable = true,
  pathway = 'default',
  className = '',
  ...props
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const audioRef = useRef(null);
  const progressIntervalRef = useRef(null);

  const currentTrackData = playlist[currentTrack];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = currentTrackData.url;
      audioRef.current.load();
      
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Playback error:', error);
            setIsPlaying(false);
          });
        }
      }
    }
  }, [currentTrack]);

  useEffect(() => {
    if (autoPlay && audioRef.current) {
      handlePlay();
    }
  }, []);

  const handlePlay = () => {
    if (audioRef.current) {
      setIsLoading(true);
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
            startProgressTracking();
          })
          .catch(error => {
            console.error('Playback failed:', error);
            setIsLoading(false);
          });
      }
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      stopProgressTracking();
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  const handleNext = () => {
    const nextTrack = (currentTrack + 1) % playlist.length;
    setCurrentTrack(nextTrack);
  };

  const handlePrevious = () => {
    const prevTrack = currentTrack === 0 ? playlist.length - 1 : currentTrack - 1;
    setCurrentTrack(prevTrack);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const handleProgressClick = (e) => {
    if (audioRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      const newTime = percentage * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    handleNext();
  };

  const startProgressTracking = () => {
    stopProgressTracking();
    progressIntervalRef.current = setInterval(() => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    }, 100);
  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const getVolumeIcon = () => {
    if (volume === 0) return '🔇';
    if (volume < 0.5) return '🔉';
    return '🔊';
  };

  useEffect(() => {
    return () => {
      stopProgressTracking();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  if (isMinimized) {
    return (
      <div
        className={`music-player-container minimized ${pathway}-realm ${className}`}
        onClick={toggleMinimize}
        data-cursor="hover"
        {...props}
      >
        <button className="music-player-btn play-pause" data-cursor="hover">
          {isPlaying ? '⏸' : '▶'}
        </button>
      </div>
    );
  }

  return (
    <div className={`music-player-container ${pathway}-realm ${className}`} {...props}>
      <audio
        ref={audioRef}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />

      <div className="music-player-header">
        <div className="music-player-title">Noble Music</div>
        {minimizable && (
          <button
            className="music-player-toggle"
            onClick={toggleMinimize}
            data-cursor="hover"
            aria-label="Minimize player"
          >
            −
          </button>
        )}
      </div>

      <div className="music-player-track-info">
        <div className="music-player-track-title">{currentTrackData.title}</div>
        <div className="music-player-track-artist">{currentTrackData.artist}</div>
      </div>

      <div className="music-player-progress">
        <div
          className="music-player-progress-bar"
          onClick={handleProgressClick}
          data-cursor="hover"
        >
          <div
            className="music-player-progress-fill"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>
        <div className="music-player-time">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="music-player-controls">
        <button
          className="music-player-btn"
          onClick={handlePrevious}
          data-cursor="hover"
          aria-label="Previous track"
        >
          ⏮
        </button>
        <button
          className="music-player-btn play-pause"
          onClick={handlePlayPause}
          disabled={isLoading}
          data-cursor="hover"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isLoading ? '⏳' : isPlaying ? '⏸' : '▶'}
        </button>
        <button
          className="music-player-btn"
          onClick={handleNext}
          data-cursor="hover"
          aria-label="Next track"
        >
          ⏭
        </button>
      </div>

      <div className="music-player-volume">
        <div className="music-player-volume-icon">{getVolumeIcon()}</div>
        <div
          className="music-player-volume-slider"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = x / rect.width;
            setVolume(Math.max(0, Math.min(1, percentage)));
          }}
          data-cursor="hover"
        >
          <div
            className="music-player-volume-fill"
            style={{ width: `${volume * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// Default ambient playlist using online sources
const DEFAULT_PLAYLIST = [
  {
    title: 'Ethereal Dreams',
    artist: 'Ambient Collective',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3'
  },
  {
    title: 'Peaceful Piano',
    artist: 'Classical Essence',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c4c5b35d9f.mp3'
  },
  {
    title: 'Meditation Flow',
    artist: 'Zen Masters',
    url: 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe92c21.mp3'
  },
  {
    title: 'Ambient Serenity',
    artist: 'Sound Therapy',
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d1718ab41b.mp3'
  },
  {
    title: 'Calm Waters',
    artist: 'Nature Sounds',
    url: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3'
  }
];

// Gaming pathway playlist
const GAMING_PLAYLIST = [
  {
    title: 'Epic Battle',
    artist: 'Gaming Soundtracks',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_6c34f742bf.mp3'
  },
  {
    title: 'Cyber Future',
    artist: 'Electronic Dreams',
    url: 'https://cdn.pixabay.com/download/audio/2022/09/06/audio_6bb1834f49.mp3'
  },
  {
    title: 'Victory Theme',
    artist: 'Game Music',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3'
  }
];

// Lorebound pathway playlist
const LOREBOUND_PLAYLIST = [
  {
    title: 'Mystical Journey',
    artist: 'Fantasy Orchestra',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_c4c5e0c768.mp3'
  },
  {
    title: 'Ancient Tales',
    artist: 'Storyteller Music',
    url: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3'
  },
  {
    title: 'Magical Realm',
    artist: 'Enchanted Sounds',
    url: 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe92c21.mp3'
  }
];

// Productive pathway playlist
const PRODUCTIVE_PLAYLIST = [
  {
    title: 'Focus Flow',
    artist: 'Productivity Beats',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c4c5b35d9f.mp3'
  },
  {
    title: 'Work Mode',
    artist: 'Concentration Music',
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d1718ab41b.mp3'
  },
  {
    title: 'Deep Work',
    artist: 'Study Sounds',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3'
  }
];

// Pre-configured music players
export const GamingMusicPlayer = (props) => (
  <MusicPlayer playlist={GAMING_PLAYLIST} pathway="gaming" {...props} />
);

export const LoreboundMusicPlayer = (props) => (
  <MusicPlayer playlist={LOREBOUND_PLAYLIST} pathway="lorebound" {...props} />
);

export const ProductiveMusicPlayer = (props) => (
  <MusicPlayer playlist={PRODUCTIVE_PLAYLIST} pathway="productive" {...props} />
);

export { DEFAULT_PLAYLIST, GAMING_PLAYLIST, LOREBOUND_PLAYLIST, PRODUCTIVE_PLAYLIST };
export default MusicPlayer;