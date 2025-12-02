// ============================================================================
// ShowCaseGrid.tsx
// Location: /src/components/pathways/productive/ShowCaseGrid.tsx
// ============================================================================

import { useState, useMemo } from 'react';
import { Search, Filter, TrendingUp, Clock, Star } from 'lucide-react';
import ShowcaseCard from './ShowCaseCard';
import type { ShowcaseItem } from './ShowCaseCard';

interface ShowcaseGridProps {
  items: ShowcaseItem[];
  onItemLike?: (id: string) => void;
  onItemView?: (id: string) => void;
  onItemComment?: (id: string) => void;
  onItemShare?: (id: string) => void;
}

export function ShowcaseGrid({
  items,
  onItemLike,
  onItemView,
  onItemComment,
  onItemShare
}: ShowcaseGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'featured'>('recent');
  
  const filteredItems = useMemo(() => {
    let filtered = items;
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.type === filterType);
    }
    
    // Sort
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'popular') {
        return b.likes - a.likes;
      } else if (sortBy === 'featured') {
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    
    return filtered;
  }, [items, searchQuery, filterType, sortBy]);
  
  return (
    <div className="showcase-grid-container">
      {/* Controls */}
      <div className="showcase-controls">
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search showcase..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input text-body"
          />
        </div>
        
        <div className="filter-controls">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select text-body"
          >
            <option value="all">All Types</option>
            <option value="program">Programs</option>
            <option value="digital">Digital Products</option>
            <option value="physical">Physical Products</option>
            <option value="skill">Skills</option>
            <option value="achievement">Achievements</option>
            <option value="other">Other</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="filter-select text-body"
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
            <option value="featured">Featured</option>
          </select>
        </div>
      </div>
      
      {/* Grid */}
      <div className="showcase-grid">
        {filteredItems.map(item => (
          <ShowcaseCard
            key={item.id}
            item={item}
            onLike={onItemLike}
            onView={onItemView}
            onComment={onItemComment}
            onShare={onItemShare}
          />
        ))}
      </div>
      
      {filteredItems.length === 0 && (
        <div className="empty-state">
          <Star size={64} className="empty-icon" />
          <h3 className="text-h3">No showcases found</h3>
          <p className="text-body text-secondary">Try adjusting your filters or search query</p>
        </div>
      )}
      
      <style jsx>{`
        .showcase-grid-container {
          width: 100%;
        }
        
        .showcase-controls {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }
        
        .search-bar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          flex: 1;
          min-width: 250px;
        }
        
        .search-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
        }
        
        .filter-controls {
          display: flex;
          gap: 1rem;
        }
        
        .filter-select {
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: var(--text-primary);
          cursor: pointer;
        }
        
        .showcase-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 2rem;
        }
        
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 4rem 2rem;
          text-align: center;
        }
        
        .empty-icon {
          color: var(--text-secondary);
          opacity: 0.5;
        }
        
        @media (max-width: 768px) {
          .showcase-grid {
            grid-template-columns: 1fr;
          }
          
          .filter-controls {
            width: 100%;
            flex-direction: column;
          }
          
          .filter-select {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}