import React, { useState, useEffect, useRef } from 'react';
import ' @/styles/interactive.css';

const LiveStats = ({
  stats = {},
  updateInterval = 30000,
  animated = true,
  pathway = 'default',
  layout = 'grid',
  className = '',
  ...props
}) => {
  const [displayStats, setDisplayStats] = useState(stats);
  const [changes, setChanges] = useState({});
  const prevStatsRef = useRef(stats);

  useEffect(() => {
    setDisplayStats(stats);

    // Calculate changes
    const newChanges = {};
    Object.keys(stats).forEach(key => {
      const current = stats[key];
      const previous = prevStatsRef.current[key];
      if (typeof current === 'number' && typeof previous === 'number') {
        const diff = current - previous;
        if (diff !== 0) {
          newChanges[key] = {
            value: diff,
            percentage: previous !== 0 ? ((diff / previous) * 100).toFixed(1) : 0,
            direction: diff > 0 ? 'positive' : 'negative'
          };
        }
      }
    });

    setChanges(newChanges);
    prevStatsRef.current = stats;
  }, [stats]);

  const formatValue = (value) => {
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return value;
  };

  const getStatIcon = (label) => {
    const iconMap = {
      'members': '👥',
      'online': '🟢',
      'messages': '💬',
      'events': '🎉',
      'posts': '📝',
      'reactions': '⭐',
      'active': '⚡',
      'tournaments': '🏆',
      'achievements': '🎖️',
      'threads': '🧵',
      'voices': '🎤',
      'gaming': '⚔️',
      'lorebound': '✦',
      'productive': '⚡',
      'news': '◆'
    };
    
    const key = label.toLowerCase().replace(/\s+/g, '');
    return iconMap[key] || '📊';
  };

  return (
    <div className={`live-stats-container ${pathway}-realm ${className}`} {...props}>
      {Object.entries(displayStats).map(([label, value]) => (
        <div key={label} className="live-stat-card" data-cursor="hover">
          <div className="live-stat-icon">{getStatIcon(label)}</div>
          <div className="live-stat-label">{label}</div>
          <div className="live-stat-value">
            {animated ? (
              <AnimatedNumber value={value} />
            ) : (
              formatValue(value)
            )}
          </div>
          {changes[label] && (
            <div className={`live-stat-change ${changes[label].direction}`}>
              {changes[label].direction === 'positive' ? '↑' : '↓'} 
              {Math.abs(changes[label].value)} ({changes[label].percentage}%)
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Animated number component
const AnimatedNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (typeof value !== 'number') {
      setDisplayValue(value);
      return;
    }

    setIsAnimating(true);
    const duration = 1000;
    const steps = 30;
    const increment = (value - displayValue) / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayValue(value);
        setIsAnimating(false);
        clearInterval(timer);
      } else {
        setDisplayValue(prev => {
          const next = prev + increment;
          return typeof next === 'number' ? Math.round(next) : next;
        });
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  if (typeof displayValue === 'number') {
    return displayValue.toLocaleString();
  }
  return displayValue;
};

// Pre-configured LiveStats components
export const DiscordLiveStats = ({ discordData, ...props }) => {
  const [stats, setStats] = useState({
    'Members': 0,
    'Online': 0,
    'Messages': 0,
    'Active': 0
  });

  useEffect(() => {
    if (discordData) {
      setStats({
        'Members': discordData.memberCount || 0,
        'Online': discordData.onlineCount || 0,
        'Messages': discordData.messageCount || 0,
        'Active': discordData.activeCount || 0
      });
    }
  }, [discordData]);

  return <LiveStats stats={stats} {...props} />;
};

export const PathwayStats = ({ pathwayData, ...props }) => {
  const [stats, setStats] = useState({
    'Gaming': 0,
    'Lorebound': 0,
    'Productive': 0,
    'News': 0
  });

  useEffect(() => {
    if (pathwayData) {
      setStats({
        'Gaming': pathwayData.gaming || 0,
        'Lorebound': pathwayData.lorebound || 0,
        'Productive': pathwayData.productive || 0,
        'News': pathwayData.news || 0
      });
    }
  }, [pathwayData]);

  return <LiveStats stats={stats} {...props} />;
};

export const CommunityStats = ({ communityData, ...props }) => {
  const [stats, setStats] = useState({
    'Events': 0,
    'Posts': 0,
    'Reactions': 0,
    'Achievements': 0
  });

  useEffect(() => {
    if (communityData) {
      setStats({
        'Events': communityData.events || 0,
        'Posts': communityData.posts || 0,
        'Reactions': communityData.reactions || 0,
        'Achievements': communityData.achievements || 0
      });
    }
  }, [communityData]);

  return <LiveStats stats={stats} {...props} />;
};

// Hook for fetching live stats
export const useLiveStats = (apiEndpoint, updateInterval = 30000) => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch(apiEndpoint);
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, updateInterval);

    return () => clearInterval(interval);
  }, [apiEndpoint, updateInterval]);

  return { stats, loading, error };
};

export default LiveStats;