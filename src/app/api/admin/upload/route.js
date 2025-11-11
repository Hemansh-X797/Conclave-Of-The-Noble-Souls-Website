/**
 * ============================================================================
 * ADMIN FILE UPLOAD API
 * @route POST /api/admin/upload
 * @description Handles file uploads for admin/staff (images, documents)
 * @access Staff only
 * ============================================================================
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * ============================================================================
 * CONFIGURATION
 * ============================================================================
 */

const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  documents: ['application/pdf', 'text/plain', 'application/msword', 
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  all: []
};

ALLOWED_FILE_TYPES.all = [
  ...ALLOWED_FILE_TYPES.images,
  ...ALLOWED_FILE_TYPES.documents
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * ============================================================================
 * HELPER FUNCTIONS
 * ============================================================================
 */

/**
 * Parse session token
 * @param {string} token - Base64url encoded session token
 * @returns {Object|null} Parsed session data or null
 */
function parseSessionToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
}

/**
 * Check if user is staff
 * @param {Array} roles - User's role IDs
 * @returns {boolean} True if staff
 */
function isStaff(roles) {
  const staffRoleIds = [
    '1369566988128751750', '1369197369161154560', '1396459118025375784',
    '1370702703616856074', '1409148504026120293', '1408079849377107989'
  ];
  return roles.some(roleId => staffRoleIds.includes(roleId));
}

/**
 * Validate file
 * @param {File} file - File to validate
 * @param {string} category - File category (images, documents, all)
 * @returns {Object} Validation result
 */
function validateFile(file, category = 'all') {
  const errors = [];

  if (!file) {
    errors.push('No file provided');
    return { valid: false, errors };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  // Check file type
  const allowedTypes = ALLOWED_FILE_TYPES[category] || ALLOWED_FILE_TYPES.all;
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Generate unique filename
 * @param {string} originalName - Original filename
 * @returns {string} Unique filename
 */
function generateUniqueFilename(originalName) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  const nameWithoutExt = originalName.replace(`.${extension}`, '').replace(/[^a-zA-Z0-9]/g, '_');
  
  return `${nameWithoutExt}_${timestamp}_${random}.${extension}`;
}

/**
 * Upload file to Supabase Storage
 * @param {File} file - File to upload
 * @param {string} bucket - Storage bucket name
 * @param {string} path - File path in bucket
 * @returns {Promise<Object>} Upload result
 */
async function uploadToStorage(file, bucket, path) {
  // Convert file to buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return {
    path: data.path,
    url: urlData.publicUrl
  };
}

/**
 * Log upload activity
 * @param {Object} uploadData - Upload information
 * @returns {Promise<void>}
 */
async function logUpload(uploadData) {
  try {
    await supabase.from('admin_logs').insert({
      action_type: 'file_upload',
      details: {
        filename: uploadData.filename,
        fileType: uploadData.fileType,
        fileSize: uploadData.fileSize,
        url: uploadData.url
      },
      performed_by: uploadData.uploadedBy,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log upload:', error);
  }
}

/**
 * ============================================================================
 * POST HANDLER - Upload File
 * @route POST /api/admin/upload
 * ============================================================================
 */
export async function POST(request) {
  try {
    // Get session token
    const sessionToken = request.cookies.get('conclave_session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse session
    const sessionData = parseSessionToken(sessionToken);

    if (!sessionData || !isStaff(sessionData.roles || [])) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions. Staff only.' },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file');
    const category = formData.get('category') || 'all';
    const bucket = formData.get('bucket') || 'uploads';

    // Validate file
    const validation = validateFile(file, category);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'File validation failed',
          details: validation.errors
        },
        { status: 400 }
      );
    }

    // Generate unique filename
    const uniqueFilename = generateUniqueFilename(file.name);
    const filePath = `${category}/${uniqueFilename}`;

    // Upload to Supabase Storage
    const uploadResult = await uploadToStorage(file, bucket, filePath);

    // Log upload
    await logUpload({
      filename: file.name,
      fileType: file.type,
      fileSize: file.size,
      url: uploadResult.url,
      uploadedBy: sessionData.userId
    });

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        originalName: file.name,
        filename: uniqueFilename,
        path: uploadResult.path,
        url: uploadResult.url,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        uploadedBy: sessionData.username
      }
    });

  } catch (error) {
    console.error('File upload error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload file',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

/**
 * ============================================================================
 * GET HANDLER - Get Upload Info
 * @route GET /api/admin/upload
 * ============================================================================
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    info: {
      endpoint: '/api/admin/upload',
      method: 'POST',
      authentication: 'Staff only',
      maxFileSize: `${MAX_FILE_SIZE / 1024 / 1024}MB`,
      allowedTypes: {
        images: ALLOWED_FILE_TYPES.images,
        documents: ALLOWED_FILE_TYPES.documents
      },
      formDataFields: {
        file: 'required - File to upload',
        category: 'optional - images|documents|all (default: all)',
        bucket: 'optional - Storage bucket name (default: uploads)'
      }
    }
  });
}

/**
 * ============================================================================
 * OPTIONS HANDLER (CORS)
 * @route OPTIONS /api/admin/upload
 * ============================================================================
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_SITE_URL || '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}