// ============================================================================
// ShowCaseCard.tsx
// Location: /src/components/pathways/productive/ShowCaseCard.tsx
// ============================================================================

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Heart,
  Eye,
  MessageCircle,
  Share2,
  ExternalLink,
  User,
  Calendar,
  Award,
  Code,
  Palette,
  Package,
  Star
} from 'lucide-react';

/**
 * @interface ShowcaseItem
 * @description User submission data structure
 */
export interface ShowcaseItem {
  id: string;
  type: 'program' | 'digital' | 'physical' | 'skill' | 'achievement' | 'other';
  title: string;
  description: string;
  creator: {
    id: string;
    name: string;
    avatar?: string;
  };
  media: {
    type: 'image' | 'video' | 'link';
    url: string;
    thumbnail?: string;
  };
  tags: string[];
  likes: number;
  views: number;
  comments?: number;
  createdAt: string;
  featured?: boolean;
  externalLink?: string;
}

/**
 * @interface ShowcaseCardProps
 */
interface ShowcaseCardProps {
  item: ShowcaseItem;
  onLike?: (id: string) => void;
  onView?: (id: string) => void;
  onComment?: (id: string) => void;
  onShare?: (id: string) => void;
  variant?: 'default' | 'compact' | 'featured';
}

/**
 * @component ShowcaseCard
 * @description Display user submission with engagement features
 */
