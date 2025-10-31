import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

// UI Components
import GlassCard, { MediaCard, FeatureCard, CardGrid, CardMasonry, useCardState } from '@/components/ui/GlassCard';
import LuxuryButton, {
  OwnerButton,
  AdminButton,
  NobleButton,
  TextFlameButton,
  TextDimButton,
  GamingButton,
  LoreboundButton,
  ProductiveButton,
  NewsButton
} from '@/components/ui/LuxuryButton';
import LoadingCrest from '@/components/ui/LoadingCrest';
import NobleInput, {
  NobleTextarea,
  NobleSelect,
  NobleFileUpload,
  NobleTagsInput
} from '@/components/ui/NobleInput';

// Permission System
import {
  hasPermission,
  isStaff,
  getPermissionLevel,
  PERMISSIONS,
  PERMISSION_LEVELS
} from '@/constants/permissions';

// ============================================================================
// CONTENT MANAGER COMPONENT
// ============================================================================

const ContentManager = ({
  user = null,
  userRoles = [],
  className = '',
  ...props
}) => {
  const router = useRouter();

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Content data
  const [contents, setContents] = useState([]);
  const [filteredContents, setFilteredContents] = useState([]);

  // Editor state
  const [editorMode, setEditorMode] = useState('list'); // 'list', 'create', 'edit'
  const [currentContent, setCurrentContent] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    type: 'announcement', // 'announcement', 'event', 'news', 'article', 'gallery'
    title: '',
    subtitle: '',
    description: '',
    content: '',
    pathway: 'default', // 'default', 'gaming', 'lorebound', 'productive', 'news'
    status: 'draft', // 'draft', 'scheduled', 'published'
    visibility: 'public', // 'public', 'members', 'vip', 'staff'
    featured: false,
    allowComments: true,
    tags: [],
    media: [],
    thumbnail: null,
    author: user?.id || '',
    publishDate: '',
    expiryDate: '',
    metadata: {}
  });

  // Filters
  const [typeFilter, setTypeFilter] = useState('all');
  const [pathwayFilter, setPathwayFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Validation
  const [validationErrors, setValidationErrors] = useState({});

  // Permission checks
  const permissionLevel = useMemo(() => getPermissionLevel(userRoles), [userRoles]);
  const canManageContent = useMemo(() =>
    hasPermission(userRoles, PERMISSIONS.MANAGE_CONTENT),
    [userRoles]
  );
  const isStaffMember = useMemo(() => isStaff(userRoles), [userRoles]);

  // Refs
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const fetchContents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/admin/content?includeStats=true');
      if (!res.ok) throw new Error('Failed to fetch content');

      const data = await res.json();
      setContents(data.contents || []);
      setFilteredContents(data.contents || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch content:', err);
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!canManageContent) {
      router.push('/chambers/dashboard');
      return;
    }

    fetchContents();
  }, [canManageContent, fetchContents]);

  // ============================================================================
  // FILTERING
  // ============================================================================

  useEffect(() => {
    let filtered = [...contents];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.title?.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query) ||
        c.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(c => c.type === typeFilter);
    }

    // Pathway filter
    if (pathwayFilter !== 'all') {
      filtered = filtered.filter(c => c.pathway === pathwayFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setFilteredContents(filtered);
  }, [searchQuery, typeFilter, pathwayFilter, statusFilter, contents]);

  // ============================================================================
  // FORM HANDLERS
  // ============================================================================

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleMediaUpload = async (files) => {
    try {
      const uploadedMedia = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'content-media');

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData
        });

        if (!res.ok) throw new Error('Upload failed');

        const data = await res.json();
        uploadedMedia.push({
          url: data.url,
          type: file.type.startsWith('image/') ? 'image' : 'video',
          name: file.name,
          size: file.size
        });
      }

      setFormData(prev => ({
        ...prev,
        media: [...prev.media, ...uploadedMedia]
      }));
    } catch (err) {
      console.error('Media upload failed:', err);
      alert('Failed to upload media: ' + err.message);
    }
  };

  const removeMedia = (index) => {
    setFormData(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }

    if (formData.type === 'event' && !formData.publishDate) {
      errors.publishDate = 'Event date is required';
    }

    if (formData.content.length < 50) {
      errors.content = 'Content must be at least 50 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (publishNow = false) => {
    if (!validateForm()) {
      alert('Please fix validation errors before saving');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...formData,
        status: publishNow ? 'published' : formData.status,
        publishedAt: publishNow ? new Date().toISOString() : formData.publishDate,
        author: user.id
      };

      const res = await fetch(
        currentContent ? `/api/admin/content/${currentContent.id}` : '/api/admin/content',
        {
          method: currentContent ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      if (!res.ok) throw new Error('Failed to save content');

      const savedContent = await res.json();

      // Update local state
      if (currentContent) {
        setContents(prev => prev.map(c =>
          c.id === currentContent.id ? savedContent : c
        ));
      } else {
        setContents(prev => [savedContent, ...prev]);
      }

      // Reset form
      resetForm();
      setEditorMode('list');

      alert(publishNow ? 'Content published successfully!' : 'Content saved as draft');
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save content: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (contentId) => {
    const confirmed = confirm('Are you sure you want to delete this content? This action cannot be undone.');
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/content/${contentId}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete content');

      setContents(prev => prev.filter(c => c.id !== contentId));
      alert('Content deleted successfully');
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete content: ' + err.message);
    }
  };

  const handleEdit = (content) => {
    setCurrentContent(content);
    setFormData({
      type: content.type,
      title: content.title,
      subtitle: content.subtitle || '',
      description: content.description,
      content: content.content,
      pathway: content.pathway,
      status: content.status,
      visibility: content.visibility,
      featured: content.featured,
      allowComments: content.allowComments,
      tags: content.tags || [],
      media: content.media || [],
      thumbnail: content.thumbnail,
      author: content.author,
      publishDate: content.publishDate || '',
      expiryDate: content.expiryDate || '',
      metadata: content.metadata || {}
    });
    setEditorMode('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDuplicate = (content) => {
    setCurrentContent(null);
    setFormData({
      ...content,
      title: `${content.title} (Copy)`,
      status: 'draft',
      author: user.id
    });
    setEditorMode('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setCurrentContent(null);
    setFormData({
      type: 'announcement',
      title: '',
      subtitle: '',
      description: '',
      content: '',
      pathway: 'default',
      status: 'draft',
      visibility: 'public',
      featured: false,
      allowComments: true,
      tags: [],
      media: [],
      thumbnail: null,
      author: user?.id || '',
      publishDate: '',
      expiryDate: '',
      metadata: {}
    });
    setValidationErrors({});
  };

  const getPathwayButton = (pathway) => {
    const buttons = {
      gaming: GamingButton,
      lorebound: LoreboundButton,
      productive: ProductiveButton,
      news: NewsButton
    };
    return buttons[pathway] || NobleButton;
  };

  // ============================================================================
  // PERMISSION GUARD
  // ============================================================================

  if (!canManageContent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassCard
          variant="feature"
          title="Access Denied"
          description="You don't have permission to manage content."
          glow
        >
          <LuxuryButton onClick={() => router.push('/chambers/dashboard')}>
            Return to Dashboard
          </LuxuryButton>
        </GlassCard>
      </div>
    );
  }

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (loading && editorMode === 'list') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingCrest
          pathway="default"
          size="large"
          message="Loading content..."
        />
      </div>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassCard
          variant="feature"
          title="Error Loading Content"
          description={error}
          error
        >
          <LuxuryButton onClick={fetchContents}>
            Retry
          </LuxuryButton>
        </GlassCard>
      </div>
    );
  }

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  const renderEditor = () => (
    <section className="content-editor fade-in-up" style={{ marginBottom: '3rem' }}>
      <GlassCard variant="feature" glow className="editor-card">
        <div className="editor-header" style={{ marginBottom: '2rem' }}>
          <h2 className="text-h2 text-gradient-divine">
            {editorMode === 'edit' ? 'Edit Content' : 'Create New Content'}
          </h2>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <TextDimButton onClick={() => {
              resetForm();
              setEditorMode('list');
            }}>
              ← Back to List
            </TextDimButton>
            <TextDimButton onClick={resetForm}>
              Clear Form
            </TextDimButton>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Content Type & Pathway */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <NobleSelect
              label="Content Type"
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              required
              pathway={formData.pathway}
            >
              <option value="announcement">📢 Announcement</option>
              <option value="event">📅 Event</option>
              <option value="news">📰 News Article</option>
              <option value="article">📝 Long Article</option>
              <option value="gallery">🖼️ Gallery</option>
            </NobleSelect>

            <NobleSelect
              label="Pathway"
              value={formData.pathway}
              onChange={(e) => handleInputChange('pathway', e.target.value)}
              pathway={formData.pathway}
            >
              <option value="default">Default</option>
              <option value="gaming">Gaming</option>
              <option value="lorebound">Lorebound</option>
              <option value="productive">Productive</option>
              <option value="news">News</option>
            </NobleSelect>
          </div>

          {/* Title & Subtitle */}
          <NobleInput
            label="Title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter a captivating title..."
            required
            error={validationErrors.title}
            pathway={formData.pathway}
            maxLength={100}
          />

          <NobleInput
            label="Subtitle (Optional)"
            value={formData.subtitle}
            onChange={(e) => handleInputChange('subtitle', e.target.value)}
            placeholder="Add a subtitle for context..."
            pathway={formData.pathway}
            maxLength={150}
          />

          {/* Description */}
          <NobleTextarea
            label="Description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Brief description (shown in previews)..."
            required
            error={validationErrors.description}
            pathway={formData.pathway}
            rows={3}
            maxLength={300}
          />

          {/* Main Content */}
          <NobleTextarea
            label="Content"
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            placeholder="Write your content here... (Markdown supported)"
            required
            error={validationErrors.content}
            pathway={formData.pathway}
            rows={12}
          />

          {/* Tags */}
          <NobleTagsInput
            label="Tags"
            tags={formData.tags}
            onTagsChange={(tags) => handleInputChange('tags', tags)}
            placeholder="Add tags for better discoverability..."
            pathway={formData.pathway}
            autocompleteOptions={['important', 'community', 'update', 'event', 'announcement']}
          />

          {/* Media Upload */}
          <div>
            <label className="text-body-large" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Media Gallery
            </label>
            <NobleFileUpload
              label="Upload Images/Videos"
              accept="image/*,video/*"
              multiple
              previewFiles
              maxFiles={10}
              onChange={(e) => handleMediaUpload(Array.from(e.target.files))}
              pathway={formData.pathway}
            />

            {formData.media.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                {formData.media.map((media, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    {media.type === 'image' ? (
                      <Image
                        src={media.url}
                        alt={media.name}
                        width={150}
                        height={150}
                        style={{ objectFit: 'cover', borderRadius: '8px' }}
                      />
                    ) : (
                      <video src={media.url} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }} />
                    )}
                    <button
                      onClick={() => removeMedia(index)}
                      style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        background: 'rgba(224, 17, 95, 0.9)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Publishing Options */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <NobleSelect
              label="Status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              pathway={formData.pathway}
            >
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
            </NobleSelect>

            <NobleSelect
              label="Visibility"
              value={formData.visibility}
              onChange={(e) => handleInputChange('visibility', e.target.value)}
              pathway={formData.pathway}
            >
              <option value="public">Public</option>
              <option value="members">Members Only</option>
              <option value="vip">VIP Only</option>
              <option value="staff">Staff Only</option>
            </NobleSelect>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => handleInputChange('featured', e.target.checked)}
                />
                <span className="text-body">Featured</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.allowComments}
                  onChange={(e) => handleInputChange('allowComments', e.target.checked)}
                />
                <span className="text-body">Allow Comments</span>
              </label>
            </div>
          </div>

          {/* Dates */}
          {(formData.status === 'scheduled' || formData.type === 'event') && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <NobleInput
                label="Publish Date"
                type="datetime-local"
                value={formData.publishDate}
                onChange={(e) => handleInputChange('publishDate', e.target.value)}
                error={validationErrors.publishDate}
                pathway={formData.pathway}
              />

              <NobleInput
                label="Expiry Date (Optional)"
                type="datetime-local"
                value={formData.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                pathway={formData.pathway}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
            <TextDimButton
              onClick={() => handleSave(false)}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save as Draft'}
            </TextDimButton>

            {React.createElement(getPathwayButton(formData.pathway), {
              onClick: () => handleSave(true),
              disabled: saving
            }, saving ? 'Publishing...' : '✨ Publish Now')}
          </div>
        </div>
      </GlassCard>
    </section>
  );

  const renderFilters = () => (
    <section className="filters-section fade-in-up" style={{ marginBottom: '2rem' }}>
      <GlassCard variant="feature" shimmer>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <NobleInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search content..."
            pathway="default"
          />

          <NobleSelect
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            pathway="default"
          >
            <option value="all">All Types</option>
            <option value="announcement">Announcements</option>
            <option value="event">Events</option>
            <option value="news">News</option>
            <option value="article">Articles</option>
            <option value="gallery">Galleries</option>
          </NobleSelect>

          <NobleSelect
            value={pathwayFilter}
            onChange={(e) => setPathwayFilter(e.target.value)}
            pathway="default"
          >
            <option value="all">All Pathways</option>
            <option value="default">Default</option>
            <option value="gaming">Gaming</option>
            <option value="lorebound">Lorebound</option>
            <option value="productive">Productive</option>
            <option value="news">News</option>
          </NobleSelect>

          <NobleSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            pathway="default"
          >
            <option value="all">All Status</option>
            <option value="draft">Drafts</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
          </NobleSelect>
        </div>
      </GlassCard>
    </section>
  );

  const renderContentCard = (content) => {
    const PathwayButton = getPathwayButton(content.pathway);

    return (
      <FeatureCard
        key={content.id}
        title={content.title}
        subtitle={content.subtitle}
        description={content.description}
        image={content.thumbnail || content.media?.[0]?.url}
        pathway={content.pathway}
        badge={content.status === 'published' ? '✓ Published' : content.status}
        tags={content.tags}
        floating
        shimmer={content.featured}
        glow={content.featured}
        author={{
          name: content.authorName || 'Admin',
          avatar: content.authorAvatar
        }}
        timestamp={new Date(content.createdAt).toLocaleDateString()}
        stats={{
          Views: content.views || 0,
          Likes: content.likes || 0,
          Comments: content.comments || 0
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <TextFlameButton
            size="sm"
            onClick={() => handleEdit(content)}
          >
            ✏️ Edit
          </TextFlameButton>

          <TextDimButton
            size="sm"
            onClick={() => handleDuplicate(content)}
          >
            📋 Duplicate
          </TextDimButton>

          <TextDimButton
            size="sm"
            onClick={() => window.open(`/${content.type}/${content.id}`, '_blank')}
          >
            👁️ Preview
          </TextDimButton>

          <TextDimButton
            size="sm"
            onClick={() => handleDelete(content.id)}
            style={{ color: '#E0115F' }}
          >
            🗑️ Delete
          </TextDimButton>
        </div>
      </FeatureCard>
    );
  };

  const renderContentList = () => (
    <section className="content-list fade-in-up delay-200">
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="text-body">
          Showing {filteredContents.length} of {contents.length} items
        </div>
      </div>

      {filteredContents.length === 0 ? (
        <GlassCard variant="feature" glow>
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p className="text-h3" style={{ opacity: 0.6, marginBottom: '1rem' }}>
              No content found
            </p>
            <NobleButton onClick={() => setEditorMode('create')}>
              Create Your First Content
            </NobleButton>
          </div>
        </GlassCard>
      ) : (
        <CardMasonry columns={3} gap="lg">
          {filteredContents.map(renderContentCard)}
        </CardMasonry>
      )}
    </section>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div
      ref={editorRef}
      className={`content-manager ${className}`}
      data-cursor="default"
      style={{
        minHeight: '100vh',
        padding: '2rem',
        maxWidth: '1600px',
        margin: '0 auto'
      }}
      {...props}
    >
      {/* Header */}
      <header className="manager-header fade-in-down" style={{ marginBottom: '3rem' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 className="text-display text-gradient-divine">
            Content Management
          </h1>
          <p className="text-body-large" style={{ opacity: 0.8, marginTop: '0.5rem' }}>
            Create, edit, and publish divine content
          </p>
        </div>

        {editorMode === 'list' && (
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <NobleButton onClick={() => setEditorMode('create')}>
              ✨ Create New Content
            </NobleButton>
            <TextFlameButton onClick={fetchContents}>
              ↻ Refresh
            </TextFlameButton>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="manager-content">
        {editorMode === 'list' ? (
          <>
            {renderFilters()}
            {renderContentList()}
          </>
        ) : (
          renderEditor()
        )}
      </main>

      {/* Stats Footer */}
      {editorMode === 'list' && (
        <footer style={{ marginTop: '4rem', textAlign: 'center' }}>
          <StatsCard
            title="Content Statistics"
            stats={{
              Total: contents.length,
              Published: contents.filter(c => c.status === 'published').length,
              Drafts: contents.filter(c => c.status === 'draft').length,
              Scheduled: contents.filter(c => c.status === 'scheduled').length
            }}
          />
        </footer>
      )}
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default ContentManager;