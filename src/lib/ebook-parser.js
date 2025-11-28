// ============================================================================
// THE CONCLAVE REALM - E-BOOK PARSER UTILITY
// Location: /src/lib/ebook-parser.js
// ============================================================================
// Purpose: Extract metadata from PDF and EPUB files
// Features: PDF parsing, EPUB TOC extraction, file validation
// Dependencies: pdfjs-dist, epubjs (already installed)
// Author: The Conclave Development Team
// Created: 2024-11-26
// Version: 1.0.0
// ============================================================================

/**
 * @fileoverview
 * Comprehensive e-book parsing utilities for PDF and EPUB formats
 * 
 * Features:
 * - PDF metadata extraction (title, author, pages, etc.)
 * - EPUB metadata and TOC extraction
 * - File validation and format detection
 * - Chapter/section extraction
 * - Text extraction (for search indexing)
 * - File size and format validation
 * 
 * @example
 * import { parseEBook, extractMetadata } from '@/lib/ebook-parser';
 * 
 * const metadata = await parseEBook('/path/to/book.pdf');
 * console.log(metadata.title, metadata.author, metadata.pageCount);
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Supported formats
  SUPPORTED_FORMATS: ['pdf', 'epub', 'mobi'],
  
  // MIME types
  MIME_TYPES: {
    pdf: 'application/pdf',
    epub: 'application/epub+zip',
    mobi: 'application/x-mobipocket-ebook',
  },

  // File size limits (bytes)
  MAX_FILE_SIZE: parseInt(process.env.EBOOK_MAX_FILE_SIZE) || 104857600, // 100MB
  
  // Parsing limits
  MAX_TEXT_EXTRACTION_PAGES: 50,
  MAX_TOC_DEPTH: 5,
  
  // Worker configuration for PDF.js
  PDF_WORKER_SRC: '//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get file extension from path or blob
 * @param {string|Blob} file - File path or blob
 * @returns {string} File extension
 */
const getFileExtension = (file) => {
  if (typeof file === 'string') {
    return file.split('.').pop().toLowerCase();
  }
  if (file?.type) {
    return Object.keys(CONFIG.MIME_TYPES).find(
      ext => CONFIG.MIME_TYPES[ext] === file.type
    ) || '';
  }
  return '';
};

/**
 * Validate file format
 * @param {string} format - File format
 * @returns {boolean} Is valid
 */
const isValidFormat = (format) => {
  return CONFIG.SUPPORTED_FORMATS.includes(format.toLowerCase());
};

/**
 * Validate file size
 * @param {number} size - File size in bytes
 * @returns {object} Validation result
 */