export default function ShowcaseCard({
  item,
  onLike,
  onView,
  onComment,
  onShare,
  variant = 'default'
}: ShowcaseCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(item.likes);
  
  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    onLike?.(item.id);
  };
  
  const handleView = () => {
    onView?.(item.id);
  };
  
  const getTypeIcon = () => {
    switch (item.type) {
      case 'program': return <Code size={16} />;
      case 'digital': return <Palette size={16} />;
      case 'physical': return <Package size={16} />;
      case 'skill': return <Star size={16} />;
      case 'achievement': return <Award size={16} />;
      default: return <Star size={16} />;
    }
  };
  
  const getTypeColor = () => {
    switch (item.type) {
      case 'program': return '#00BFFF';
      case 'digital': return '#FF69B4';
      case 'physical': return '#FFD700';
      case 'skill': return '#9370DB';
      case 'achievement': return '#50C878';
      default: return '#808080';
    }
  };
  
  if (variant === 'compact') {
    return (
      <div className="showcase-card-compact" onClick={handleView}>
        <div className="compact-media">
          {item.media.type === 'image' && (
            <Image
              src={item.media.url}
              alt={item.title}
              fill
              className="media-image"
              sizes="200px"
            />
          )}
        </div>
        
        <div className="compact-content">
          <div className="type-badge" style={{ backgroundColor: getTypeColor() }}>
            {getTypeIcon()}
            <span className="text-label-xs">{item.type}</span>
          </div>
          
          <h4 className="text-h4">{item.title}</h4>
          
          <div className="compact-stats">
            <span className="stat">
              <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />
              {likeCount}
            </span>
            <span className="stat">
              <Eye size={14} />
              {item.views}
            </span>
          </div>
        </div>
        
        <style jsx>{`
          .showcase-card-compact {
            display: flex;
            gap: 1rem;
            padding: 1rem;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .showcase-card-compact:hover {
            background: rgba(255, 255, 255, 0.05);
            transform: translateY(-2px);
          }
          
          .compact-media {
            position: relative;
            width: 100px;
            height: 100px;
            border-radius: 8px;
            overflow: hidden;
            background: rgba(80, 200, 120, 0.1);
            flex-shrink: 0;
          }
          
          .media-image {
            object-fit: cover;
          }
          
          .compact-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .type-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            padding: 0.25rem 0.5rem;
            border-radius: 8px;
            color: white;
            width: fit-content;
          }
          
          .compact-stats {
            display: flex;
            gap: 1rem;
            color: var(--text-secondary);
          }
          
          .stat {
            display: flex;
            align-items: center;
            gap: 0.25rem;
          }
        `}</style>
      </div>
    );
  }
  
  return (
    <div className={`showcase-card ${item.featured ? 'showcase-featured' : ''}`}>
      {item.featured && (
        <div className="featured-badge">
          <Award size={14} />
          <span className="text-label-xs">Featured</span>
        </div>
      )}
      
      {/* Media */}
      <div className="showcase-media" onClick={handleView}>
        {item.media.type === 'image' && (
          <Image
            src={item.media.url}
            alt={item.title}
            fill
            className="media-image"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
        {item.media.type === 'video' && (
          <video src={item.media.url} poster={item.media.thumbnail} className="media-video" />
        )}
        
        <div className="media-overlay">
          <div className="type-badge" style={{ backgroundColor: getTypeColor() }}>
            {getTypeIcon()}
            <span className="text-label-sm">{item.type}</span>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="showcase-content">
        <h3 className="text-h3 showcase-title" onClick={handleView}>{item.title}</h3>
        
        <p className="text-body-sm showcase-description">{item.description}</p>
        
        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="showcase-tags">
            {item.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="tag text-label-xs">
                {tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="tag text-label-xs">+{item.tags.length - 3}</span>
            )}
          </div>
        )}
        
        {/* Creator */}
        <div className="showcase-creator">
          <div className="creator-avatar">
            {item.creator.avatar ? (
              <Image
                src={item.creator.avatar}
                alt={item.creator.name}
                fill
                className="avatar-image"
              />
            ) : (
              <User size={16} />
            )}
          </div>
          <div>
            <p className="text-body-sm creator-name">{item.creator.name}</p>
            <p className="text-label-xs text-secondary">
              {new Date(item.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="showcase-actions">
          <button
            className={`action-button ${isLiked ? 'action-active' : ''}`}
            onClick={handleLike}
          >
            <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
            <span className="text-label-sm">{likeCount}</span>
          </button>
          
          <button className="action-button">
            <Eye size={18} />
            <span className="text-label-sm">{item.views}</span>
          </button>
          
          {item.comments !== undefined && (
            <button className="action-button" onClick={() => onComment?.(item.id)}>
              <MessageCircle size={18} />
              <span className="text-label-sm">{item.comments}</span>
            </button>
          )}
          
          <button className="action-button" onClick={() => onShare?.(item.id)}>
            <Share2 size={18} />
          </button>
          
          {item.externalLink && (
            <a
              href={item.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="action-button"
            >
              <ExternalLink size={18} />
            </a>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .showcase-card {
          position: relative;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s;
        }
        
        .showcase-card:hover {
          background: rgba(255, 255, 255, 0.05);
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(80, 200, 120, 0.2);
        }
        
        .showcase-featured {
          border: 2px solid var(--productive-primary);
        }
        
        .featured-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, var(--productive-primary), var(--productive-secondary));
          border-radius: 20px;
          color: white;
          z-index: 10;
          font-weight: 600;
        }
        
        .showcase-media {
          position: relative;
          width: 100%;
          height: 250px;
          background: rgba(80, 200, 120, 0.1);
          cursor: pointer;
          overflow: hidden;
        }
        
        .media-image,
        .media-video {
          object-fit: cover;
          transition: transform 0.5s;
        }
        
        .showcase-card:hover .media-image,
        .showcase-card:hover .media-video {
          transform: scale(1.05);
        }
        
        .media-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.7) 100%);
          display: flex;
          align-items: flex-end;
          padding: 1rem;
        }
        
        .type-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 12px;
          color: white;
          font-weight: 600;
        }
        
        .showcase-content {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .showcase-title {
          color: var(--text-primary);
          cursor: pointer;
          transition: color 0.2s;
        }
        
        .showcase-title:hover {
          color: var(--productive-primary);
        }
        
        .showcase-description {
          color: var(--text-secondary);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .showcase-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .tag {
          padding: 0.25rem 0.75rem;
          background: rgba(80, 200, 120, 0.1);
          border: 1px solid rgba(80, 200, 120, 0.3);
          border-radius: 12px;
          color: var(--productive-primary);
        }
        
        .showcase-creator {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .creator-avatar {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
          background: rgba(80, 200, 120, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--productive-primary);
        }
        
        .avatar-image {
          object-fit: cover;
        }
        
        .creator-name {
          color: var(--text-primary);
          font-weight: 500;
        }
        
        .showcase-actions {
          display: flex;
          gap: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .action-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }
        
        .action-button:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--productive-primary);
          transform: translateY(-2px);
        }
        
        .action-active {
          background: rgba(80, 200, 120, 0.2);
          color: var(--productive-primary);
          border-color: var(--productive-primary);
        }
        
        @media (max-width: 768px) {
          .showcase-media {
            height: 200px;
          }
          
          .showcase-actions {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
}