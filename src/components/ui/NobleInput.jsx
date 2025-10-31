import React, { useState, useRef, useEffect, useCallback, forwardRef } from 'react';
import '@/styles/inputs.css';

const NobleInput = forwardRef(({ 
  type = 'text',
  pathway = 'default',
  size = 'md',
  label,
  placeholder,
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  error,
  success,
  warning,
  helperText,
  required = false,
  disabled = false,
  readOnly = false,
  loading = false,
  icon,
  iconPosition = 'left',
  maxLength,
  rows = 4,
  autoResize = false,
  options = [],
  accept,
  multiple = false,
  showPasswordToggle = true,
  showStrengthMeter = false,
  showCharacterCount = false,
  showClearButton = false,
  floatingLabel = false,
  mask,
  tags = [],
  onTagsChange,
  autocompleteOptions = [],
  onFileChange,
  maxFiles = 5,
  maxFileSize = 5242880,
  previewFiles = true,
  min,
  max,
  step,
  className = '',
  inputClassName = '',
  containerClassName = '',
  style = {},
  ...props
}, ref) => {
  const [internalValue, setInternalValue] = useState(value || defaultValue || '');
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [internalTags, setInternalTags] = useState(tags);
  const [tagInput, setTagInput] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteHighlight, setAutocompleteHighlight] = useState(0);
  const [filePreviews, setFilePreviews] = useState([]);
  
  const internalRef = useRef(null);
  const inputRef = ref || internalRef;
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  const isControlled = value !== undefined;

  useEffect(() => {
    if (isControlled) {
      setInternalValue(value || '');
    }
  }, [value, isControlled]);

  useEffect(() => {
    setInternalTags(tags);
  }, [tags]);

  useEffect(() => {
    if (autoResize && textareaRef.current && type === 'textarea') {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [internalValue, autoResize, type]);

  useEffect(() => {
    if (type === 'password' && showStrengthMeter) {
      calculatePasswordStrength(internalValue);
    }
  }, [internalValue, type, showStrengthMeter]);

  const calculatePasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength('');
      return;
    }
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) setPasswordStrength('weak');
    else if (strength <= 4) setPasswordStrength('medium');
    else setPasswordStrength('strong');
  };

  const applyMask = useCallback((value, maskPattern) => {
    if (!maskPattern) return value;
    
    const cleaned = value.replace(/\D/g, '');
    
    if (maskPattern === 'phone') {
      const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
      if (match) {
        return !match[2] ? match[1] : `(${match[1]}) ${match[2]}${match[3] ? `-${match[3]}` : ''}`;
      }
    }
    
    if (maskPattern === 'date') {
      const match = cleaned.match(/^(\d{0,2})(\d{0,2})(\d{0,4})$/);
      if (match) {
        return !match[2] ? match[1] : `${match[1]}/${match[2]}${match[3] ? `/${match[3]}` : ''}`;
      }
    }
    
    if (maskPattern === 'credit-card') {
      return cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    }
    
    return value;
  }, []);

  const handleChange = (e) => {
    let newValue = e.target.value;
    
    if (mask) {
      newValue = applyMask(newValue, mask);
    }
    
    if (maxLength && newValue.length > maxLength) {
      newValue = newValue.slice(0, maxLength);
    }
    
    if (!isControlled) {
      setInternalValue(newValue);
    }
    
    onChange?.(e);
  };

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    setShowAutocomplete(false);
    onBlur?.(e);
  };

  const handleClear = () => {
    const event = { target: { value: '' } };
    if (!isControlled) {
      setInternalValue('');
    }
    onChange?.(event);
    inputRef.current?.focus();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    const validFiles = selectedFiles.filter(file => {
      if (maxFileSize && file.size > maxFileSize) {
        console.warn(`File ${file.name} exceeds size limit`);
        return false;
      }
      return true;
    }).slice(0, maxFiles);
    
    setFiles(validFiles);
    
    if (previewFiles) {
      const previews = await Promise.all(
        validFiles.map(file => {
          return new Promise((resolve) => {
            if (file.type.startsWith('image/')) {
              const reader = new FileReader();
              reader.onload = (e) => resolve({ file, preview: e.target.result, type: 'image' });
              reader.readAsDataURL(file);
            } else {
              resolve({ file, preview: null, type: 'file' });
            }
          });
        })
      );
      setFilePreviews(previews);
    }
    
    onFileChange?.(validFiles);
    
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const mockEvent = { target: { files: droppedFiles } };
    handleFileChange(mockEvent);
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = filePreviews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setFilePreviews(newPreviews);
    onFileChange?.(newFiles);
  };

  const handleTagInput = (e) => {
    setTagInput(e.target.value);
    if (autocompleteOptions.length > 0) {
      setShowAutocomplete(true);
    }
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput.trim());
    } else if (e.key === 'Backspace' && !tagInput && internalTags.length > 0) {
      removeTag(internalTags.length - 1);
    } else if (e.key === 'ArrowDown' && showAutocomplete) {
      e.preventDefault();
      setAutocompleteHighlight(prev => 
        Math.min(prev + 1, filteredAutocomplete.length - 1)
      );
    } else if (e.key === 'ArrowUp' && showAutocomplete) {
      e.preventDefault();
      setAutocompleteHighlight(prev => Math.max(prev - 1, 0));
    }
  };

  const addTag = (tag) => {
    if (!internalTags.includes(tag)) {
      const newTags = [...internalTags, tag];
      setInternalTags(newTags);
      onTagsChange?.(newTags);
    }
    setTagInput('');
    setShowAutocomplete(false);
  };

  const removeTag = (index) => {
    const newTags = internalTags.filter((_, i) => i !== index);
    setInternalTags(newTags);
    onTagsChange?.(newTags);
  };

  const filteredAutocomplete = autocompleteOptions.filter(option =>
    option.toLowerCase().includes(tagInput.toLowerCase()) &&
    !internalTags.includes(option)
  );

  const getStateClass = () => {
    if (error) return 'error';
    if (success) return 'success';
    if (warning) return 'warning';
    return '';
  };

  const hasValue = internalValue?.toString().length > 0;
  const showFloatingLabel = floatingLabel && (isFocused || hasValue);

  const containerClasses = [
    'noble-input-container',
    `${pathway}-realm`,
    `size-${size}`,
    getStateClass(),
    disabled && 'disabled',
    loading && 'noble-input-loading',
    containerClassName
  ].filter(Boolean).join(' ');

  const wrapperClasses = [
    'noble-input-wrapper',
    icon && iconPosition === 'left' && 'has-icon-left',
    icon && iconPosition === 'right' && 'has-icon-right',
  ].filter(Boolean).join(' ');

  const inputClasses = [
    type === 'textarea' ? 'noble-textarea' : 'noble-input',
    type === 'select' && 'noble-select',
    hasValue && 'has-value',
    mask && `noble-input-masked ${mask}`,
    inputClassName
  ].filter(Boolean).join(' ');

  const renderPasswordToggle = () => {
    if (type !== 'password' || !showPasswordToggle) return null;
    
    return (
      <button
        type="button"
        className="noble-password-toggle"
        onClick={togglePasswordVisibility}
        onMouseDown={(e) => e.preventDefault()}
        data-cursor="hover"
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? '👁️' : '👁️‍🗨️'}
      </button>
    );
  };

  const renderPasswordStrength = () => {
    if (type !== 'password' || !showStrengthMeter || !internalValue) return null;
    
    return (
      <div className="noble-password-strength">
        <div className={`noble-password-strength-bar ${passwordStrength}`} />
        <div className={`noble-password-strength-label ${passwordStrength}`}>
          {passwordStrength.toUpperCase()}
        </div>
      </div>
    );
  };

  const renderClearButton = () => {
    if (!showClearButton || !hasValue || disabled || readOnly) return null;
    
    return (
      <button
        type="button"
        className="noble-search-clear"
        onClick={handleClear}
        onMouseDown={(e) => e.preventDefault()}
        data-cursor="hover"
        aria-label="Clear input"
      >
        ✕
      </button>
    );
  };

  const renderCharacterCount = () => {
    if (!showCharacterCount || !maxLength) return null;
    
    const count = internalValue?.toString().length || 0;
    const percentage = (count / maxLength) * 100;
    
    return (
      <div className={`noble-input-counter ${percentage >= 90 ? 'approaching-limit' : ''} ${percentage >= 100 ? 'at-limit' : ''}`}>
        {count} / {maxLength}
      </div>
    );
  };

  const renderFileUpload = () => {
    return (
      <div
        className={`noble-file-upload ${isDragOver ? 'drag-over' : ''} ${files.length > 0 ? 'has-file' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        data-cursor="hover"
      >
        <input
          ref={fileInputRef}
          type="file"
          className="noble-file-upload-input"
          onChange={handleFileChange}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          {...props}
        />
        <div className="noble-file-upload-icon">📁</div>
        <div className="noble-file-upload-text">
          {files.length > 0 
            ? `${files.length} file${files.length > 1 ? 's' : ''} selected`
            : placeholder || 'Click to upload or drag and drop'}
        </div>
        {accept && (
          <div className="noble-file-upload-hint">{accept}</div>
        )}
        
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="noble-file-upload-progress">
            <div 
              className="noble-file-upload-progress-bar"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </div>
    );
  };

  const renderFilePreviews = () => {
    if (!previewFiles || filePreviews.length === 0) return null;
    
    return (
      <div className="noble-file-preview">
        {filePreviews.map((item, index) => (
          <div key={index} className="noble-file-preview-item">
            {item.type === 'image' ? (
              <img 
                src={item.preview} 
                alt={item.file.name}
                className="noble-file-preview-image"
              />
            ) : (
              <div className="noble-file-preview-icon">📄</div>
            )}
            <button
              type="button"
              className="noble-file-preview-remove"
              onClick={(e) => {
                e.stopPropagation();
                removeFile(index);
              }}
              data-cursor="hover"
              aria-label="Remove file"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderTagsInput = () => {
    return (
      <div className="noble-tags-container" onClick={() => inputRef.current?.focus()}>
        {internalTags.map((tag, index) => (
          <div key={index} className="noble-tag">
            {tag}
            <button
              type="button"
              className="noble-tag-remove"
              onClick={() => removeTag(index)}
              data-cursor="hover"
              aria-label={`Remove ${tag}`}
            >
              ✕
            </button>
          </div>
        ))}
        <input
          ref={inputRef}
          type="text"
          className="noble-tags-input"
          value={tagInput}
          onChange={handleTagInput}
          onKeyDown={handleTagKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={internalTags.length === 0 ? placeholder : ''}
          disabled={disabled}
          data-cursor="text"
        />
        {showAutocomplete && filteredAutocomplete.length > 0 && (
          <div className="noble-autocomplete-dropdown" ref={autocompleteRef}>
            {filteredAutocomplete.map((option, index) => (
              <div
                key={index}
                className={`noble-autocomplete-item ${index === autocompleteHighlight ? 'highlighted' : ''}`}
                onClick={() => addTag(option)}
                data-cursor="hover"
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderInput = () => {
    if (type === 'file') {
      return (
        <>
          {renderFileUpload()}
          {renderFilePreviews()}
        </>
      );
    }

    if (type === 'tags') {
      return renderTagsInput();
    }

    if (type === 'textarea') {
      return (
        <textarea
          ref={textareaRef}
          className={inputClasses}
          value={internalValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={!floatingLabel ? placeholder : ''}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          maxLength={maxLength}
          rows={autoResize ? 1 : rows}
          data-cursor="text"
          {...props}
        />
      );
    }

    if (type === 'select') {
      return (
        <select
          ref={inputRef}
          className={inputClasses}
          value={internalValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          data-cursor="hover"
          {...props}
        >
          <option value="" disabled>
            {placeholder || 'Select an option'}
          </option>
          {options.map((option, index) => (
            <option 
              key={index} 
              value={typeof option === 'object' ? option.value : option}
            >
              {typeof option === 'object' ? option.label : option}
            </option>
          ))}
        </select>
      );
    }

    const inputType = type === 'password' && showPassword ? 'text' : type;

    return (
      <input
        ref={inputRef}
        type={inputType}
        className={inputClasses}
        value={internalValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={!floatingLabel ? placeholder : ''}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        maxLength={maxLength}
        min={min}
        max={max}
        step={step}
        data-cursor="text"
        {...props}
      />
    );
  };

  return (
    <div className={containerClasses} style={style}>
      {label && !floatingLabel && (
        <label className={`noble-input-label ${required ? 'required' : ''}`}>
          {label}
        </label>
      )}

      <div className={wrapperClasses}>
        {icon && type !== 'file' && type !== 'tags' && (
          <span className={`noble-input-icon icon-${iconPosition}`}>
            {icon}
          </span>
        )}

        {renderInput()}

        {floatingLabel && type !== 'file' && type !== 'tags' && (
          <label className={`noble-input-floating-label ${showFloatingLabel ? 'active' : ''}`}>
            {label}
            {required && ' *'}
          </label>
        )}

        {renderPasswordToggle()}
        {renderClearButton()}
      </div>

      {renderPasswordStrength()}
      
      {helperText && (
        <div className="noble-input-helper">
          {helperText}
        </div>
      )}

      {renderCharacterCount()}
    </div>
  );
});

NobleInput.displayName = 'NobleInput';

export const NobleTextInput = forwardRef((props, ref) => (
  <NobleInput ref={ref} type="text" {...props} />
));

export const NobleEmailInput = forwardRef((props, ref) => (
  <NobleInput ref={ref} type="email" {...props} />
));

export const NoblePasswordInput = forwardRef((props, ref) => (
  <NobleInput ref={ref} type="password" showPasswordToggle {...props} />
));

export const NobleNumberInput = forwardRef((props, ref) => (
  <NobleInput ref={ref} type="number" {...props} />
));

export const NobleTextarea = forwardRef((props, ref) => (
  <NobleInput ref={ref} type="textarea" {...props} />
));

export const NobleSelect = forwardRef((props, ref) => (
  <NobleInput ref={ref} type="select" {...props} />
));

export const NobleFileUpload = forwardRef((props, ref) => (
  <NobleInput ref={ref} type="file" {...props} />
));

export const NobleSearchInput = forwardRef((props, ref) => (
  <NobleInput 
    ref={ref} 
    type="search" 
    icon="🔍" 
    showClearButton 
    {...props} 
  />
));

export const NoblePhoneInput = forwardRef((props, ref) => (
  <NobleInput 
    ref={ref} 
    type="tel" 
    mask="phone" 
    icon="📞" 
    {...props} 
  />
));

export const NobleTagsInput = forwardRef((props, ref) => (
  <NobleInput ref={ref} type="tags" {...props} />
));

export default NobleInput;