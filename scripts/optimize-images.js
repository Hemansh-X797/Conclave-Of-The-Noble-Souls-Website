// ============================================================================
// IMAGE OPTIMIZATION SCRIPT
// Compress and optimize images for web
// Location: /scripts/optimize-images.js
// Usage: node scripts/optimize-images.js
// ============================================================================

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  inputDir: path.join(__dirname, '../public/Assets/Images'),
  outputDir: path.join(__dirname, '../public/Assets/Images/optimized'),
  formats: ['.jpg', '.jpeg', '.png', '.webp'],
  quality: {
    jpg: 85,
    png: 90,
    webp: 85
  },
  maxWidth: 1920,
  maxHeight: 1080,
  createWebP: true,
  createThumbnails: true,
  thumbnailSizes: [150, 300, 600]
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getAllImages(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllImages(filePath, fileList);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (CONFIG.formats.includes(ext)) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

function getOutputPath(inputPath, suffix = '') {
  const relativePath = path.relative(CONFIG.inputDir, inputPath);
  const parsedPath = path.parse(relativePath);
  const outputPath = path.join(
    CONFIG.outputDir,
    parsedPath.dir,
    parsedPath.name + suffix + parsedPath.ext
  );

  // Create directory if it doesn't exist
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  return outputPath;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ============================================================================
// OPTIMIZATION FUNCTIONS
// ============================================================================

async function optimizeImage(inputPath) {
  const ext = path.extname(inputPath).toLowerCase();
  const stats = fs.statSync(inputPath);
  const originalSize = stats.size;

  console.log(`\n📸 Processing: ${path.relative(CONFIG.inputDir, inputPath)}`);
  console.log(`   Original size: ${formatBytes(originalSize)}`);

  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    // Resize if needed
    if (metadata.width > CONFIG.maxWidth || metadata.height > CONFIG.maxHeight) {
      image.resize(CONFIG.maxWidth, CONFIG.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Optimize based on format
    if (ext === '.jpg' || ext === '.jpeg') {
      const outputPath = getOutputPath(inputPath);
      await image
        .jpeg({ quality: CONFIG.quality.jpg, progressive: true })
        .toFile(outputPath);

      const optimizedSize = fs.statSync(outputPath).size;
      const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(2);
      console.log(`   ✅ JPG optimized: ${formatBytes(optimizedSize)} (${savings}% smaller)`);

    } else if (ext === '.png') {
      const outputPath = getOutputPath(inputPath);
      await image
        .png({ quality: CONFIG.quality.png, compressionLevel: 9 })
        .toFile(outputPath);

      const optimizedSize = fs.statSync(outputPath).size;
      const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(2);
      console.log(`   ✅ PNG optimized: ${formatBytes(optimizedSize)} (${savings}% smaller)`);
    }

    // Create WebP version
    if (CONFIG.createWebP && ext !== '.webp') {
      const webpPath = getOutputPath(inputPath).replace(ext, '.webp');
      await sharp(inputPath)
        .webp({ quality: CONFIG.quality.webp })
        .toFile(webpPath);

      const webpSize = fs.statSync(webpPath).size;
      const savings = ((originalSize - webpSize) / originalSize * 100).toFixed(2);
      console.log(`   ✅ WebP created: ${formatBytes(webpSize)} (${savings}% smaller)`);
    }

    // Create thumbnails
    if (CONFIG.createThumbnails) {
      for (const size of CONFIG.thumbnailSizes) {
        const thumbPath = getOutputPath(inputPath, `_thumb_${size}`);
        await sharp(inputPath)
          .resize(size, size, { fit: 'cover' })
          .jpeg({ quality: CONFIG.quality.jpg })
          .toFile(thumbPath);

        console.log(`   ✅ Thumbnail created: ${size}x${size}`);
      }
    }

    return true;
  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`);
    return false;
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function optimizeAllImages() {
  console.log('🖼️  Image Optimization Script\n');
  console.log(`📁 Input directory: ${CONFIG.inputDir}`);
  console.log(`📁 Output directory: ${CONFIG.outputDir}`);
  console.log(`📋 Supported formats: ${CONFIG.formats.join(', ')}\n`);

  // Create output directory
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  // Get all images
  console.log('🔍 Scanning for images...');
  const images = getAllImages(CONFIG.inputDir);
  console.log(`✅ Found ${images.length} images\n`);

  if (images.length === 0) {
    console.log('⚠️  No images found to optimize');
    return;
  }

  // Optimize images
  let successful = 0;
  let failed = 0;
  const startTime = Date.now();

  for (const imagePath of images) {
    const result = await optimizeImage(imagePath);
    if (result) {
      successful++;
    } else {
      failed++;
    }
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Optimization Summary');
  console.log('='.repeat(60));
  console.log(`✅ Successfully optimized: ${successful} images`);
  console.log(`❌ Failed: ${failed} images`);
  console.log(`⏱️  Time taken: ${duration} seconds`);
  console.log(`📁 Output saved to: ${CONFIG.outputDir}`);
  console.log('='.repeat(60));
}

// Check for sharp dependency
try {
  require.resolve('sharp');
  optimizeAllImages().catch(error => {
    console.error('❌ Optimization failed:', error);
    process.exit(1);
  });
} catch (e) {
  console.error('❌ Missing dependency: sharp');
  console.log('\n📦 Install with: npm install --save-dev sharp');
  process.exit(1);
}