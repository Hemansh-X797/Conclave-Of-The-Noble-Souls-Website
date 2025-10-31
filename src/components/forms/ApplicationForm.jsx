import React, { useState, useCallback, useMemo } from 'react';
import { TextFlameButton, TextDimButton } from '@/ui/LuxuryButton';

/**
 * ApplicationForm Component
 * Multi-step staff application form with enhanced UX
 * Roles: Moderator, Admin, Event Organizer, Content Creator
 * 
 * @version 2.0 - The Conclave Realm
 */

const ApplicationForm = ({
  // Configuration
  showHeader = true,
  title = 'Join The Noble Court',
  subtitle = 'Apply to become a staff member of The Conclave',
  availableRoles = ['moderator', 'admin', 'event-organizer', 'content-creator'],
  
  // Callbacks
  onSuccess,
  onError,
  onStepChange,
  
  // Customization
  className = '',
  style = {},
  pathway,
  
  ...restProps
}) => {
  // Multi-step state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  // Form data
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    fullName: '',
    discordUsername: '',
    discordId: '',
    email: '',
    age: '',
    timezone: '',
    
    // Step 2: Role & Experience
    desiredRole: '',
    secondaryRole: '',
    experienceYears: '',
    previousStaffExp: false,
    previousServers: '',
    relevantSkills: [],
    
    // Step 3: Availability & Questions
    availableHoursPerWeek: '',
    availableDays: [],
    whyJoin: '',
    strengths: '',
    handleConflict: '',
    
    // Step 4: Additional
    portfolioLink: '',
    referredBy: '',
    agreeToTerms: false,
    agreeToNDA: false
  });
  
  // UI state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [showValidation, setShowValidation] = useState(false);
  
  // Role definitions
  const roles = {
    'moderator': {
      title: 'Moderator',
      icon: '🛡️',
      description: 'Maintain order, handle reports, and ensure community guidelines are followed',
      requirements: ['Active 15+ hours/week', 'Conflict resolution skills', 'Previous moderation experience preferred']
    },
    'admin': {
      title: 'Administrator',
      icon: '👑',
      description: 'Oversee operations, manage staff, and make strategic decisions',
      requirements: ['Active 20+ hours/week', 'Leadership experience', 'Previous admin/management role required']
    },
    'event-organizer': {
      title: 'Event Organizer',
      icon: '🎉',
      description: 'Plan, coordinate, and execute community events and tournaments',
      requirements: ['Active 10+ hours/week', 'Creative and organized', 'Event management experience']
    },
    'content-creator': {
      title: 'Content Creator',
      icon: '✨',
      description: 'Create engaging content, graphics, videos, or written materials',
      requirements: ['Portfolio required', 'Creative skills', 'Content creation experience']
    }
  };
  
  // Skills options
  const skillsOptions = [
    'Moderation Tools (MEE6, Dyno, etc.)',
    'Discord Bot Development',
    'Graphic Design',
    'Video Editing',
    'Community Management',
    'Event Planning',
    'Conflict Resolution',
    'Social Media Management',
    'Content Writing',
    'Public Relations'
  ];
  
  // Days of week
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Validation rules
  const validateStep = useCallback((step) => {
    const newErrors = {};
    
    switch (step) {
      case 1: // Basic Information
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.discordUsername.trim()) newErrors.discordUsername = 'Discord username is required';
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Invalid email format';
        }
        if (!formData.age) {
          newErrors.age = 'Age is required';
        } else if (parseInt(formData.age) < 16) {
          newErrors.age = 'Must be at least 16 years old';
        } else if (parseInt(formData.age) > 100) {
          newErrors.age = 'Invalid age';
        }
        if (!formData.timezone) newErrors.timezone = 'Timezone is required';
        break;
        
      case 2: // Role & Experience
        if (!formData.desiredRole) newErrors.desiredRole = 'Please select a role';
        if (!formData.experienceYears) newErrors.experienceYears = 'Experience level is required';
        if (formData.previousStaffExp && !formData.previousServers.trim()) {
          newErrors.previousServers = 'Please provide details';
        }
        if (formData.relevantSkills.length === 0) {
          newErrors.relevantSkills = 'Select at least one skill';
        }
        break;
        
      case 3: // Availability & Questions
        if (!formData.availableHoursPerWeek) {
          newErrors.availableHoursPerWeek = 'Please select availability';
        }
        if (formData.availableDays.length === 0) {
          newErrors.availableDays = 'Select at least one day';
        }
        if (!formData.whyJoin.trim()) {
          newErrors.whyJoin = 'This field is required';
        } else if (formData.whyJoin.trim().length < 50) {
          newErrors.whyJoin = 'Please provide at least 50 characters';
        }
        if (!formData.strengths.trim()) {
          newErrors.strengths = 'This field is required';
        } else if (formData.strengths.trim().length < 30) {
          newErrors.strengths = 'Please provide at least 30 characters';
        }
        if (!formData.handleConflict.trim()) {
          newErrors.handleConflict = 'This field is required';
        } else if (formData.handleConflict.trim().length < 50) {
          newErrors.handleConflict = 'Please provide at least 50 characters';
        }
        break;
        
      case 4: // Additional
        if (formData.desiredRole === 'content-creator' && !formData.portfolioLink.trim()) {
          newErrors.portfolioLink = 'Portfolio is required for Content Creator role';
        }
        if (!formData.agreeToTerms) {
          newErrors.agreeToTerms = 'You must agree to the terms';
        }
        if (!formData.agreeToNDA) {
          newErrors.agreeToNDA = 'You must agree to the NDA';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);
  
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
  
  // Handle multi-select (skills, days)
  const handleMultiSelect = useCallback((name, value) => {
    setFormData(prev => {
      const current = prev[name];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      
      return { ...prev, [name]: updated };
    });
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);
  
  // Navigation
  const nextStep = useCallback(() => {
    setShowValidation(true);
    
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(prev => prev + 1);
        setShowValidation(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        if (onStepChange) {
          onStepChange(currentStep + 1);
        }
      }
    }
  }, [currentStep, validateStep, onStepChange]);
  
  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setShowValidation(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      if (onStepChange) {
        onStepChange(currentStep - 1);
      }
    }
  }, [currentStep, onStepChange]);
  
  // Submit
  const handleSubmit = async () => {
    setShowValidation(true);
    
    if (!validateStep(currentStep)) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString(),
          pathway: pathway || 'default'
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSubmitStatus('success');
        
        if (onSuccess) {
          onSuccess(data);
        }
      } else {
        throw new Error(data.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Application form error:', error);
      setSubmitStatus('error');
      
      if (onError) {
        onError(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Progress calculation
  const progress = useMemo(() => {
    return (currentStep / totalSteps) * 100;
  }, [currentStep]);
  
  // Render step indicator
  const renderStepIndicator = () => (
    <div className="application-step-indicator">
      <div className="application-progress-bar">
        <div 
          className="application-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="application-steps">
        {[1, 2, 3, 4].map(step => (
          <div
            key={step}
            className={`application-step ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
          >
            <div className="application-step-circle">
              {currentStep > step ? '✓' : step}
            </div>
            <div className="application-step-label">
              {step === 1 && 'Basic Info'}
              {step === 2 && 'Experience'}
              {step === 3 && 'Questions'}
              {step === 4 && 'Review'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
  // Render Step 1: Basic Information
  const renderStep1 = () => (
    <div className="noble-form-section">
      <h3 className="noble-form-section-title">Basic Information</h3>
      <p className="noble-form-section-description">
        Tell us about yourself
      </p>
      
      <div className="noble-form-field">
        <label htmlFor="fullName" className="noble-form-label noble-form-label-required">
          Full Name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          className={`noble-form-input ${showValidation && errors.fullName ? 'error' : ''}`}
          placeholder="Your real name"
          value={formData.fullName}
          onChange={handleChange}
          data-cursor="text"
        />
        {showValidation && errors.fullName && (
          <div className="noble-form-message noble-form-message-error">
            ⚠ {errors.fullName}
          </div>
        )}
      </div>
      
      <div className="noble-form-field-inline">
        <div className="noble-form-field">
          <label htmlFor="discordUsername" className="noble-form-label noble-form-label-required">
            Discord Username
          </label>
          <input
            id="discordUsername"
            name="discordUsername"
            type="text"
            className={`noble-form-input ${showValidation && errors.discordUsername ? 'error' : ''}`}
            placeholder="username#0000"
            value={formData.discordUsername}
            onChange={handleChange}
            data-cursor="text"
          />
          {showValidation && errors.discordUsername && (
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
          className={`noble-form-input ${showValidation && errors.email ? 'error' : ''}`}
          placeholder="your.email@example.com"
          value={formData.email}
          onChange={handleChange}
          data-cursor="text"
        />
        {showValidation && errors.email && (
          <div className="noble-form-message noble-form-message-error">
            ⚠ {errors.email}
          </div>
        )}
      </div>
      
      <div className="noble-form-field-inline">
        <div className="noble-form-field">
          <label htmlFor="age" className="noble-form-label noble-form-label-required">
            Age
          </label>
          <input
            id="age"
            name="age"
            type="number"
            min="16"
            max="100"
            className={`noble-form-input ${showValidation && errors.age ? 'error' : ''}`}
            placeholder="18"
            value={formData.age}
            onChange={handleChange}
            data-cursor="text"
          />
          {showValidation && errors.age && (
            <div className="noble-form-message noble-form-message-error">
              ⚠ {errors.age}
            </div>
          )}
        </div>
        
        <div className="noble-form-field">
          <label htmlFor="timezone" className="noble-form-label noble-form-label-required">
            Timezone
          </label>
          <select
            id="timezone"
            name="timezone"
            className={`noble-form-select ${showValidation && errors.timezone ? 'error' : ''}`}
            value={formData.timezone}
            onChange={handleChange}
            data-cursor="hover"
          >
            <option value="">Select timezone</option>
            <option value="PST">PST (UTC-8)</option>
            <option value="MST">MST (UTC-7)</option>
            <option value="CST">CST (UTC-6)</option>
            <option value="EST">EST (UTC-5)</option>
            <option value="GMT">GMT (UTC+0)</option>
            <option value="CET">CET (UTC+1)</option>
            <option value="IST">IST (UTC+5:30)</option>
            <option value="JST">JST (UTC+9)</option>
            <option value="AEST">AEST (UTC+10)</option>
          </select>
          {showValidation && errors.timezone && (
            <div className="noble-form-message noble-form-message-error">
              ⚠ {errors.timezone}
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
  // Render Step 2: Role & Experience
  const renderStep2 = () => (
    <div className="noble-form-section">
      <h3 className="noble-form-section-title">Role & Experience</h3>
      <p className="noble-form-section-description">
        Choose your desired role and tell us about your experience
      </p>
      
      <div className="noble-form-field">
        <label className="noble-form-label noble-form-label-required">
          Desired Role
        </label>
        <div className="application-role-grid">
          {Object.entries(roles).filter(([key]) => availableRoles.includes(key)).map(([key, role]) => (
            <div
              key={key}
              className={`application-role-card ${formData.desiredRole === key ? 'selected' : ''}`}
              onClick={() => handleChange({ target: { name: 'desiredRole', value: key } })}
              data-cursor="hover"
            >
              <div className="application-role-icon">{role.icon}</div>
              <h4 className="application-role-title">{role.title}</h4>
              <p className="application-role-description">{role.description}</p>
              <ul className="application-role-requirements">
                {role.requirements.map((req, idx) => (
                  <li key={idx}>• {req}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {showValidation && errors.desiredRole && (
          <div className="noble-form-message noble-form-message-error">
            ⚠ {errors.desiredRole}
          </div>
        )}
      </div>
      
      <div className="noble-form-field">
        <label htmlFor="secondaryRole" className="noble-form-label">
          Secondary Role Interest
          <span className="noble-form-label-optional">(optional)</span>
        </label>
        <select
          id="secondaryRole"
          name="secondaryRole"
          className="noble-form-select"
          value={formData.secondaryRole}
          onChange={handleChange}
          data-cursor="hover"
        >
          <option value="">None</option>
          {Object.entries(roles).filter(([key]) => key !== formData.desiredRole).map(([key, role]) => (
            <option key={key} value={key}>{role.title}</option>
          ))}
        </select>
      </div>
      
      <div className="noble-form-field">
        <label htmlFor="experienceYears" className="noble-form-label noble-form-label-required">
          Experience Level
        </label>
        <select
          id="experienceYears"
          name="experienceYears"
          className={`noble-form-select ${showValidation && errors.experienceYears ? 'error' : ''}`}
          value={formData.experienceYears}
          onChange={handleChange}
          data-cursor="hover"
        >
          <option value="">Select experience</option>
          <option value="none">No experience</option>
          <option value="beginner">Beginner (Less than 1 year)</option>
          <option value="intermediate">Intermediate (1-3 years)</option>
          <option value="advanced">Advanced (3-5 years)</option>
          <option value="expert">Expert (5+ years)</option>
        </select>
        {showValidation && errors.experienceYears && (
          <div className="noble-form-message noble-form-message-error">
            ⚠ {errors.experienceYears}
          </div>
        )}
      </div>
      
      <div className="noble-form-field">
        <div className="noble-form-checkbox">
          <input
            type="checkbox"
            id="previousStaffExp"
            name="previousStaffExp"
            className="noble-form-checkbox-input"
            checked={formData.previousStaffExp}
            onChange={handleChange}
            data-cursor="hover"
          />
          <label htmlFor="previousStaffExp" className="noble-form-checkbox-label">
            I have previous staff experience on other Discord servers
          </label>
        </div>
      </div>
      
      {formData.previousStaffExp && (
        <div className="noble-form-field">
          <label htmlFor="previousServers" className="noble-form-label noble-form-label-required">
            Previous Server Experience
          </label>
          <textarea
            id="previousServers"
            name="previousServers"
            className={`noble-form-textarea ${showValidation && errors.previousServers ? 'error' : ''}`}
            placeholder="List servers you've staffed, your roles, and duration..."
            value={formData.previousServers}
            onChange={handleChange}
            rows={4}
            data-cursor="text"
          />
          {showValidation && errors.previousServers && (
            <div className="noble-form-message noble-form-message-error">
              ⚠ {errors.previousServers}
            </div>
          )}
        </div>
      )}
      
      <div className="noble-form-field">
        <label className="noble-form-label noble-form-label-required">
          Relevant Skills (Select all that apply)
        </label>
        <div className="application-skills-grid">
          {skillsOptions.map(skill => (
            <div
              key={skill}
              className={`application-skill-chip ${formData.relevantSkills.includes(skill) ? 'selected' : ''}`}
              onClick={() => handleMultiSelect('relevantSkills', skill)}
              data-cursor="hover"
            >
              {skill}
            </div>
          ))}
        </div>
        {showValidation && errors.relevantSkills && (
          <div className="noble-form-message noble-form-message-error">
            ⚠ {errors.relevantSkills}
          </div>
        )}
      </div>
    </div>
  );
  
  // Render Step 3: Availability & Questions
  const renderStep3 = () => (
    <div className="noble-form-section">
      <h3 className="noble-form-section-title">Availability & Questions</h3>
      <p className="noble-form-section-description">
        Help us understand your availability and motivations
      </p>
      
      <div className="noble-form-field">
        <label htmlFor="availableHoursPerWeek" className="noble-form-label noble-form-label-required">
          Hours Available Per Week
        </label>
        <select
          id="availableHoursPerWeek"
          name="availableHoursPerWeek"
          className={`noble-form-select ${showValidation && errors.availableHoursPerWeek ? 'error' : ''}`}
          value={formData.availableHoursPerWeek}
          onChange={handleChange}
          data-cursor="hover"
        >
          <option value="">Select hours</option>
          <option value="5-10">5-10 hours</option>
          <option value="10-15">10-15 hours</option>
          <option value="15-20">15-20 hours</option>
          <option value="20-30">20-30 hours</option>
          <option value="30+">30+ hours</option>
        </select>
        {showValidation && errors.availableHoursPerWeek && (
          <div className="noble-form-message noble-form-message-error">
            ⚠ {errors.availableHoursPerWeek}
          </div>
        )}
      </div>
      
      <div className="noble-form-field">
        <label className="noble-form-label noble-form-label-required">
          Available Days
        </label>
        <div className="application-days-grid">
          {daysOfWeek.map(day => (
            <div
              key={day}
              className={`application-day-chip ${formData.availableDays.includes(day) ? 'selected' : ''}`}
              onClick={() => handleMultiSelect('availableDays', day)}
              data-cursor="hover"
            >
              {day.substring(0, 3)}
            </div>
          ))}
        </div>
        {showValidation && errors.availableDays && (
          <div className="noble-form-message noble-form-message-error">
            ⚠ {errors.availableDays}
          </div>
        )}
      </div>
      
      <div className="noble-form-field">
        <label htmlFor="whyJoin" className="noble-form-label noble-form-label-required">
          Why do you want to join The Conclave staff team?
        </label>
        <textarea
          id="whyJoin"
          name="whyJoin"
          className={`noble-form-textarea ${showValidation && errors.whyJoin ? 'error' : ''}`}
          placeholder="Share your motivations and what you hope to contribute..."
          value={formData.whyJoin}
          onChange={handleChange}
          rows={5}
          data-cursor="text"
        />
        <div className="noble-form-help-text">
          Minimum 50 characters • {formData.whyJoin.length} characters
        </div>
        {showValidation && errors.whyJoin && (
          <div className="noble-form-message noble-form-message-error">
            ⚠ {errors.whyJoin}
          </div>
        )}
      </div>
      
      <div className="noble-form-field">
        <label htmlFor="strengths" className="noble-form-label noble-form-label-required">
          What are your greatest strengths as a potential staff member?
        </label>
        <textarea
          id="strengths"
          name="strengths"
          className={`noble-form-textarea ${showValidation && errors.strengths ? 'error' : ''}`}
          placeholder="Describe your key strengths..."
          value={formData.strengths}
          onChange={handleChange}
          rows={4}
          data-cursor="text"
        />
        <div className="noble-form-help-text">
          Minimum 30 characters • {formData.strengths.length} characters
        </div>
        {showValidation && errors.strengths && (
          <div className="noble-form-message noble-form-message-error">
            ⚠ {errors.strengths}
          </div>
        )}
      </div>
      
      <div className="noble-form-field">
        <label htmlFor="handleConflict" className="noble-form-label noble-form-label-required">
          How would you handle a conflict between two members?
        </label>
        <textarea
          id="handleConflict"
          name="handleConflict"
          className={`noble-form-textarea ${showValidation && errors.handleConflict ? 'error' : ''}`}
          placeholder="Describe your approach to conflict resolution..."
          value={formData.handleConflict}
          onChange={handleChange}
          rows={5}
          data-cursor="text"
        />
        <div className="noble-form-help-text">
          Minimum 50 characters • {formData.handleConflict.length} characters
        </div>
        {showValidation && errors.handleConflict && (
          <div className="noble-form-message noble-form-message-error">
            ⚠ {errors.handleConflict}
          </div>
        )}
      </div>
    </div>
  );
  
  // Render Step 4: Additional & Review
  const renderStep4 = () => (
    <div className="noble-form-section">
      <h3 className="noble-form-section-title">Final Details</h3>
      <p className="noble-form-section-description">
        Review and complete your application
      </p>
      
      <div className="noble-form-field">
        <label htmlFor="portfolioLink" className={`noble-form-label ${formData.desiredRole === 'content-creator' ? 'noble-form-label-required' : ''}`}>
          Portfolio / Work Samples
          {formData.desiredRole !== 'content-creator' && (
            <span className="noble-form-label-optional">(optional)</span>
          )}
        </label>
        <input
          id="portfolioLink"
          name="portfolioLink"
          type="url"
          className={`noble-form-input ${showValidation && errors.portfolioLink ? 'error' : ''}`}
          placeholder="https://your-portfolio.com"
          value={formData.portfolioLink}
          onChange={handleChange}
          data-cursor="text"
        />
        <div className="noble-form-help-text">
          Link to portfolio, GitHub, Behance, or previous work examples
        </div>
        {showValidation && errors.portfolioLink && (
          <div className="noble-form-message noble-form-message-error">
            ⚠ {errors.portfolioLink}
          </div>
        )}
      </div>
      
      <div className="noble-form-field">
        <label htmlFor="referredBy" className="noble-form-label">
          Referred By
          <span className="noble-form-label-optional">(optional)</span>
        </label>
        <input
          id="referredBy"
          name="referredBy"
          type="text"
          className="noble-form-input"
          placeholder="Discord username of who referred you"
          value={formData.referredBy}
          onChange={handleChange}
          data-cursor="text"
        />
      </div>
      
      <div className="application-review-summary">
        <h4>Application Summary</h4>
        <div className="application-review-grid">
          <div className="application-review-item">
            <span className="application-review-label">Experience:</span>
            <span className="application-review-value">
              {formData.experienceYears || 'Not specified'}
            </span>
          </div>
          <div className="application-review-item">
            <span className="application-review-label">Availability:</span>
            <span className="application-review-value">
              {formData.availableHoursPerWeek || 'Not specified'} per week
            </span>
          </div>
          <div className="application-review-item">
            <span className="application-review-label">Skills:</span>
            <span className="application-review-value">
              {formData.relevantSkills.length} selected
            </span>
          </div>
        </div>
      </div>
      
      <div className="noble-form-field">
        <div className={`noble-form-checkbox ${showValidation && errors.agreeToTerms ? 'error' : ''}`}>
          <input
            type="checkbox"
            id="agreeToTerms"
            name="agreeToTerms"
            className="noble-form-checkbox-input"
            checked={formData.agreeToTerms}
            onChange={handleChange}
            data-cursor="hover"
          />
          <label htmlFor="agreeToTerms" className="noble-form-checkbox-label">
            I agree to follow The Conclave's staff guidelines and terms of service
          </label>
        </div>
        {showValidation && errors.agreeToTerms && (
          <div className="noble-form-message noble-form-message-error">
            ⚠ {errors.agreeToTerms}
          </div>
        )}
      </div>
      
      <div className="noble-form-field">
        <div className={`noble-form-checkbox ${showValidation && errors.agreeToNDA ? 'error' : ''}`}>
          <input
            type="checkbox"
            id="agreeToNDA"
            name="agreeToNDA"
            className="noble-form-checkbox-input"
            checked={formData.agreeToNDA}
            onChange={handleChange}
            data-cursor="hover"
          />
          <label htmlFor="agreeToNDA" className="noble-form-checkbox-label">
            I agree to maintain confidentiality of staff discussions and sensitive information (NDA)
          </label>
        </div>
        {showValidation && errors.agreeToNDA && (
          <div className="noble-form-message noble-form-message-error">
            ⚠ {errors.agreeToNDA}
          </div>
        )}
      </div>
      
      {submitStatus === 'success' && (
        <div className="noble-form-alert noble-form-alert-success">
          <span className="noble-form-alert-icon">✓</span>
          <div>
            <strong>Application submitted successfully!</strong>
            <br />
            We'll review your application and contact you within 3-5 business days.
          </div>
        </div>
      )}
      
      {submitStatus === 'error' && (
        <div className="noble-form-alert noble-form-alert-error">
          <span className="noble-form-alert-icon">✕</span>
          <div>
            <strong>Failed to submit application</strong>
            <br />
            Please try again or contact us at kundansmishra@gmail.com
          </div>
        </div>
      )}
    </div>
  );
  
  // Main render
  return (
    <div className={`application-form-wrapper ${className}`} style={style} {...restProps}>
      <div className={`noble-form noble-form-wide ${pathway ? `application-form-${pathway}` : ''}`}>
        {showHeader && (
          <div className="noble-form-header">
            <h2 className="noble-form-title">{title}</h2>
            <p className="noble-form-subtitle">{subtitle}</p>
          </div>
        )}
        
        {renderStepIndicator()}
        
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        
        <div className="noble-form-actions noble-form-actions-spaced">
          <TextDimButton
            onClick={prevStep}
            disabled={currentStep === 1 || isSubmitting}
          >
            ← Previous
          </TextDimButton>
          
          {currentStep < totalSteps ? (
            <TextFlameButton
              onClick={nextStep}
              data-cursor="hover"
            >
              Next →
            </TextFlameButton>
          ) : (
            <TextFlameButton
              onClick={handleSubmit}
              disabled={isSubmitting || submitStatus === 'success'}
              data-cursor="hover"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </TextFlameButton>
          )}
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

export default ApplicationForm;