const validateFileSize = (size) => {
  if (size > CONFIG.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size (${(size / (1024 * 1024)).toFixed(2)}MB) exceeds maximum allowed size (${(CONFIG.MAX_FILE_SIZE / (1024 * 1024)).toFixed(2)}MB)`,
    };
  }
  return { valid: true };
};

/**
 * Clean metadata text
 * @param {string} text - Text to clean
 * @returns {string} Cleaned text
 */
const cleanText = (text) => {
  if (!text) return '';
  return text
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, ' ')
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '');
};

// ============================================================================
// PDF PARSING
// ============================================================================

/**
 * Parse PDF file and extract metadata
 * @param {string|Uint8Array} source - PDF file path or data
 * @returns {Promise<object>} PDF metadata
 * 
 * @example
 * const metadata = await parsePDF('/books/lotm.pdf');
 */
export const parsePDF = async (source) => {
  try {
    // Dynamic import for PDF.js (client-side only)
    if (typeof window === 'undefined') {
      return {
        error: 'PDF parsing is only available on the client side',
      };
    }

    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = CONFIG.PDF_WORKER_SRC;

    // Load PDF document
    const loadingTask = pdfjsLib.getDocument(source);
    const pdf = await loadingTask.promise;

    // Extract basic metadata
    const metadata = await pdf.getMetadata();
    const info = metadata.info;

    // Get page count
    const numPages = pdf.numPages;

    // Extract outline (table of contents)
    const outline = await pdf.getOutline();
    const toc = outline ? extractPDFOutline(outline) : [];

    // Get first page for text preview
    let preview = '';
    try {
      const firstPage = await pdf.getPage(1);
      const textContent = await firstPage.getTextContent();
      preview = textContent.items
        .map(item => item.str)
        .join(' ')
        .substring(0, 500);
    } catch (error) {
      console.warn('Could not extract preview text', error);
    }

    return {
      success: true,
      format: 'pdf',
      title: cleanText(info.Title) || 'Unknown Title',
      author: cleanText(info.Author) || 'Unknown Author',
      subject: cleanText(info.Subject),
      keywords: cleanText(info.Keywords),
      creator: cleanText(info.Creator),
      producer: cleanText(info.Producer),
      creationDate: info.CreationDate,
      modificationDate: info.ModDate,
      pageCount: numPages,
      toc: toc,
      preview: cleanText(preview),
      version: info.PDFFormatVersion,
      encrypted: info.IsAcroFormPresent,
      linearized: info.IsLinearized,
    };
  } catch (error) {
    console.error('PDF parsing error:', error);
    return {
      success: false,
      error: error.message,
      format: 'pdf',
    };
  }
};

/**
 * Extract outline structure from PDF
 * @param {Array} outline - PDF outline
 * @param {number} depth - Current depth
 * @returns {Array} Structured TOC
 */
const extractPDFOutline = (outline, depth = 0) => {
  if (!outline || depth >= CONFIG.MAX_TOC_DEPTH) return [];

  return outline.map(item => ({
    title: cleanText(item.title),
    dest: item.dest,
    items: item.items ? extractPDFOutline(item.items, depth + 1) : [],
  }));
};

// ============================================================================
// EPUB PARSING
// ============================================================================

/**
 * Parse EPUB file and extract metadata
 * @param {string|ArrayBuffer} source - EPUB file path or data
 * @returns {Promise<object>} EPUB metadata
 * 
 * @example
 * const metadata = await parseEPUB('/books/shadow-slave.epub');
 */
export const parseEPUB = async (source) => {
  try {
    // Dynamic import for epubjs
    const ePub = (await import('epubjs')).default;

    // Load EPUB book
    const book = ePub(source);
    await book.ready;

    // Extract metadata
    const metadata = book.package.metadata;
    
    // Get table of contents
    const navigation = await book.loaded.navigation;
    const toc = navigation.toc.map(item => extractEPUBToc(item));

    // Get chapter count
    const spine = await book.loaded.spine;
    const chapterCount = spine.items.length;

    // Extract cover image
    let coverUrl = null;
    try {
      const cover = await book.coverUrl();
      coverUrl = cover;
    } catch (error) {
      console.warn('Could not extract cover', error);
    }

    return {
      success: true,
      format: 'epub',
      title: cleanText(metadata.title) || 'Unknown Title',
      author: cleanText(metadata.creator) || 'Unknown Author',
      publisher: cleanText(metadata.publisher),
      language: metadata.language || 'en',
      description: cleanText(metadata.description),
      pubdate: metadata.pubdate,
      rights: cleanText(metadata.rights),
      identifier: metadata.identifier,
      chapterCount: chapterCount,
      toc: toc,
      coverUrl: coverUrl,
    };
  } catch (error) {
    console.error('EPUB parsing error:', error);
    return {
      success: false,
      error: error.message,
      format: 'epub',
    };
  }
};

/**
 * Extract TOC structure from EPUB navigation
 * @param {object} item - Navigation item
 * @param {number} depth - Current depth
 * @returns {object} Structured TOC item
 */
const extractEPUBToc = (item, depth = 0) => {
  if (!item || depth >= CONFIG.MAX_TOC_DEPTH) return null;

  return {
    label: cleanText(item.label),
    href: item.href,
    id: item.id,
    subitems: item.subitems?.map(sub => extractEPUBToc(sub, depth + 1)).filter(Boolean) || [],
  };
};

// ============================================================================
// UNIVERSAL PARSER
// ============================================================================

/**
 * Parse e-book file (auto-detects format)
 * @param {string|Uint8Array|ArrayBuffer|Blob} source - E-book source
 * @param {object} options - Parsing options
 * @returns {Promise<object>} E-book metadata
 * 
 * @example
 * const metadata = await parseEBook(file);
 * if (metadata.success) {
 *   console.log(metadata.title, metadata.pageCount);
 * }
 */
export const parseEBook = async (source, options = {}) => {
  try {
    // Detect format
    const format = options.format || getFileExtension(source);

    if (!isValidFormat(format)) {
      return {
        success: false,
        error: `Unsupported format: ${format}. Supported formats: ${CONFIG.SUPPORTED_FORMATS.join(', ')}`,
      };
    }

    // Validate file size if source is Blob/File
    if (source?.size) {
      const sizeValidation = validateFileSize(source.size);
      if (!sizeValidation.valid) {
        return {
          success: false,
          error: sizeValidation.error,
        };
      }
    }

    // Parse based on format
    switch (format.toLowerCase()) {
      case 'pdf':
        return await parsePDF(source);
      
      case 'epub':
        return await parseEPUB(source);
      
      case 'mobi':
        return {
          success: false,
          error: 'MOBI parsing not yet implemented. Please convert to EPUB or PDF.',
          format: 'mobi',
        };
      
      default:
        return {
          success: false,
          error: `Unknown format: ${format}`,
        };
    }
  } catch (error) {
    console.error('E-book parsing error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ============================================================================
// METADATA EXTRACTION
// ============================================================================

/**
 * Extract metadata from e-book file
 * @param {string|File} file - E-book file
 * @returns {Promise<object>} Extracted metadata
 * 
 * @example
 * const metadata = await extractMetadata(uploadedFile);
 */
export const extractMetadata = async (file) => {
  try {
    const result = await parseEBook(file);
    
    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    // Normalize metadata structure
    return {
      success: true,
      title: result.title,
      author: result.author,
      format: result.format,
      pages: result.pageCount || result.chapterCount || 0,
      description: result.description || result.subject,
      language: result.language,
      publisher: result.publisher || result.producer,
      publishDate: result.pubdate || result.creationDate,
      toc: result.toc || [],
      preview: result.preview,
      coverUrl: result.coverUrl,
    };
  } catch (error) {
    console.error('Metadata extraction error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ============================================================================
// FILE VALIDATION
// ============================================================================

/**
 * Validate e-book file
 * @param {File|Blob} file - File to validate
 * @returns {object} Validation result
 * 
 * @example
 * const validation = validateEBookFile(uploadedFile);
 * if (!validation.valid) {
 *   console.error(validation.errors);
 * }
 */
export const validateEBookFile = (file) => {
  const errors = [];
  
  // Check if file exists
  if (!file) {
    errors.push('No file provided');
    return { valid: false, errors };
  }

  // Check file size
  const sizeValidation = validateFileSize(file.size);
  if (!sizeValidation.valid) {
    errors.push(sizeValidation.error);
  }

  // Check format
  const format = getFileExtension(file);
  if (!isValidFormat(format)) {
    errors.push(`Invalid format: ${format}. Supported: ${CONFIG.SUPPORTED_FORMATS.join(', ')}`);
  }

  // Check MIME type
  const expectedMime = CONFIG.MIME_TYPES[format];
  if (expectedMime && file.type !== expectedMime) {
    errors.push(`MIME type mismatch. Expected: ${expectedMime}, Got: ${file.type}`);
  }

  return {
    valid: errors.length === 0,
    errors: errors,
    format: format,
    size: file.size,
    sizeMB: (file.size / (1024 * 1024)).toFixed(2),
  };
};

// ============================================================================
// TEXT EXTRACTION (FOR SEARCH)
// ============================================================================

/**
 * Extract text from e-book for search indexing
 * @param {string|Uint8Array|ArrayBuffer} source - E-book source
 * @param {object} options - Extraction options
 * @returns {Promise<string>} Extracted text
 * 
 * @example
 * const text = await extractText('/books/book.pdf', { maxPages: 20 });
 */
export const extractText = async (source, options = {}) => {
  const maxPages = options.maxPages || CONFIG.MAX_TEXT_EXTRACTION_PAGES;
  const format = options.format || getFileExtension(source);

  try {
    switch (format.toLowerCase()) {
      case 'pdf':
        return await extractTextFromPDF(source, maxPages);
      
      case 'epub':
        return await extractTextFromEPUB(source, maxPages);
      
      default:
        return '';
    }
  } catch (error) {
    console.error('Text extraction error:', error);
    return '';
  }
};

/**
 * Extract text from PDF
 * @param {string|Uint8Array} source - PDF source
 * @param {number} maxPages - Maximum pages to extract
 * @returns {Promise<string>} Extracted text
 */
const extractTextFromPDF = async (source, maxPages) => {
  if (typeof window === 'undefined') return '';

  try {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = CONFIG.PDF_WORKER_SRC;

    const loadingTask = pdfjsLib.getDocument(source);
    const pdf = await loadingTask.promise;

    const pagesToExtract = Math.min(maxPages, pdf.numPages);
    const textParts = [];

    for (let i = 1; i <= pagesToExtract; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      textParts.push(pageText);
    }

    return cleanText(textParts.join(' '));
  } catch (error) {
    console.error('PDF text extraction error:', error);
    return '';
  }
};

/**
 * Extract text from EPUB
 * @param {string|ArrayBuffer} source - EPUB source
 * @param {number} maxChapters - Maximum chapters to extract
 * @returns {Promise<string>} Extracted text
 */
const extractTextFromEPUB = async (source, maxChapters) => {
  try {
    const ePub = (await import('epubjs')).default;
    const book = ePub(source);
    await book.ready;

    const spine = await book.loaded.spine;
    const chaptersToExtract = Math.min(maxChapters, spine.items.length);
    const textParts = [];

    for (let i = 0; i < chaptersToExtract; i++) {
      const section = book.spine.get(spine.items[i].href);
      await section.load(book.load.bind(book));
      const text = await section.render();
      // Extract text from rendered HTML
      const div = document.createElement('div');
      div.innerHTML = text;
      textParts.push(div.textContent);
    }

    return cleanText(textParts.join(' '));
  } catch (error) {
    console.error('EPUB text extraction error:', error);
    return '';
  }
};

// ============================================================================
// CHAPTER DETECTION
// ============================================================================

/**
 * Detect chapters in e-book
 * @param {object} metadata - E-book metadata from parseEBook
 * @returns {Array} Chapter list
 */
export const detectChapters = (metadata) => {
  if (!metadata.success) return [];

  // Use TOC if available
  if (metadata.toc && metadata.toc.length > 0) {
    return metadata.toc.map((item, index) => ({
      number: index + 1,
      title: item.title || item.label || `Chapter ${index + 1}`,
      location: item.dest || item.href,
    }));
  }

  // Fallback: Generate chapter list based on page/chapter count
  const count = metadata.pageCount || metadata.chapterCount || 0;
  const chapters = [];
  
  for (let i = 0; i < count; i++) {
    chapters.push({
      number: i + 1,
      title: `Chapter ${i + 1}`,
      location: i,
    });
  }

  return chapters;
};

// ============================================================================
// EXPORTS
// ============================================================================


export default {
  parsePDF,
  parseEPUB,
  extractMetadata,
  validateEBookFile,
  extractText,
  detectChapters,
  isValidFormat,
  getFileExtension,
  CONFIG,
};

// export {
//   parseEBook,
//   parsePDF,
//   parseEPUB,
//   extractMetadata,
//   validateEBookFile,
//   extractText,
//   detectChapters,
//   isValidFormat,
//   getFileExtension,
//   CONFIG as EBOOK_PARSER_CONFIG,
// };