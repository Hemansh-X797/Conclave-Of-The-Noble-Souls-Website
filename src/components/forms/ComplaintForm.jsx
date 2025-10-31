import React, { useState, useCallback } from 'react';
import { TextFlameButton, TextDimButton } from './LuxuryButton';

/**
 * ComplaintForm Component
 * Report members for rule violations with evidence
 * 
 * @version 2.0 - The Conclave Realm
 */

const ComplaintForm = ({
  showHeader = true,
  title = 'Report a Member',
  subtitle = 'Help us maintain a safe and respectful community',
  maxEvidenceFiles = 5,
  onSuccess,
  onError,
  className = '',
  style = {},
  pathway,
  ...restProps
}) => {
  const [formData, setFormData] = useState({
    reporterUsername: '',
    reporterEmail: '',
    reportedUsername: '',
    reportedUserId: '',
    violationType: '',
    location: '',
    incidentDate: '',
    description: '',
    witnesses: '',
    previousIncidents: false,
    urgency: 'normal',
    anonymous: false
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  
  const violationTypes = {
    harassment: { label: 'Harassment/Bullying', icon: '😠', severity: 'high' },
    spam: { label: 'Spam/Flooding', icon: '📢', severity: 'low' },
    nsfw: { label: 'NSFW Content', icon: '🔞', severity: 'high' },
    hate: { label: 'Hate Speech', icon: '⚠️', severity: 'critical' },
    scam: { label: 'Scam/Phishing', icon: '🎣', severity: 'critical' },
    impersonation: { label: 'Impersonation', icon: '🎭', severity: 'high' },
    doxxing: { label: 'Doxxing/Privacy Violation', icon: '🔓', severity: 'critical' },
    raid: { label: 'Raid/Bot Abuse', icon: '🤖', severity: 'critical' },
    other: { label: 'Other Violation', icon: '📋', severity: 'normal' }
  };
  
  const validateField = useCallback((name, value) => {
    switch (name) {
      case 'reporterUsername':
        if (!formData.anonymous && !value.trim()) return 'Username is required';
        return null;
      case 'reporterEmail':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email';
        return null;
      case 'reportedUsername':
        if (!value.trim()) return 'Reported username is required';
        return null;
      case 'violationType':
        if (!value) return 'Select violation type';
        return null;
      case 'description':
        if (!value.trim()) return 'Description is required';
        if (value.length < 50) return 'Minimum 50 characters required';
        return null;
      default:
        return null;
    }
  }, [formData.anonymous]);
  
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  }, [errors]);
  
  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files).filter(f => 
      (f.type.startsWith('image/') || f.type === 'application/pdf') && f.size <= 10 * 1024 * 1024
    );
    if (evidenceFiles.length + files.length <= maxEvidenceFiles) {
      setEvidenceFiles(prev => [...prev, ...files]);
    }
  }, [evidenceFiles, maxEvidenceFiles]);
  
  const removeFile = useCallback((index) => {
    setEvidenceFiles(prev => prev.filter((_, i) => i !== index));
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
      Object.keys(formData).forEach(key => formDataToSend.append(key, formData[key]));
      evidenceFiles.forEach((file, i) => formDataToSend.append(`evidence_${i}`, file));
      formDataToSend.append('timestamp', new Date().toISOString());
      
      const response = await fetch('/api/complaints', {
        method: 'POST',
        body: formDataToSend
      });
      
      if (response.ok) {
        setSubmitStatus('success');
        if (onSuccess) onSuccess(await response.json());
      } else {
        throw new Error('Failed to submit complaint');
      }
    } catch (error) {
      setSubmitStatus('error');
      if (onError) onError(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className={`complaint-form-wrapper ${className}`} style={style} {...restProps}>
      <div className="noble-form">
        {showHeader && (
          <div className="noble-form-header">
            <h2 className="noble-form-title">{title}</h2>
            <p className="noble-form-subtitle">{subtitle}</p>
          </div>
        )}
        
        {submitStatus === 'success' && (
          <div className="noble-form-alert noble-form-alert-success">
            <span className="noble-form-alert-icon">✓</span>
            <div><strong>Report submitted successfully!</strong><br />Our moderation team will review this within 24 hours.</div>
          </div>
        )}
        
        {submitStatus === 'error' && (
          <div className="noble-form-alert noble-form-alert-error">
            <span className="noble-form-alert-icon">✕</span>
            <div><strong>Failed to submit report</strong><br />Please try again or contact us directly.</div>
          </div>
        )}
        
        <div className="noble-form-alert noble-form-alert-warning">
          <span className="noble-form-alert-icon">⚠️</span>
          <div>
            <strong>Important:</strong> False reports may result in disciplinary action. Only report genuine rule violations.
          </div>
        </div>
        
        <div className="noble-form-section">
          <h3 className="noble-form-section-title">Your Information</h3>
          
          <div className="noble-form-field">
            <div className="noble-form-checkbox">
              <input type="checkbox" id="anonymous" name="anonymous" className="noble-form-checkbox-input"
                checked={formData.anonymous} onChange={handleChange} data-cursor="hover" />
              <label htmlFor="anonymous" className="noble-form-checkbox-label">
                Submit anonymously (moderators will still see your info)
              </label>
            </div>
          </div>
          
          {!formData.anonymous && (
            <div className="noble-form-field">
              <label htmlFor="reporterUsername" className="noble-form-label noble-form-label-required">
                Your Discord Username
              </label>
              <input id="reporterUsername" name="reporterUsername" type="text"
                className={`noble-form-input ${errors.reporterUsername ? 'error' : ''}`}
                placeholder="username#0000" value={formData.reporterUsername}
                onChange={handleChange} data-cursor="text" />
              {errors.reporterUsername && (
                <div className="noble-form-message noble-form-message-error">⚠ {errors.reporterUsername}</div>
              )}
            </div>
          )}
          
          <div className="noble-form-field">
            <label htmlFor="reporterEmail" className="noble-form-label noble-form-label-required">
              Your Email
            </label>
            <input id="reporterEmail" name="reporterEmail" type="email"
              className={`noble-form-input ${errors.reporterEmail ? 'error' : ''}`}
              placeholder="your.email@example.com" value={formData.reporterEmail}
              onChange={handleChange} data-cursor="text" />
            {errors.reporterEmail && (
              <div className="noble-form-message noble-form-message-error">⚠ {errors.reporterEmail}</div>
            )}
          </div>
        </div>
        
        <div className="noble-form-section">
          <h3 className="noble-form-section-title">Reported Member</h3>
          
          <div className="noble-form-field-inline">
            <div className="noble-form-field">
              <label htmlFor="reportedUsername" className="noble-form-label noble-form-label-required">
                Reported Username
              </label>
              <input id="reportedUsername" name="reportedUsername" type="text"
                className={`noble-form-input ${errors.reportedUsername ? 'error' : ''}`}
                placeholder="username#0000" value={formData.reportedUsername}
                onChange={handleChange} data-cursor="text" />
              {errors.reportedUsername && (
                <div className="noble-form-message noble-form-message-error">⚠ {errors.reportedUsername}</div>
              )}
            </div>
            
            <div className="noble-form-field">
              <label htmlFor="reportedUserId" className="noble-form-label">
                User ID <span className="noble-form-label-optional">(if known)</span>
              </label>
              <input id="reportedUserId" name="reportedUserId" type="text"
                className="noble-form-input" placeholder="18-digit ID"
                value={formData.reportedUserId} onChange={handleChange} data-cursor="text" />
            </div>
          </div>
        </div>
        
        <div className="noble-form-section">
          <h3 className="noble-form-section-title">Violation Details</h3>
          
          <div className="noble-form-field">
            <label className="noble-form-label noble-form-label-required">Violation Type</label>
            <div className="complaint-violation-grid">
              {Object.entries(violationTypes).map(([key, type]) => (
                <div key={key}
                  className={`complaint-violation-card ${formData.violationType === key ? 'selected' : ''} severity-${type.severity}`}
                  onClick={() => handleChange({ target: { name: 'violationType', value: key } })}
                  data-cursor="hover">
                  <div className="complaint-violation-icon">{type.icon}</div>
                  <div className="complaint-violation-label">{type.label}</div>
                </div>
              ))}
            </div>
            {errors.violationType && (
              <div className="noble-form-message noble-form-message-error">⚠ {errors.violationType}</div>
            )}
          </div>
          
          <div className="noble-form-field-inline">
            <div className="noble-form-field">
              <label htmlFor="location" className="noble-form-label">Where did this occur?</label>
              <select id="location" name="location" className="noble-form-select"
                value={formData.location} onChange={handleChange} data-cursor="hover">
                <option value="">Select location</option>
                <option value="general">General Chat</option>
                <option value="gaming">Gaming Realm</option>
                <option value="lorebound">Lorebound Realm</option>
                <option value="productive">Productive Realm</option>
                <option value="news">News Realm</option>
                <option value="voice">Voice Channel</option>
                <option value="dm">Direct Messages</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="noble-form-field">
              <label htmlFor="incidentDate" className="noble-form-label">When did this occur?</label>
              <input id="incidentDate" name="incidentDate" type="date"
                className="noble-form-input" value={formData.incidentDate}
                onChange={handleChange} max={new Date().toISOString().split('T')[0]} data-cursor="text" />
            </div>
          </div>
          
          <div className="noble-form-field">
            <label htmlFor="description" className="noble-form-label noble-form-label-required">
              Detailed Description
            </label>
            <textarea id="description" name="description"
              className={`noble-form-textarea ${errors.description ? 'error' : ''}`}
              placeholder="Describe what happened in detail..."
              value={formData.description} onChange={handleChange} rows={6} data-cursor="text" />
            <div className="noble-form-help-text">
              Minimum 50 characters • {formData.description.length} characters
            </div>
            {errors.description && (
              <div className="noble-form-message noble-form-message-error">⚠ {errors.description}</div>
            )}
          </div>
          
          <div className="noble-form-field">
            <label htmlFor="witnesses" className="noble-form-label">
              Witnesses <span className="noble-form-label-optional">(if any)</span>
            </label>
            <input id="witnesses" name="witnesses" type="text" className="noble-form-input"
              placeholder="Usernames of people who witnessed this"
              value={formData.witnesses} onChange={handleChange} data-cursor="text" />
          </div>
          
          <div className="noble-form-field">
            <div className="noble-form-checkbox">
              <input type="checkbox" id="previousIncidents" name="previousIncidents"
                className="noble-form-checkbox-input" checked={formData.previousIncidents}
                onChange={handleChange} data-cursor="hover" />
              <label htmlFor="previousIncidents" className="noble-form-checkbox-label">
                This user has violated rules before
              </label>
            </div>
          </div>
        </div>
        
        <div className="noble-form-section">
          <h3 className="noble-form-section-title">Evidence</h3>
          <p className="noble-form-section-description">
            Screenshots or files that support your report (Max {maxEvidenceFiles} files)
          </p>
          
          <div className="noble-form-file-upload">
            <input type="file" id="evidence" className="noble-form-file-input"
              multiple accept="image/*,.pdf" onChange={handleFileSelect} />
            <label htmlFor="evidence" className="noble-form-file-label">
              <div className="noble-form-file-icon">📎</div>
              <div className="noble-form-file-text">Click to upload evidence</div>
              <div className="noble-form-file-hint">PNG, JPG, PDF up to 10MB</div>
            </label>
            
            {evidenceFiles.length > 0 && (
              <div className="noble-form-file-preview">
                {evidenceFiles.map((file, index) => (
                  <div key={index} className="noble-form-file-item">
                    {file.type.startsWith('image/') ? (
                      <img src={URL.createObjectURL(file)} alt={file.name} />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '24px' }}>📄</div>
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
          <div className="noble-form-field">
            <label htmlFor="urgency" className="noble-form-label">Urgency Level</label>
            <select id="urgency" name="urgency" className="noble-form-select"
              value={formData.urgency} onChange={handleChange} data-cursor="hover">
              <option value="low">Low - Non-urgent matter</option>
              <option value="normal">Normal - Standard violation</option>
              <option value="high">High - Serious violation</option>
              <option value="urgent">Urgent - Immediate threat</option>
            </select>
          </div>
        </div>
        
        <div className="noble-form-actions">
          <TextDimButton onClick={() => window.history.back()} disabled={isSubmitting}>
            Cancel
          </TextDimButton>
          <TextFlameButton onClick={handleSubmit} disabled={isSubmitting || submitStatus === 'success'} data-cursor="hover">
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
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

export default ComplaintForm;