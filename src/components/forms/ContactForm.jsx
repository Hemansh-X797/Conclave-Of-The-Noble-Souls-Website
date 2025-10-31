import React, { useState, useCallback } from 'react';
import { TextFlameButton, TextDimButton } from '@/ui/LuxuryButton';

/**
 * ContactForm Component
 * Sends messages to email (kundansmishra@gmail.com) and Discord (darkpower797)
 * 
 * 
 * @version 2.0 - The Conclave Realm
 * 
 * BACKEND API ROUTE NEEDED: /api/contact
 * POST request with: { name, email, subject, message, discordUsername, urgency, timestamp, pathway }
 */

const ContactForm = ({
  // Display Options
  showHeader = true,
  title = 'Contact The Conclave',
  subtitle = 'Reach out to our noble court with your inquiries',
  
  // Form Configuration
  requireSubject = true,
  maxMessageLength = 2000,
  
  // Callbacks
  onSuccess,
  onError,
  
  // Customization
  className = '',
  style = {},
  pathway, // 'gaming', 'lorebound', 'productive', 'news'
  
  ...restProps
}) => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    discordUsername: '',
    urgency: 'normal'
  });
  
  // UI state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [characterCount, setCharacterCount] = useState(0);
  
  // Validation
  const validateField = useCallback((name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.length < 2) return 'Name must be at least 2 characters';
        if (value.length > 100) return 'Name is too long';
        return null;
        
      case 'email':
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Invalid email format';
        return null;
        
      case 'subject':
        if (requireSubject && !value.trim()) return 'Subject is required';
        if (value.length > 200) return 'Subject is too long';
        return null;
        
      case 'message':
        if (!value.trim()) return 'Message is required';
        if (value.length < 10) return 'Message must be at least 10 characters';
        if (value.length > maxMessageLength) return `Message exceeds ${maxMessageLength} characters`;
        return null;
        
      case 'discordUsername':
        if (value && value.length > 37) return 'Discord username is too long';
        return null;
        
      default:
        return null;
    }
  }, [requireSubject, maxMessageLength]);
  
  // Handle input change
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    
    if (name === 'message') {
      setCharacterCount(value.length);
    }
    
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [errors, validateField]);
  
  // Validate all fields
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
    setSubmitStatus(null);
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString(),
          pathway: pathway || 'default',
          // Target email and Discord
          targetEmail: 'kundansmishra@gmail.com',
          targetDiscord: 'darkpower797'
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSubmitStatus('success');
        
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          discordUsername: '',
          urgency: 'normal'
        });
        setCharacterCount(0);
        setErrors({});
        
        if (onSuccess) {
          onSuccess(data);
        }
      } else {
        throw new Error(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitStatus('error');
      
      if (onError) {
        onError(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle reset
  const handleReset = useCallback(() => {
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
      discordUsername: '',
      urgency: 'normal'
    });
    setErrors({});
    setSubmitStatus(null);
    setCharacterCount(0);
  }, []);
  
  const getPathwayClass = () => {
    if (!pathway) return '';
    return `contact-form-${pathway}`;
  };
  
  return (
    <div className={`contact-form-wrapper ${className}`} style={style} {...restProps}>
      <div className={`noble-form ${getPathwayClass()}`}>
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
              <strong>Message sent successfully!</strong>
              <br />
              We'll respond to your inquiry soon via email and Discord.
            </div>
          </div>
        )}
        
        {submitStatus === 'error' && (
          <div className="noble-form-alert noble-form-alert-error">
            <span className="noble-form-alert-icon">✕</span>
            <div>
              <strong>Failed to send message</strong>
              <br />
              Please try again or contact us directly at kundansmishra@gmail.com
            </div>
          </div>
        )}
        
        <div className="noble-form-field">
          <label htmlFor="contact-name" className="noble-form-label noble-form-label-required">
            Your Name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            className={`noble-form-input ${errors.name ? 'error' : ''}`}
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            disabled={isSubmitting}
            data-cursor="text"
          />
          {errors.name && (
            <div className="noble-form-message noble-form-message-error">
              ⚠ {errors.name}
            </div>
          )}
        </div>
        
        <div className="noble-form-field">
          <label htmlFor="contact-email" className="noble-form-label noble-form-label-required">
            Email Address
          </label>
          <input
            id="contact-email"
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
        
        <div className="noble-form-field">
          <label htmlFor="contact-discord" className="noble-form-label">
            Discord Username
            <span className="noble-form-label-optional">(optional)</span>
          </label>
          <input
            id="contact-discord"
            name="discordUsername"
            type="text"
            className={`noble-form-input ${errors.discordUsername ? 'error' : ''}`}
            placeholder="username#0000 or @username"
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
          <div className="noble-form-help-text">
            💡 Provide your Discord username for faster responses
          </div>
        </div>
        
        {requireSubject && (
          <div className="noble-form-field">
            <label htmlFor="contact-subject" className="noble-form-label noble-form-label-required">
              Subject
            </label>
            <input
              id="contact-subject"
              name="subject"
              type="text"
              className={`noble-form-input ${errors.subject ? 'error' : ''}`}
              placeholder="What is this regarding?"
              value={formData.subject}
              onChange={handleChange}
              disabled={isSubmitting}
              data-cursor="text"
            />
            {errors.subject && (
              <div className="noble-form-message noble-form-message-error">
                ⚠ {errors.subject}
              </div>
            )}
          </div>
        )}
        
        <div className="noble-form-field">
          <label htmlFor="contact-urgency" className="noble-form-label">
            Urgency Level
          </label>
          <select
            id="contact-urgency"
            name="urgency"
            className="noble-form-select"
            value={formData.urgency}
            onChange={handleChange}
            disabled={isSubmitting}
            data-cursor="hover"
          >
            <option value="low">Low - General inquiry</option>
            <option value="normal">Normal - Standard request</option>
            <option value="high">High - Important matter</option>
            <option value="urgent">Urgent - Requires immediate attention</option>
          </select>
        </div>
        
        <div className="noble-form-field">
          <label htmlFor="contact-message" className="noble-form-label noble-form-label-required">
            Your Message
          </label>
          <textarea
            id="contact-message"
            name="message"
            className={`noble-form-textarea ${errors.message ? 'error' : ''}`}
            placeholder="Tell us what's on your mind..."
            value={formData.message}
            onChange={handleChange}
            disabled={isSubmitting}
            rows={6}
            data-cursor="text"
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
            {errors.message ? (
              <div className="noble-form-message noble-form-message-error" style={{ margin: 0 }}>
                ⚠ {errors.message}
              </div>
            ) : (
              <div className="noble-form-help-text" style={{ margin: 0 }}>
                Minimum 10 characters
              </div>
            )}
            <div className={`noble-form-help-text ${characterCount > maxMessageLength ? 'noble-form-message-error' : ''}`} style={{ margin: 0 }}>
              {characterCount} / {maxMessageLength}
            </div>
          </div>
        </div>
        
        <div className="noble-form-actions">
          <TextDimButton
            onClick={handleReset}
            disabled={isSubmitting}
          >
            Reset
          </TextDimButton>
          
          <TextFlameButton
            onClick={handleSubmit}
            disabled={isSubmitting}
            data-cursor="hover"
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
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

export default ContactForm;