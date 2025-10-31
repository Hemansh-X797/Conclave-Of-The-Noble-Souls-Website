import React, { useState, useCallback } from 'react';
import { TextFlameButton, TextDimButton } from './LuxuryButton';

/**
 * AppealForm Component
 * Handle unban, unmute, and unwarn appeals with evidence uploads
 * 
 * @version 2.0 - The Conclave Realm
 */

const AppealForm = ({
  // Configuration
  showHeader = true,
  title = 'Submit an Appeal',
  subtitle = 'Appeal a ban, mute, or warning decision',
  appealTypes = ['ban', 'mute', 'warn'],
  maxEvidenceFiles = 5,
  
  // Callbacks
  onSuccess,
  onError,
  
  // Customization
  className = '',
  style = {},
  pathway,
  
  ...restProps
}) => {
  // Form state
  const [formData, setFormData] = useState({
    discordUsername: '',
    discordId: '',
    email: '',
    appealType: '',
    punishmentDate: '',
    moderatorName: '',
    reason: '',
    whatHappened: '',
    whyUnfair: '',
    whatChanged: '',
    willFollow: true,
    additionalInfo: ''
  });
  
  // UI state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  
  // Appeal type details
  const appealTypeInfo = {
    ban: {
      title: 'Ban Appeal',
      icon: '🚫',
      description: 'Appeal a permanent or temporary ban',
      severity: 'critical'
    },
    mute: {
      title: 'Mute Appeal',
      icon: '🔇',
      description: 'Appeal a mute/timeout restriction',
      severity: 'important'
    },
    warn: {
      title: 'Warning Appeal',
      icon: '⚠️',
      description: 'Appeal a warning on your record',
      severity: 'info'
    }
  };
  
  // Validation
  const validateField = useCallback((name, value) => {
    switch (name) {
      case 'discordUsername':
        if (!value.trim()) return 'Discord username is required';
        return null;
        
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
        return null;
        
      case 'appealType':
        if (!value) return 'Please select appeal type';
        return null;
        
      case 'punishmentDate':
        if (!value) return 'Punishment date is required';
        return null;
        
      case 'reason':
        if (!value.trim()) return 'Original reason is required';
        return null;
        
      case 'whatHappened':
        if (!value.trim()) return 'This field is required';
        if (value.length < 50) return 'Please provide at least 50 characters';
        return null;
        
      case 'whyUnfair':
        if (!value.trim()) return 'This field is required';
        if (value.length < 30) return 'Please provide at least 30 characters';
        return null;
        
      case 'whatChanged':
        if (!value.trim()) return 'This field is required';
        if (value.length < 30) return 'Please provide at least 30 characters';
        return null;
        
      default:
        return null;
    }
  }, []);
  
  // Handle input change
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);
  
  // File upload handling
  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  }, [evidenceFiles]);
  
  const handleFiles = (files) => {
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type === 'application/pdf';
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });
    
    if (evidenceFiles.length + validFiles.length > maxEvidenceFiles) {
      setErrors(prev => ({
        ...prev,
        evidence: `Maximum ${maxEvidenceFiles} files allowed`
      }));
      return;
    }
    
    setEvidenceFiles(prev => [...prev, ...validFiles]);
    if (errors.evidence) {
      setErrors(prev => ({ ...prev, evidence: null }));
    }
  };
  
  const removeFile = useCallback((index) => {
    setEvidenceFiles(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  // Drag and drop
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);
  
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [evidenceFiles]);
  
  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateField]);
  
  // Handle submit
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      evidenceFiles.forEach((file, index) => {
        formDataToSend.append(`evidence_${index}`, file);
      });
      
      formDataToSend.append('timestamp', new Date().toISOString());
      formDataToSend.append('pathway', pathway || 'default');
      
      const response = await fetch('/api/appeals', {
        method: 'POST',
        body: formDataToSend
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSubmitStatus('success');
        
        if (onSuccess) {
          onSuccess(data);
        }
      } else {
        throw new Error(data.message || 'Failed to submit appeal');
      }
    } catch (error) {
      console.error('Appeal form error:', error);
      setSubmitStatus('error');
      
      if (onError) {
        onError(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Reset form
  const handleReset = useCallback(() => {
    setFormData({
      discordUsername: '',
      discordId: '',
      email: '',
      appealType: '',
      punishmentDate: '',
      moderatorName: '',
      reason: '',
      whatHappened: '',
      whyUnfair: '',
      whatChanged: '',
      willFollow: true,
      additionalInfo: ''
    });
    setEvidenceFiles([]);
    setErrors({});
    setSubmitStatus(null);
  }, []);
  
  return (
    <div className={`appeal-form-wrapper ${className}`} style={style} {...restProps}>
      <div className={`noble-form ${pathway ? `appeal-form-${pathway}` : ''}`}>
        {showHeader && (
          <div className="noble-form-header">
            <h2 className="noble-form-title">{title}</h2>
            <p className="noble-form-subtitle">{subtitle}</p>
          </div>
        )}
        
        {submitStatus === 'success' && (
          <div className="noble-form-alert noble-form-alert-success">
            <span className="noble-form-alert-icon">✓</span>
            <div>
              <strong>Appeal submitted successfully!</strong>
              <br />
              We'll review your appeal within 3-5 business days and contact you via email.
            </div>
          </div>
        )}
        
        {submitStatus === 'error' && (
          <div className="noble-form-alert noble-form-alert-error">
            <span className="noble-form-alert-icon">✕</span>
            <div>
              <strong>Failed to submit appeal</strong>
              <br />
              Please try again or contact us at kundansmishra@gmail.com
            </div>
          </div>
        )}
        
        <div className="noble-form-alert noble-form-alert-info">
          <span className="noble-form-alert-icon">ℹ️</span>
          <div>
            <strong>Before submitting:</strong>
            <br />
            • Be honest and respectful
            <br />
            • Provide complete information
            <br />
            • Include evidence if available
            <br />
            • False appeals may result in permanent ban
          </div>
        </div>
        
        {/* Basic Information */}
        <div className="noble-form-section">
          <h3 className="noble-form-section-title">Your Information</h3>
          
          <div className="noble-form-field-inline">
            <div className="noble-form-field">
              <label htmlFor="discordUsername" className="noble-form-label noble-form-label-required">
                Discord Username
              </label>
              <input
                id="discordUsername"
                name="discordUsername"
                type="text"
                className={`noble-form-input ${errors.discordUsername ? 'error' : ''}`}
                placeholder="username#0000"
                value={formData.discordUsername}
                onChange={handleChange}
                disabled={isSubmitting}
                data-cursor="text"
              />
              {errors.discordUsername && (
                <div className="noble-form-message noble-form-message-error">
                  ⚠ {errors.discordUsername}
                </div>
              )}
            </div>
            
            <div className="noble-form-field">
              <label htmlFor="discordId" className="noble-form-label">
                Discord ID
                <span className="noble-form-label-optional">(optional)</span>
              </label>
              <input
                id="discordId"
                name="discordId"
                type="text"
                className="noble-form-input"
                placeholder="Your 18-digit ID"
                value={formData.discordId}
                onChange={handleChange}
                disabled={isSubmitting}
                data-cursor="text"
              />
            </div>
          </div>
          
          <div className="noble-form-field">
            <label htmlFor="email" className="noble-form-label noble-form-label-required">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className={`noble-form-input ${errors.email ? 'error' : ''}`}
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
              data-cursor="text"
            />
            {errors.email && (
              <div className="noble-form-message noble-form-message-error">
                ⚠ {errors.email}
              </div>
            )}
          </div>
        </div>
        
        {/* Appeal Type */}
        <div className="noble-form-section">
          <h3 className="noble-form-section-title">Appeal Type</h3>
          
          <div className="appeal-type-grid">
            {appealTypes.map(type => (
              <div
                key={type}
                className={`appeal-type-card ${formData.appealType === type ? 'selected' : ''}`}
                onClick={() => handleChange({ target: { name: 'appealType', value: type } })}
                data-cursor="hover"
              >
                <div className="appeal-type-icon">{appealTypeInfo[type].icon}</div>
                <h4 className="appeal-type-title">{appealTypeInfo[type].title}</h4>
                <p className="appeal-type-description">{appealTypeInfo[type].description}</p>
              </div>
            ))}
          </div>
          {errors.appealType && (
            <div className="noble-form-message noble-form-message-error">
              ⚠ {errors.appealType}
            </div>
          )}
        </div>
        
        {/* Punishment Details */}
        <div className="noble-form-section">
          <h3 className="noble-form-section-title">Punishment Details</h3>
          
          <div className="noble-form-field-inline">
            <div className="noble-form-field">
              <label htmlFor="punishmentDate" className="noble-form-label noble-form-label-required">
                When were you punished?
              </label>
              <input
                id="punishmentDate"
                name="punishmentDate"
                type="date"
                className={`noble-form-input ${errors.punishmentDate ? 'error' : ''}`}
                value={formData.punishmentDate}
                onChange={handleChange}
                disabled={isSubmitting}
                max={new Date().toISOString().split('T')[0]}
                data-cursor="text"
              />
              {errors.punishmentDate && (
                <div className="noble-form-message noble-form-message-error">
                  ⚠ {errors.punishmentDate}
                </div>
              )}
            </div>
            
            <div className="noble-form-field">
              <label htmlFor="moderatorName" className="noble-form-label">
                Moderator Name
                <span className="noble-form-label-optional">(if known)</span>
              </label>
              <input
                id="moderatorName"
                name="moderatorName"
                type="text"
                className="noble-form-input"
                placeholder="Moderator who issued punishment"
                value={formData.moderatorName}
                onChange={handleChange}
                disabled={isSubmitting}
                data-cursor="text"
              />
            </div>
          </div>
          
          <div className="noble-form-field">
            <label htmlFor="reason" className="noble-form-label noble-form-label-required">
              Reason Given for Punishment
            </label>
            <input
              id="reason"
              name="reason"
              type="text"
              className={`noble-form-input ${errors.reason ? 'error' : ''}`}
              placeholder="What reason was provided?"
              value={formData.reason}
              onChange={handleChange}
              disabled={isSubmitting}
              data-cursor="text"
            />
            {errors.reason && (
              <div className="noble-form-message noble-form-message-error">
                ⚠ {errors.reason}
              </div>
            )}
          </div>
        </div>
        
        {/* Your Side of the Story */}
        <div className="noble-form-section">
          <h3 className="noble-form-section-title">Your Side of the Story</h3>
          
          <div className="noble-form-field">
            <label htmlFor="whatHappened" className="noble-form-label noble-form-label-required">
              What happened? Explain the situation in detail.
            </label>
            <textarea
              id="whatHappened"
              name="whatHappened"
              className={`noble-form-textarea ${errors.whatHappened ? 'error' : ''}`}
              placeholder="Provide a detailed account of what happened from your perspective..."
              value={formData.whatHappened}
              onChange={handleChange}
              disabled={isSubmitting}
              rows={6}
              data-cursor="text"
            />
            <div className="noble-form-help-text">
              Minimum 50 characters • {formData.whatHappened.length} characters
            </div>
            {errors.whatHappened && (
              <div className="noble-form-message noble-form-message-error">
                ⚠ {errors.whatHappened}
              </div>
            )}
          </div>
          
          <div className="noble-form-field">
            <label htmlFor="whyUnfair" className="noble-form-label noble-form-label-required">
              Why do you believe this punishment was unfair or excessive?
            </label>
            <textarea
              id="whyUnfair"
              name="whyUnfair"
              className={`noble-form-textarea ${errors.whyUnfair ? 'error' : ''}`}
              placeholder="Explain why you think the punishment doesn't fit the situation..."
              value={formData.whyUnfair}
              onChange={handleChange}
              disabled={isSubmitting}
              rows={5}
              data-cursor="text"
            />
            <div className="noble-form-help-text">
              Minimum 30 characters • {formData.whyUnfair.length} characters
            </div>
            {errors.whyUnfair && (
              <div className="noble-form-message noble-form-message-error">
                ⚠ {errors.whyUnfair}
              </div>
            )}
          </div>
          
          <div className="noble-form-field">
            <label htmlFor="whatChanged" className="noble-form-label noble-form-label-required">
              What have you learned? How will you avoid this in the future?
            </label>
            <textarea
              id="whatChanged"
              name="whatChanged"
              className={`noble-form-textarea ${errors.whatChanged ? 'error' : ''}`}
              placeholder="Show us you understand what went wrong and how you'll improve..."
              value={formData.whatChanged}
              onChange={handleChange}
              disabled={isSubmitting}
              rows={5}
              data-cursor="text"
            />
            <div className="noble-form-help-text">
              Minimum 30 characters • {formData.whatChanged.length} characters
            </div>
            {errors.whatChanged && (
              <div className="noble-form-message noble-form-message-error">
                ⚠ {errors.whatChanged}
              </div>
            )}
          </div>
        </div>
        
        {/* Evidence Upload */}
        <div className="noble-form-section">
          <h3 className="noble-form-section-title">Evidence (Optional)</h3>
          <p className="noble-form-section-description">
            Upload screenshots or documents that support your appeal (Max {maxEvidenceFiles} files, 10MB each)
          </p>
          
          <div className="noble-form-file-upload">
            <input
              type="file"
              id="evidence"
              className="noble-form-file-input"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              disabled={isSubmitting}
            />
            <label
              htmlFor="evidence"
              className={`noble-form-file-label ${dragActive ? 'active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="noble-form-file-icon">📎</div>
              <div className="noble-form-file-text">
                Click to upload or drag and drop
              </div>
              <div className="noble-form-file-hint">
                PNG, JPG, PDF up to 10MB
              </div>
            </label>
            
            {evidenceFiles.length > 0 && (
              <div className="noble-form-file-preview">
                {evidenceFiles.map((file, index) => (
                  <div key={index} className="noble-form-file-item">
                    {file.type.startsWith('image/') ? (
                      <img src={URL.createObjectURL(file)} alt={file.name} />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '24px' }}>
                        📄
                      </div>
                    )}
                    <button
                      type="button"
                      className="noble-form-file-remove"
                      onClick={() => removeFile(index)}
                      data-cursor="hover"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {errors.evidence && (
              <div className="noble-form-message noble-form-message-error">
                ⚠ {errors.evidence}
              </div>
            )}
          </div>
        </div>
        
        {/* Additional Information */}
        <div className="noble-form-section">
          <h3 className="noble-form-section-title">Additional Information</h3>
          
          <div className="noble-form-field">
            <label htmlFor="additionalInfo" className="noble-form-label">
              Anything else you'd like to add?
              <span className="noble-form-label-optional">(optional)</span>
            </label>
            <textarea
              id="additionalInfo"
              name="additionalInfo"
              className="noble-form-textarea"
              placeholder="Any other relevant information..."
              value={formData.additionalInfo}
              onChange={handleChange}
              disabled={isSubmitting}
              rows={4}
              data-cursor="text"
            />
          </div>
          
          <div className="noble-form-field">
            <div className="noble-form-checkbox">
              <input
                type="checkbox"
                id="willFollow"
                name="willFollow"
                className="noble-form-checkbox-input"
                checked={formData.willFollow}
                onChange={handleChange}
                disabled={isSubmitting}
                data-cursor="hover"
              />
              <label htmlFor="willFollow" className="noble-form-checkbox-label">
                I acknowledge that if my appeal is accepted, I will follow all server rules and guidelines going forward
              </label>
            </div>
          </div>
        </div>
        
        <div className="noble-form-actions">
          <TextDimButton
            onClick={handleReset}
            disabled={isSubmitting || submitStatus === 'success'}
          >
            Reset
          </TextDimButton>
          
          <TextFlameButton
            onClick={handleSubmit}
            disabled={isSubmitting || submitStatus === 'success'}
            data-cursor="hover"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Appeal'}
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

export default AppealForm;