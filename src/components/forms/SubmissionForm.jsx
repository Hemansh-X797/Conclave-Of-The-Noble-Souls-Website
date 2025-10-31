import React, { useState, useCallback } from 'react';
import { TextFlameButton, TextDimButton } from './LuxuryButton';

/**
 * SubmissionForm Component
 * Submit content (articles, art, events, resources) to The Conclave
 * 
 * @version 2.0 - The Conclave Realm
 */

const SubmissionForm = ({
  showHeader = true,
  title = 'Submit Content',
  subtitle = 'Share your creations with The Conclave community',
  allowedTypes = ['article', 'artwork', 'event', 'resource', 'guide'],
  maxFiles = 10,
  onSuccess,
  onError,
  className = '',
  style = {},
  pathway,
  ...restProps
}) => {
  const [formData, setFormData] = useState({
    submitterName: '',
    submitterDiscord: '',
    submitterEmail: '',
    contentType: '',
    pathway: pathway || 'default',
    title: '',
    description: '',
    contentBody: '',
    tags: [],
    externalLink: '',
    allowComments: true,
    allowSharing: true,
    attribution: '',
    license: 'cc-by'
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [files, setFiles] = useState([]);
  const [tagInput, setTagInput] = useState('');
  
  const contentTypes = {
    article: { label: 'Article/Blog Post', icon: '📝', description: 'Written content, tutorials, guides' },
    artwork: { label: 'Artwork/Graphics', icon: '🎨', description: 'Digital art, graphics, designs' },
    event: { label: 'Event Proposal', icon: '🎉', description: 'Community event ideas' },
    resource: { label: 'Resource/Tool', icon: '🔧', description: 'Useful tools, templates, assets' },
    guide: { label: 'Guide/Tutorial', icon: '📚', description: 'Step-by-step guides' }
  };
  
  const pathwayOptions = {
    default: 'General',
    gaming: 'Gaming Realm',
    lorebound: 'Lorebound Realm',
    productive: 'Productive Realm',
    news: 'News Realm'
  };
  
  const validateField = useCallback((name, value) => {
    switch (name) {
      case 'submitterName':
        if (!value.trim()) return 'Name is required';
        return null;
      case 'submitterEmail':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email';
        return null;
      case 'contentType':
        if (!value) return 'Select content type';
        return null;
      case 'title':
        if (!value.trim()) return 'Title is required';
        if (value.length < 5) return 'Title too short';
        return null;
      case 'description':
        if (!value.trim()) return 'Description is required';
        if (value.length < 20) return 'Minimum 20 characters';
        return null;
      case 'contentBody':
        if (formData.contentType === 'article' || formData.contentType === 'guide') {
          if (!value.trim()) return 'Content is required';
          if (value.length < 100) return 'Minimum 100 characters for articles/guides';
        }
        return null;
      default:
        return null;
    }
  }, [formData.contentType]);
  
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  }, [errors]);
  
  const handleFileSelect = useCallback((e) => {
    const newFiles = Array.from(e.target.files).filter(f => f.size <= 20 * 1024 * 1024);
    if (files.length + newFiles.length <= maxFiles) {
      setFiles(prev => [...prev, ...newFiles]);
    }
  }, [files, maxFiles]);
  
  const removeFile = useCallback((index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  const handleTagAdd = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
        setTagInput('');
      }
    }
  }, [tagInput, formData.tags]);
  
  const removeTag = useCallback((tagToRemove) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
  }, []);
  
  const validateForm = useCallback(() => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateField]);
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'tags') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });
      files.forEach((file, i) => formDataToSend.append(`file_${i}`, file));
      formDataToSend.append('timestamp', new Date().toISOString());
      
      const response = await fetch('/api/submissions', {
        method: 'POST',
        body: formDataToSend
      });
      
      if (response.ok) {
        setSubmitStatus('success');
        if (onSuccess) onSuccess(await response.json());
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      setSubmitStatus('error');
      if (onError) onError(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className={`submission-form-wrapper ${className}`} style={style} {...restProps}>
      <div className="noble-form noble-form-wide">
        {showHeader && (
          <div className="noble-form-header">
            <h2 className="noble-form-title">{title}</h2>
            <p className="noble-form-subtitle">{subtitle}</p>
          </div>
        )}
        
        {submitStatus === 'success' && (
          <div className="noble-form-alert noble-form-alert-success">
            <span className="noble-form-alert-icon">✓</span>
            <div><strong>Submission received!</strong><br />We'll review your content within 2-3 business days.</div>
          </div>
        )}
        
        {submitStatus === 'error' && (
          <div className="noble-form-alert noble-form-alert-error">
            <span className="noble-form-alert-icon">✕</span>
            <div><strong>Submission failed</strong><br />Please try again.</div>
          </div>
        )}
        
        <div className="noble-form-section">
          <h3 className="noble-form-section-title">Your Information</h3>
          
          <div className="noble-form-field">
            <label htmlFor="submitterName" className="noble-form-label noble-form-label-required">
              Your Name
            </label>
            <input id="submitterName" name="submitterName" type="text"
              className={`noble-form-input ${errors.submitterName ? 'error' : ''}`}
              placeholder="Full name or alias" value={formData.submitterName}
              onChange={handleChange} data-cursor="text" />
            {errors.submitterName && (
              <div className="noble-form-message noble-form-message-error">⚠ {errors.submitterName}</div>
            )}
          </div>
          
          <div className="noble-form-field-inline">
            <div className="noble-form-field">
              <label htmlFor="submitterDiscord" className="noble-form-label">
                Discord Username <span className="noble-form-label-optional">(optional)</span>
              </label>
              <input id="submitterDiscord" name="submitterDiscord" type="text"
                className="noble-form-input" placeholder="username#0000"
                value={formData.submitterDiscord} onChange={handleChange} data-cursor="text" />
            </div>
            
            <div className="noble-form-field">
              <label htmlFor="submitterEmail" className="noble-form-label noble-form-label-required">
                Email
              </label>
              <input id="submitterEmail" name="submitterEmail" type="email"
                className={`noble-form-input ${errors.submitterEmail ? 'error' : ''}`}
                placeholder="your.email@example.com" value={formData.submitterEmail}
                onChange={handleChange} data-cursor="text" />
              {errors.submitterEmail && (
                <div className="noble-form-message noble-form-message-error">⚠ {errors.submitterEmail}</div>
              )}
            </div>
          </div>
        </div>
        
        <div className="noble-form-section">
          <h3 className="noble-form-section-title">Content Type</h3>
          
          <div className="submission-type-grid">
            {Object.entries(contentTypes).filter(([key]) => allowedTypes.includes(key)).map(([key, type]) => (
              <div key={key}
                className={`submission-type-card ${formData.contentType === key ? 'selected' : ''}`}
                onClick={() => handleChange({ target: { name: 'contentType', value: key } })}
                data-cursor="hover">
                <div className="submission-type-icon">{type.icon}</div>
                <div className="submission-type-title">{type.label}</div>
                <div className="submission-type-description">{type.description}</div>
              </div>
            ))}
          </div>
          {errors.contentType && (
            <div className="noble-form-message noble-form-message-error">⚠ {errors.contentType}</div>
          )}
        </div>
        
        <div className="noble-form-section">
          <h3 className="noble-form-section-title">Content Details</h3>
          
          <div className="noble-form-field">
            <label htmlFor="pathway" className="noble-form-label">Target Pathway</label>
            <select id="pathway" name="pathway" className="noble-form-select"
              value={formData.pathway} onChange={handleChange} data-cursor="hover">
              {Object.entries(pathwayOptions).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          
          <div className="noble-form-field">
            <label htmlFor="title" className="noble-form-label noble-form-label-required">
              Title
            </label>
            <input id="title" name="title" type="text"
              className={`noble-form-input ${errors.title ? 'error' : ''}`}
              placeholder="Give your content a catchy title"
              value={formData.title} onChange={handleChange} data-cursor="text" />
            {errors.title && (
              <div className="noble-form-message noble-form-message-error">⚠ {errors.title}</div>
            )}
          </div>
          
          <div className="noble-form-field">
            <label htmlFor="description" className="noble-form-label noble-form-label-required">
              Short Description
            </label>
            <textarea id="description" name="description"
              className={`noble-form-textarea ${errors.description ? 'error' : ''}`}
              placeholder="Brief summary of your content..."
              value={formData.description} onChange={handleChange} rows={3} data-cursor="text" />
            <div className="noble-form-help-text">
              Minimum 20 characters • {formData.description.length} characters
            </div>
            {errors.description && (
              <div className="noble-form-message noble-form-message-error">⚠ {errors.description}</div>
            )}
          </div>
          
          {(formData.contentType === 'article' || formData.contentType === 'guide') && (
            <div className="noble-form-field">
              <label htmlFor="contentBody" className="noble-form-label noble-form-label-required">
                Content Body
              </label>
              <textarea id="contentBody" name="contentBody"
                className={`noble-form-textarea ${errors.contentBody ? 'error' : ''}`}
                placeholder="Write your full content here..."
                value={formData.contentBody} onChange={handleChange} rows={12} data-cursor="text" />
              <div className="noble-form-help-text">
                Minimum 100 characters • {formData.contentBody.length} characters
              </div>
              {errors.contentBody && (
                <div className="noble-form-message noble-form-message-error">⚠ {errors.contentBody}</div>
              )}
            </div>
          )}
          
          <div className="noble-form-field">
            <label className="noble-form-label">Tags (up to 10)</label>
            <div className="noble-form-tags">
              {formData.tags.map(tag => (
                <div key={tag} className="noble-form-tag">
                  {tag}
                  <button type="button" className="noble-form-tag-remove"
                    onClick={() => removeTag(tag)} data-cursor="hover">✕</button>
                </div>
              ))}
              <input type="text" className="noble-form-tags-input"
                placeholder="Type and press Enter" value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagAdd} data-cursor="text" />
            </div>
            <div className="noble-form-help-text">
              Press Enter or comma to add tags • {formData.tags.length}/10 tags
            </div>
          </div>
          
          <div className="noble-form-field">
            <label htmlFor="externalLink" className="noble-form-label">
              External Link <span className="noble-form-label-optional">(optional)</span>
            </label>
            <input id="externalLink" name="externalLink" type="url"
              className="noble-form-input" placeholder="https://your-link.com"
              value={formData.externalLink} onChange={handleChange} data-cursor="text" />
            <div className="noble-form-help-text">
              Portfolio, source code, or related links
            </div>
          </div>
        </div>
        
        <div className="noble-form-section">
          <h3 className="noble-form-section-title">Files & Media</h3>
          <p className="noble-form-section-description">
            Upload images, documents, or other files (Max {maxFiles} files, 20MB each)
          </p>
          
          <div className="noble-form-file-upload">
            <input type="file" id="files" className="noble-form-file-input"
              multiple onChange={handleFileSelect} />
            <label htmlFor="files" className="noble-form-file-label">
              <div className="noble-form-file-icon">📁</div>
              <div className="noble-form-file-text">Click to upload files</div>
              <div className="noble-form-file-hint">Any file type, up to 20MB</div>
            </label>
            
            {files.length > 0 && (
              <div className="noble-form-file-preview">
                {files.map((file, index) => (
                  <div key={index} className="noble-form-file-item">
                    {file.type.startsWith('image/') ? (
                      <img src={URL.createObjectURL(file)} alt={file.name} />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '24px' }}>
                        {file.type.includes('pdf') ? '📄' : '📎'}
                      </div>
                    )}
                    <button type="button" className="noble-form-file-remove"
                      onClick={() => removeFile(index)} data-cursor="hover">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="noble-form-section">
          <h3 className="noble-form-section-title">Attribution & Licensing</h3>
          
          <div className="noble-form-field">
            <label htmlFor="attribution" className="noble-form-label">
              Attribution <span className="noble-form-label-optional">(if applicable)</span>
            </label>
            <input id="attribution" name="attribution" type="text"
              className="noble-form-input"
              placeholder="Credit original creators if using their work"
              value={formData.attribution} onChange={handleChange} data-cursor="text" />
          </div>
          
          <div className="noble-form-field">
            <label htmlFor="license" className="noble-form-label">License</label>
            <select id="license" name="license" className="noble-form-select"
              value={formData.license} onChange={handleChange} data-cursor="hover">
              <option value="cc-by">CC BY - Attribution required</option>
              <option value="cc-by-sa">CC BY-SA - Attribution + ShareAlike</option>
              <option value="cc-by-nc">CC BY-NC - Non-commercial only</option>
              <option value="cc0">CC0 - Public Domain</option>
              <option value="all-rights">All Rights Reserved</option>
            </select>
          </div>
          
          <div className="noble-form-field">
            <div className="noble-form-checkbox">
              <input type="checkbox" id="allowComments" name="allowComments"
                className="noble-form-checkbox-input" checked={formData.allowComments}
                onChange={handleChange} data-cursor="hover" />
              <label htmlFor="allowComments" className="noble-form-checkbox-label">
                Allow community comments
              </label>
            </div>
          </div>
          
          <div className="noble-form-field">
            <div className="noble-form-checkbox">
              <input type="checkbox" id="allowSharing" name="allowSharing"
                className="noble-form-checkbox-input" checked={formData.allowSharing}
                onChange={handleChange} data-cursor="hover" />
              <label htmlFor="allowSharing" className="noble-form-checkbox-label">
                Allow sharing on social media
              </label>
            </div>
          </div>
        </div>
        
        <div className="noble-form-actions">
          <TextDimButton onClick={() => window.history.back()} disabled={isSubmitting}>
            Cancel
          </TextDimButton>
          <TextFlameButton onClick={handleSubmit}
            disabled={isSubmitting || submitStatus === 'success'} data-cursor="hover">
            {isSubmitting ? 'Submitting...' : 'Submit Content'}
          </TextFlameButton>
        </div>
        
        {isSubmitting && (
          <div className="noble-form-loading-overlay">
            <div className="noble-form-spinner" />
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionForm;