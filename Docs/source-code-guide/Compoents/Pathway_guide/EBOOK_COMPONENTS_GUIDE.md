# 📚 E-BOOK COMPONENTS GUIDE

## Complete Implementation Manual for The Conclave Realm

**Last Updated:** November 23, 2024  
**Components:** 8 E-Book System Components  
**Quality Level:** LEGENDARY 🎖️

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Component Architecture](#component-architecture)
3. [EBookGrid](#ebookgrid)
4. [ReadingProgress](#readingprogress)
5. [EBookReader](#ebookreader)
6. [ThreeDOrbEffect](#threedorbeffect)
7. [PDFRenderer](#pdfrenderer)
8. [EPUBRenderer](#epubrenderer)
9. [BookmarkPanel](#bookmarkpanel)
10. [EBookDownloader](#ebookdownloader)
11. [Integration Examples](#integration-examples)
12. [Data Formats](#data-formats)
13. [Troubleshooting](#troubleshooting)

---

## 🎯 OVERVIEW

### **What Is This System?**

A complete, production-ready e-book management and reading system featuring:

- Advanced library browsing with filters
- Full PDF and EPUB reading support
- Progress tracking with constellation visualization
- Procedural 3D effects
- Bookmark management system
- Download manager with animations

### **File Locations**

```
/src/components/pathways/ebook/
├── EBookGrid.jsx              (750 lines)
├── ReadingProgress.jsx        (1,100 lines)
├── EBookReader.jsx            (1,400 lines)
├── BookmarkPanel.jsx          (750 lines)
├── EBookDownloader.jsx        (550 lines)
│
└── reader-components/
    ├── ThreeDOrbEffect.jsx    (500 lines)
    ├── PDFRenderer.jsx        (300 lines)
    └── EPUBRenderer.jsx       (400 lines)
```

### **Dependencies**

```json
{
  "react-pdf": "^9.1.1",
  "pdfjs-dist": "^4.8.69",
  "epubjs": "^0.3.93",
  "lucide-react": "^0.312.0",
  "framer-motion": "^11.11.11"
}
```

---

## 🏗️ COMPONENT ARCHITECTURE

### **Component Hierarchy**

```
EBookGrid (Library View)
├── EBookCard (displays book)
└── EmptyState / LoadingCrest

ReadingProgress (Stats & Tracking)
├── Canvas (constellation rendering)
└── Chart components

EBookReader (Main Reading Interface)
├── PDFRenderer (for PDF files)
├── EPUBRenderer (for EPUB files)
├── ThreeDOrbEffect (visual companion)
├── BookmarkPanel (sidebar)
├── SettingsPanel (inline)
└── Toolbars (top & bottom)

EBookDownloader (Download Manager)
└── Canvas (particle effects)

BookmarkPanel (Sidebar Component)
└── Bookmark items with edit/delete
```

### **Data Flow**

```
User → EBookGrid → Select Book
     ↓
EBookReader → Load File (PDF/EPUB)
     ↓
ThreeDOrbEffect + ReadingProgress → Track Progress
     ↓
BookmarkPanel → Save Bookmarks
     ↓
LocalStorage → Persist Data
```

---

## 📖 EBOOKGRID

### **Purpose**

Display library of books with advanced filtering, search, and sorting.

### **Import**

```javascript
import EBookGrid from '@/components/pathways/ebook/EBookGrid';
```

### **Props**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `books` | Array | Yes | `[]` | Array of book objects |
| `onRead` | Function | No | - | Callback when user clicks read |
| `onDownload` | Function | No | - | Callback when user clicks download |
| `variant` | String | No | `'default'` | Grid variant |
| `pathway` | String | No | `'lorebound'` | Pathway for theming |
| `showProgress` | Boolean | No | `true` | Show reading progress |
| `collections` | Array | No | `[]` | User's collections |
| `onAddToCollection` | Function | No | - | Add book to collection |

### **Usage Example**

```jsx
import EBookGrid from '@/components/pathways/ebook/EBookGrid';
import ebooksData from '@/data/ebooks.json';

function LibraryPage() {
  const [currentBook, setCurrentBook] = useState(null);
  const [showReader, setShowReader] = useState(false);

  const handleRead = (book) => {
    setCurrentBook(book);
    setShowReader(true);
  };

  const handleDownload = (book) => {
    // Open download modal
    console.log('Downloading:', book.title);
  };

  return (
    <div>
      <EBookGrid
        books={ebooksData['light-novels']}
        onRead={handleRead}
        onDownload={handleDownload}
        pathway="lorebound"
        showProgress={true}
      />

      {showReader && (
        <EBookReader
          book={currentBook}
          onClose={() => setShowReader(false)}
        />
      )}
    </div>
  );
}
```

### **Features**

**Search:**

- Real-time filtering
- Searches: title, author, description
- Keyboard shortcut: `Ctrl+K`

**Filters:**

- Genre multi-select
- Status filter (completed, ongoing, hiatus)
- Toggle with `Ctrl+F`

**Sort Options:**

- By title (A-Z)
- By author
- By rating (high to low)
- By date added
- By downloads
- By reading progress

**View Modes:**

- Grid view (default)
- List view
- Compact view

**Bulk Actions:**

- Select multiple books
- Bulk download

### **LocalStorage Keys**

```javascript
'ebook-view-mode'    // Saved view preference
'ebook-sort-by'      // Saved sort option
'ebook-sort-order'   // asc or desc
```

---

## 📊 READINGPROGRESS

### **Purpose**

Visualize reading journey with constellation system and statistics.

### **Import**

```javascript
import ReadingProgress from '@/components/pathways/ebook/ReadingProgress';
```

### **Props**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `book` | Object | Yes | - | Book object |
| `currentPage` | Number | Yes | `0` | Current page number |
| `totalPages` | Number | Yes | `100` | Total pages in book |
| `timeSpent` | Number | No | `0` | Total reading time (minutes) |
| `readingSessions` | Array | No | `[]` | Array of reading sessions |
| `onContinueReading` | Function | No | - | Callback to continue reading |
| `pathway` | String | No | `'lorebound'` | Pathway for theming |
| `compact` | Boolean | No | `false` | Compact view mode |

### **Usage Example**

```jsx
import ReadingProgress from '@/components/pathways/ebook/ReadingProgress';

function BookStatsPage() {
  const [sessions, setSessions] = useState([
    { date: '2024-11-20', duration: 60 },
    { date: '2024-11-21', duration: 45 },
    { date: '2024-11-22', duration: 75 }
  ]);

  return (
    <ReadingProgress
      book={currentBook}
      currentPage={145}
      totalPages={500}
      timeSpent={180}
      readingSessions={sessions}
      onContinueReading={() => {
        // Open reader at saved position
        openReader(currentBook, 145);
      }}
      pathway="lorebound"
    />
  );
}
```

### **Features**

**Three Views:**

1. **Overview View**
   - Circular progress indicator
   - Stats cards (pages read, remaining, time spent)
   - Reading mood detector
   - Continue reading button

2. **Stats View**
   - Reading level badge (Beginner → Champion)
   - 6 detailed stat cards
   - 7-day reading activity chart
   - Personal records

3. **Constellation View**
   - Animated canvas with stars
   - Each star = one chapter
   - Stars light up as chapters complete
   - Connecting lines between completed chapters
   - Pulsing effects synchronized to reading mood

**Reading Mood Colors:**

- 🟣 **Violet** (< 20 pages/hour) = Deep Focus
- 🟢 **Green** (20-40 p/h) = Normal Pace
- 🔵 **Blue** (40-60 p/h) = Fast Reader
- 🔴 **Red** (60+ p/h) = Speed Reading

**Reading Streak:**

- Tracks consecutive days of reading
- Fire emoji animation
- Stored in session data

### **Session Data Format**

```javascript
{
  date: '2024-11-23',  // ISO date string
  duration: 75,        // minutes
  pagesRead: 50,       // optional
  startTime: timestamp,
  endTime: timestamp
}
```

---

## 📱 EBOOKREADER

### **Purpose**

Complete reading interface with PDF/EPUB support, themes, and controls.

### **Import**

```javascript
import EBookReader from '@/components/pathways/ebook/EBookReader';
```

### **Props**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `book` | Object | Yes | - | Book object with files |
| `initialPage` | Number | No | `0` | Starting page/position |
| `onClose` | Function | Yes | - | Callback when reader closes |
| `onProgress` | Function | No | - | Progress update callback |
| `onBookmark` | Function | No | - | Bookmark added callback |
| `pathway` | String | No | `'lorebound'` | Pathway for theming |

### **Usage Example**

```jsx
import EBookReader from '@/components/pathways/ebook/EBookReader';

function ReadingPage() {
  const [savedProgress, setSavedProgress] = useState(null);

  useEffect(() => {
    // Load saved progress
    const progress = localStorage.getItem(`reading-progress-${book.id}`);
    if (progress) {
      setSavedProgress(JSON.parse(progress));
    }
  }, [book.id]);

  const handleProgress = (data) => {
    // Save to database or localStorage
    localStorage.setItem(`reading-progress-${book.id}`, JSON.stringify(data));
    
    // Optional: send to backend
    fetch('/api/ebooks/progress', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  };

  const handleBookmark = (bookmark) => {
    // Save bookmark
    const bookmarks = JSON.parse(localStorage.getItem(`bookmarks-${book.id}`) || '[]');
    bookmarks.push(bookmark);
    localStorage.setItem(`bookmarks-${book.id}`, JSON.stringify(bookmarks));
  };

  return (
    <EBookReader
      book={book}
      initialPage={savedProgress?.currentPage || 0}
      onClose={() => navigate('/library')}
      onProgress={handleProgress}
      onBookmark={handleBookmark}
      pathway="lorebound"
    />
  );
}
```

### **Features**

**File Support:**

- PDF files (via react-pdf)
- EPUB files (via epubjs)
- Automatic format detection

**Reading Themes:**

1. **Dark Mode** - #0A0A0F background
2. **Light Mode** - #F5F5DC cream parchment
3. **Sepia Mode** - #F4ECD8 vintage book
4. **High Contrast** - #000000 accessibility

**Typography Controls:**

- Font size: 12px - 32px
- Line height: 1.2x - 2.5x
- Font families: Josefin Sans, Serif, Monospace
- Bionic reading mode (bold first letters)

**Special Modes:**

- Ambient Focus Mode (vignette overlay)
- 3D Orb Effect (toggleable)
- Page Turn Sounds (optional)
- Fullscreen mode

**Navigation:**

- Next/Previous buttons
- Page jump input
- Keyboard shortcuts (see below)

**Progress System:**

- Auto-saves every 10 seconds
- Real-time percentage display
- Reading speed tracker (pages/hour)
- Session time tracking

### **Keyboard Shortcuts**

```
←/→           Previous/Next page
Ctrl+B        Add bookmark
Ctrl+F        Toggle fullscreen
+/-           Increase/Decrease font size
Esc           Close reader or exit fullscreen
PageUp/Down   Navigate pages (EPUB)
Home/End      First/Last page
```

### **Progress Data Format**

```javascript
{
  bookId: 'book-id',
  currentPage: 145,
  totalPages: 500,
  progress: 29,        // percentage
  lastRead: timestamp
}
```

---

## 🌟 THREEDORBEFFECT

### **Purpose**

Procedural 3D companion that responds to reading speed and progress.

### **Import**

```javascript
import ThreeDOrbEffect from '@/components/pathways/ebook/reader-components/ThreeDOrbEffect';
```

### **Props**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `scrollProgress` | Number | Yes | `0` | Reading progress (0-100) |
| `readingSpeed` | Number | No | `0` | Pages per hour |
| `moodColor` | String | No | `'#9D4EDD'` | Current mood color (hex) |
| `isReading` | Boolean | No | `false` | Whether actively reading |

### **Usage Example**

```jsx
// Usually integrated within EBookReader
import ThreeDOrbEffect from '@/components/pathways/ebook/reader-components/ThreeDOrbEffect';

function CustomReader() {
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [moodColor, setMoodColor] = useState('#9D4EDD');

  useEffect(() => {
    // Calculate mood color based on speed
    if (speed < 20) setMoodColor('#9D4EDD');      // Violet
    else if (speed < 40) setMoodColor('#50C878'); // Green
    else if (speed < 60) setMoodColor('#00BFFF'); // Blue
    else setMoodColor('#FF4500');                 // Red
  }, [speed]);

  return (
    <>
      <ThreeDOrbEffect
        scrollProgress={progress}
        readingSpeed={speed}
        moodColor={moodColor}
        isReading={true}
      />
      {/* Your reader content */}
    </>
  );
}
```

### **Features**

**Visual Elements:**

- Procedural icosphere (12 vertices, golden ratio)
- 50+ orbital particles with connections
- Progress ring (65px radius)
- Inner pulsing core
- Outer mood-colored glow
- Sparkle effects on milestones

**Rotation Speed:**

- Slow: 0.002 rad/frame (Deep Focus)
- Medium: 0.004 rad/frame (Normal)
- Fast: 0.008 rad/frame (Fast Reader)
- Very Fast: 0.015 rad/frame (Speed Reading)

**Performance:**

- Canvas-based with requestAnimationFrame
- Auto-cleanup on unmount
- Desktop only (hidden on mobile)
- Respects `animationsEnabled` setting

---

## 📄 PDFRENDERER

### **Purpose**

Render PDF files with text selection and navigation.

### **Import**

```javascript
import PDFRenderer from '@/components/pathways/ebook/reader-components/PDFRenderer';
```

### **Props**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `file` | Object | Yes | - | File object with path |
| `currentPage` | Number | No | `0` | Current page (0-indexed) |
| `onPageChange` | Function | No | - | Page change callback |
| `onTotalPagesLoad` | Function | No | - | Total pages callback |
| `bionicMode` | Boolean | No | `false` | Bionic reading mode |

### **Usage Example**

```jsx
import PDFRenderer from '@/components/pathways/ebook/reader-components/PDFRenderer';

function PDFViewer({ book }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  return (
    <PDFRenderer
      file={book.files[0]}
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      onTotalPagesLoad={setTotalPages}
      bionicMode={false}
    />
  );
}
```

### **Features**

- Text selection enabled
- Keyboard navigation (PageUp/Down, Home/End)
- Responsive sizing
- Bionic reading mode (bold first half of words)
- Loading states
- Error handling

---

## 📚 EPUBRENDERER

### **Purpose**

Render EPUB files with chapter navigation and custom styling.

### **Import**

```javascript
import EPUBRenderer from '@/components/pathways/ebook/reader-components/EPUBRenderer';
```

### **Props**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `file` | Object | Yes | - | File object with path |
| `currentPage` | Number | No | `0` | Current location index |
| `onPageChange` | Function | No | - | Location change callback |
| `onTotalPagesLoad` | Function | No | - | Total locations callback |
| `bionicMode` | Boolean | No | `false` | Bionic reading mode |
| `fontSize` | Number | No | `18` | Font size in pixels |
| `lineHeight` | Number | No | `1.8` | Line height multiplier |

### **Usage Example**

```jsx
import EPUBRenderer from '@/components/pathways/ebook/reader-components/EPUBRenderer';

function EPUBViewer({ book }) {
  const [currentLocation, setCurrentLocation] = useState(0);
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.8);

  return (
    <EPUBRenderer
      file={book.files[0]}
      currentPage={currentLocation}
      onPageChange={setCurrentLocation}
      onTotalPagesLoad={(total) => console.log('Total locations:', total)}
      bionicMode={false}
      fontSize={fontSize}
      lineHeight={lineHeight}
    />
  );
}
```

### **Features**

- Chapter navigation with auto-tracking
- Location-based progress (not just pages)
- Custom theme styling
- Hyphenation & justification
- Image optimization
- Bionic reading mode

---

## 🔖 BOOKMARKPANEL

### **Purpose**

Sidebar panel for managing bookmarks with color-coding and notes.

### **Import**

```javascript
import BookmarkPanel from '@/components/pathways/ebook/BookmarkPanel';
```

### **Props**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `bookId` | String | Yes | - | Current book ID |
| `bookmarks` | Array | No | `[]` | Array of bookmarks |
| `currentPage` | Number | No | `0` | Current page number |
| `onJumpToBookmark` | Function | No | - | Navigate to bookmark |
| `onAddBookmark` | Function | No | - | Add new bookmark |
| `onUpdateBookmark` | Function | No | - | Update bookmark |
| `onDeleteBookmark` | Function | No | - | Delete bookmark |
| `onClose` | Function | Yes | - | Close panel callback |
| `pathway` | String | No | `'lorebound'` | Pathway for theming |

### **Usage Example**

```jsx
import BookmarkPanel from '@/components/pathways/ebook/BookmarkPanel';

function ReaderWithBookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    // Load bookmarks from localStorage
    const saved = localStorage.getItem(`bookmarks-${book.id}`);
    if (saved) setBookmarks(JSON.parse(saved));
  }, [book.id]);

  const handleAddBookmark = (bookmark) => {
    const updated = [...bookmarks, bookmark];
    setBookmarks(updated);
    localStorage.setItem(`bookmarks-${book.id}`, JSON.stringify(updated));
  };

  const handleUpdateBookmark = (updatedBookmark) => {
    const updated = bookmarks.map(b => 
      b.id === updatedBookmark.id ? updatedBookmark : b
    );
    setBookmarks(updated);
    localStorage.setItem(`bookmarks-${book.id}`, JSON.stringify(updated));
  };

  const handleDeleteBookmark = (bookmarkId) => {
    const updated = bookmarks.filter(b => b.id !== bookmarkId);
    setBookmarks(updated);
    localStorage.setItem(`bookmarks-${book.id}`, JSON.stringify(updated));
  };

  return (
    <>
      {showPanel && (
        <BookmarkPanel
          bookId={book.id}
          bookmarks={bookmarks}
          currentPage={currentPage}
          onJumpToBookmark={(page) => setCurrentPage(page)}
          onAddBookmark={handleAddBookmark}
          onUpdateBookmark={handleUpdateBookmark}
          onDeleteBookmark={handleDeleteBookmark}
          onClose={() => setShowPanel(false)}
          pathway="lorebound"
        />
      )}
    </>
  );
}
```

### **Features**

**6 Bookmark Colors:**

- ⭐ Gold - Important
- 📘 Blue - Information
- ✅ Green - Completed
- ❓ Red - Question
- 💜 Purple - Favorite
- 🔄 Orange - Review

**Bookmark Management:**

- Add with note and color
- Edit inline
- Delete with confirmation
- Jump to page
- Visual color indicators

**Search & Filter:**

- Search by note or page
- Filter by color
- Sort by: recent, page, color

### **Bookmark Data Format**

```javascript
{
  id: Date.now(),
  page: 145,
  note: 'Important plot twist here',
  color: 'gold',
  date: Date.now()
}
```

---

## 🎴 EBOOKCARD

### **Purpose**

Beautiful display card for individual e-books with cover, info, and actions.

### **Import**

```javascript
import EBookCard from '@/components/pathways/ebook/EBookCard';
```

### **Props**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `book` | Object | Yes | `{}` | Book object with all details |
| `variant` | String | No | `'default'` | Card variant |
| `onRead` | Function | No | - | Callback when read clicked |
| `onDownload` | Function | No | - | Callback when download clicked |
| `onClick` | Function | No | - | Callback when card clicked |
| `className` | String | No | `''` | Additional CSS classes |

### **Variants**

**1. Default Variant** - Standard card with all features

```jsx
<EBookCard
  book={bookData}
  variant="default"
  onRead={handleRead}
  onDownload={handleDownload}
/>
```

**2. Compact Variant** - Minimal card (150px width)

```jsx
<EBookCard
  book={bookData}
  variant="compact"
  onRead={handleRead}
/>
```

**3. Detailed Variant** - Extended info with meta data

```jsx
<EBookCard
  book={bookData}
  variant="detailed"
  onRead={handleRead}
  onDownload={handleDownload}
/>
```

### **Usage Examples**

#### **Basic Grid Layout**

```jsx
import EBookCard from '@/components/pathways/ebook/EBookCard';

function BookGrid({ books }) {
  const handleRead = (book) => {
    navigate(`/read/${book.id}`);
  };

  const handleDownload = (book) => {
    // Open download modal
    setDownloadBook(book);
    setShowDownloadModal(true);
  };

  return (
    <div className="book-grid">
      {books.map((book) => (
        <EBookCard
          key={book.id}
          book={book}
          onRead={handleRead}
          onDownload={handleDownload}
        />
      ))}
    </div>
  );
}
```

#### **With Click Handler**

```jsx
function InteractiveBookGrid({ books }) {
  const handleCardClick = (book) => {
    // Show book details modal
    setSelectedBook(book);
    setShowDetailsModal(true);
  };

  return (
    <div className="book-grid">
      {books.map((book) => (
        <EBookCard
          key={book.id}
          book={book}
          onClick={handleCardClick}
          onRead={handleRead}
          onDownload={handleDownload}
        />
      ))}
    </div>
  );
}
```

#### **Compact Carousel**

```jsx
function CompactBookCarousel({ books }) {
  return (
    <div className="book-carousel">
      {books.slice(0, 5).map((book) => (
        <EBookCard
          key={book.id}
          book={book}
          variant="compact"
          onRead={handleRead}
        />
      ))}
    </div>
  );
}
```

#### **Detailed Library View**

```jsx
function DetailedLibrary({ books }) {
  return (
    <div className="detailed-library">
      {books.map((book) => (
        <EBookCard
          key={book.id}
          book={book}
          variant="detailed"
          onRead={handleRead}
          onDownload={handleDownload}
        />
      ))}
    </div>
  );
}
```

### **Features**

**Visual Elements:**

- **Cover Image**: With Next.js Image optimization
- **Fallback Cover**: Beautiful placeholder with book emoji and title
- **Status Badge**: Shows completion status (Completed, Ongoing, Hiatus)
- **Rating Display**: 5-star system converted from 10-point scale
- **Genre Tags**: Up to 3 tags with "+N more" indicator
- **Author Information**: Italicized author name

**Interactive Features:**

- **Hover Overlay**: Shows description on hover (default/detailed variants)
- **Transform Animation**: Card lifts on hover (-8px translateY)
- **Action Buttons**: Read and Download with icons
- **Click Handler**: Optional full card click
- **Status Pulse**: Animated pulse for "Ongoing" status

**Meta Information (Detailed Variant):**

- File count display
- Download count with formatting
- Additional metadata

### **Book Object Structure**

```javascript
{
  id: 'shadow-slave',
  title: 'Shadow Slave',
  author: 'Guiltythree',
  rating: 9.5,                    // 0-10 scale
  coverImage: '/Assets/Images/ebooks/covers/shadow-slave.jpg',
  genre: ['Fantasy', 'Action', 'Adventure'],
  status: 'Ongoing',              // 'Completed', 'Ongoing', 'Hiatus'
  description: 'Epic fantasy story about...',
  files: [
    {
      name: 'Chapters 1-1000',
      format: 'epub',
      path: '/Assets/E-Books/Light-Novels/shadow-slave-c0001-1000.epub'
    }
  ],
  downloads: 15234,
  tags: ['Popular', 'Recommended']  // Optional
}
```

### **Rating System**

The card converts 10-point ratings to 5-star display:

```javascript
// 10-point → 5-star conversion
9.5 → ★★★★★ (4.75 stars)
9.0 → ★★★★★ (4.5 stars)
8.5 → ★★★★☆ (4.25 stars)
7.0 → ★★★☆☆ (3.5 stars)
5.0 → ★★☆☆☆ (2.5 stars)
```

### **Status Badge Colors**

```javascript
Completed → Green with checkmark
Ongoing → Blue with pulse animation
Hiatus → Orange/Yellow
```

### **Image Handling**

**Automatic Fallback:**

```javascript
// If cover image fails to load or is missing:
1. Shows book emoji (📚)
2. Displays book title
3. Golden gradient background
4. Maintains aspect ratio
```

**Image Optimization:**

```javascript
// Next.js Image component with:
- fill={true} (responsive)
- sizes="(max-width: 768px) 150px, 200px"
- object-fit: cover
- Lazy loading
- Auto WebP conversion
```

### **Accessibility Features**

**Keyboard Navigation:**

- Card is focusable when onClick is provided
- `tabIndex={0}` for keyboard access
- `role="button"` for clickable cards
- `role="article"` for non-clickable cards

**ARIA Labels:**

```jsx
<div 
  className="ebook-rating"
  aria-label={`Rating: ${rating} out of 10`}
>
```

**Screen Reader Support:**

- All images have alt text
- Status badges have labels
- Hover overlays are purely visual

**Reduced Motion:**

```css
@media (prefers-reduced-motion: reduce) {
  .ebook-card,
  .ebook-cover-image,
  .ebook-overlay {
    transition: none !important;
    animation: none !important;
  }
}
```

**High Contrast Mode:**

```css
@media (prefers-contrast: high) {
  .ebook-card {
    background: rgba(0, 0, 0, 0.9);
    border: 2px solid rgba(255, 255, 255, 0.5);
  }
}
```

### **Styling Details**

**Card Dimensions:**

- Default: Fluid width (fits container)
- Compact: 150px max-width
- Detailed: Extended padding
- Aspect Ratio: 5:7 (standard book cover)

**Hover Effects:**

```css
transform: translateY(-8px);
box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
border-color: rgba(255, 215, 0, 0.3);
```

**Cover Image Transform:**

```css
.ebook-card:hover .ebook-cover-image {
  transform: scale(1.05);
}
```

### **Action Buttons**

The card uses `NobleButton` component from LuxuryButton:

```jsx
<NobleButton
  size="small"
  onClick={(e) => {
    e.stopPropagation();  // Prevents card click
    onRead(book);
  }}
>
  <span className="action-icon">👁️</span>
  <span>Read</span>
</NobleButton>
```

**Button Features:**

- Icons with text labels
- Click event propagation stopped
- Flex layout (buttons expand equally)
- Responsive (stack on mobile)

### **Responsive Breakpoints**

```css
/* Tablet (768px) */
- Smaller title font
- Reduced padding
- Stack action buttons vertically

/* Mobile (480px) */
- Full width cards
- Even smaller fonts
- Minimal padding
```

### **Performance Optimization**

**Image Loading:**

```jsx
import Image from 'next/image';

// Lazy loading enabled by default
// Automatic format optimization (WebP)
// Responsive srcset generation
```

**State Management:**

```javascript
// Only 2 state variables:
const [imageError, setImageError] = useState(false);
const [isHovered, setIsHovered] = useState(false);

// Minimal re-renders
```

**CSS-in-JS:**

```jsx
// Scoped styles with jsx
// No style conflicts
// Automatic vendor prefixing
```

### **Integration with EBookGrid**

```jsx
// EBookGrid uses EBookCard for display:
import EBookCard from '@/components/pathways/ebook/EBookCard';

function EBookGrid({ books, onRead, onDownload }) {
  return (
    <div className="ebook-grid">
      {books.map((book) => (
        <EBookCard
          key={book.id}
          book={book}
          onRead={onRead}
          onDownload={onDownload}
          variant="default"
        />
      ))}
    </div>
  );
}
```

### **Common Patterns**

**Pattern 1: Grid with Modal**

```jsx
function BookGridWithModal() {
  const [selectedBook, setSelectedBook] = useState(null);

  return (
    <>
      <div className="grid">
        {books.map(book => (
          <EBookCard
            key={book.id}
            book={book}
            onClick={setSelectedBook}
            onRead={handleRead}
          />
        ))}
      </div>

      {selectedBook && (
        <BookDetailsModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
        />
      )}
    </>
  );
}
```

**Pattern 2: Favoriting System**

```jsx
function FavoriteBookGrid() {
  const [favorites, setFavorites] = useState([]);

  const toggleFavorite = (book) => {
    setFavorites(prev => 
      prev.includes(book.id)
        ? prev.filter(id => id !== book.id)
        : [...prev, book.id]
    );
  };

  return (
    <div className="grid">
      {books.map(book => (
        <div key={book.id} className="book-wrapper">
          <EBookCard
            book={book}
            onRead={handleRead}
            onDownload={handleDownload}
          />
          <button
            onClick={() => toggleFavorite(book)}
            className="favorite-btn"
          >
            {favorites.includes(book.id) ? '❤️' : '🤍'}
          </button>
        </div>
      ))}
    </div>
  );
}
```

**Pattern 3: Loading States**

```jsx
function BookGridWithLoading({ isLoading, books }) {
  if (isLoading) {
    return (
      <div className="grid">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-cover" />
            <div className="skeleton-text" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid">
      {books.map(book => (
        <EBookCard
          key={book.id}
          book={book}
          onRead={handleRead}
        />
      ))}
    </div>
  );
}
```

---

## 📥 EBOOKDOWNLOADER

### **Purpose**

Download manager with progress tracking and particle effects.

### **Import**

```javascript
import EBookDownloader from '@/components/pathways/ebook/EBookDownloader';
```

### **Props**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `book` | Object | Yes | - | Book with files array |
| `onDownloadComplete` | Function | No | - | Completion callback |
| `onDownloadError` | Function | No | - | Error callback |
| `showStats` | Boolean | No | `true` | Show download stats |
| `pathway` | String | No | `'lorebound'` | Pathway for theming |

### **Usage Example**

```jsx
import EBookDownloader from '@/components/pathways/ebook/EBookDownloader';

function DownloadModal({ book, onClose }) {
  const handleComplete = (file, book) => {
    console.log('Downloaded:', file.name);
    // Track in analytics
    trackDownload(book.id, file.format);
    
    // Close modal after delay
    setTimeout(onClose, 3000);
  };

  const handleError = (error, file) => {
    console.error('Download failed:', error);
    // Show error notification
  };

  return (
    <div className="modal">
      <EBookDownloader
        book={book}
        onDownloadComplete={handleComplete}
        onDownloadError={handleError}
        showStats={true}
        pathway="lorebound"
      />
    </div>
  );
}
```

### **Features**

**Download Process:**

1. File selection (shows all available formats)
2. Progress animation (simulated or real)
3. Particle celebration on completion
4. Reset to download another

**Download Stats:**

- Total downloads per book
- Last download date
- Popular format tracking
- LocalStorage persistence

**Visual Effects:**

- 30-particle celebration system
- Canvas-based animation
- Success glow effect
- Format icons (📄 PDF, 📚 EPUB, 📖 MOBI)

### **LocalStorage Keys**

```javascript
`download-stats-${bookId}`  // Download statistics
```

---

## 🔗 INTEGRATION EXAMPLES

### **Complete Reading Flow**

```jsx
import { useState, useEffect } from 'react';
import EBookGrid from '@/components/pathways/ebook/EBookGrid';
import EBookReader from '@/components/pathways/ebook/EBookReader';
import ReadingProgress from '@/components/pathways/ebook/ReadingProgress';
import EBookDownloader from '@/components/pathways/ebook/EBookDownloader';
import ebooksData from '@/data/ebooks.json';

function LibraryPage() {
  const [view, setView] = useState('grid'); // grid, reader, progress, download
  const [currentBook, setCurrentBook] = useState(null);
  const [savedProgress, setSavedProgress] = useState(null);
  const [readingSessions, setReadingSessions] = useState([]);

  // Load saved data
  useEffect(() => {
    if (currentBook) {
      const progress = localStorage.getItem(`reading-progress-${currentBook.id}`);
      const sessions = localStorage.getItem(`reading-sessions-${currentBook.id}`);
      
      if (progress) setSavedProgress(JSON.parse(progress));
      if (sessions) setReadingSessions(JSON.parse(sessions));
    }
  }, [currentBook]);

  const handleRead = (book) => {
    setCurrentBook(book);
    setView('reader');
  };

  const handleProgress = (data) => {
    setSavedProgress(data);
    localStorage.setItem(`reading-progress-${currentBook.id}`, JSON.stringify(data));
  };

  const handleShowStats = (book) => {
    setCurrentBook(book);
    setView('progress');
  };

  const handleDownload = (book) => {
    setCurrentBook(book);
    setView('download');
  };

  return (
    <div className="library-container">
      {view === 'grid' && (
        <EBookGrid
          books={ebooksData['light-novels']}
          onRead={handleRead}
          onDownload={handleDownload}
          pathway="lorebound"
        />
      )}

      {view === 'reader' && currentBook && (
        <EBookReader
          book={currentBook}
          initialPage={savedProgress?.currentPage || 0}
          onClose={() => setView('grid')}
          onProgress={handleProgress}
          pathway="lorebound"
        />
      )}

      {view === 'progress' && currentBook && (
        <ReadingProgress
          book={currentBook}
          currentPage={savedProgress?.currentPage || 0}
          totalPages={savedProgress?.totalPages || 100}
          timeSpent={calculateTimeSpent(readingSessions)}
          readingSessions={readingSessions}
          onContinueReading={() => setView('reader')}
          pathway="lorebound"
        />
      )}

      {view === 'download' && currentBook && (
        <EBookDownloader
          book={currentBook}
          onDownloadComplete={() => {
            setTimeout(() => setView('grid'), 2000);
          }}
          pathway="lorebound"
        />
      )}
    </div>
  );
}

function calculateTimeSpent(sessions) {
  return sessions.reduce((total, session) => total + session.duration, 0);
}
```

---

## 📋 DATA FORMATS

### **Book Object**

```javascript
{
  id: 'lotm',
  title: 'Lord Of The Mysteries',
  author: 'Cuttlefish That Loves Diving',
  cover: '/Assets/Images/ebooks/covers/lotm_cover.jpg',
  genre: ['Fantasy', 'Mystery'],
  status: 'completed',
  rating: 9.5,
  downloads: 15234,
  chapters: 1400,
  description: 'Epic fantasy novel about...',
  dateAdded: '2024-01-15',
  progress: 45,  // User's reading progress (optional)
  files: [
    {
      name: 'Complete',
      format: 'pdf',
      path: '/Assets/E-Books/Light-Novels/Lord Of The Mysteries.pdf',
      size: 52428800  // bytes
    }
  ]
}
```

### **Reading Session Object**

```javascript
{
  date: '2024-11-23',
  duration: 75,        // minutes
  pagesRead: 50,
  startTime: 1700755200000,
  endTime: 1700759700000
}
```

### **Bookmark Object**

```javascript
{
  id: 1700755200000,
  page: 145,
  note: 'Important scene',
  color: 'gold',  // gold, blue, green, red, purple, orange
  date: 1700755200000
}
```

---

## 🔧 TROUBLESHOOTING

### **PDF Not Loading**

**Problem:** PDF fails to render  
**Solution:**

1. Check PDF.js worker URL is correct
2. Verify file path is accessible
3. Check browser console for CORS errors
4. Ensure file format is actually PDF

```javascript
// Verify worker configuration
pdfjs.GlobalWorkerOptions.workerSrc = 
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
```

### **EPUB Not Displaying**

**Problem:** EPUB content not showing  
**Solution:**

1. Check if file path is correct
2. Verify EPUB is valid (not corrupted)
3. Check iframe rendering in browser
4. Look for JavaScript errors in console

### **3D Orb Not Appearing**

**Problem:** ThreeDOrbEffect not visible  
**Solution:**

1. Check if `animationsEnabled` is true
2. Verify component is not on mobile (hidden by default)
3. Check canvas is rendering (inspect element)
4. Ensure `scrollProgress` prop is provided

### **Bookmarks Not Persisting**

**Problem:** Bookmarks lost on refresh  
**Solution:**

1. Check LocalStorage is enabled in browser
2. Verify `bookId` is consistent
3. Check LocalStorage key format: `bookmarks-${bookId}`
4. Ensure JSON parsing doesn't fail

```javascript
// Debug LocalStorage
console.log(localStorage.getItem(`bookmarks-${book.id}`));
```

### **Reading Progress Not Saving**

**Problem:** Progress resets on page reload  
**Solution:**

1. Check auto-save interval (10 seconds default)
2. Verify LocalStorage writes are successful
3. Ensure `onProgress` callback is provided
4. Check browser doesn't block LocalStorage

---

## 📚 BEST PRACTICES

### **Performance Optimization**

**1. Lazy Load Reader Components**

```javascript
import dynamic from 'next/dynamic';

const EBookReader = dynamic(() => import('@/components/pathways/ebook/EBookReader'), {
  ssr: false,
  loading: () => <LoadingCrest message="Loading reader..." />
});
```

**2. Implement Virtual Scrolling for Large Libraries**

```javascript
// For libraries with 1000+ books
import { useVirtualizer } from '@tanstack/react-virtual';
```

**3. Debounce Search Input**

```javascript
import { debounce } from 'lodash';

const debouncedSearch = useMemo(
  () => debounce((query) => setSearchQuery(query), 300),
  []
);
```

**4. Memoize Expensive Calculations**

```javascript
const filteredBooks = useMemo(() => {
  return books.filter(/* ... */);
}, [books, filters]);
```

**5. Cleanup Canvas Animations**

```javascript
useEffect(() => {
  const animate = () => {
    // Animation code
    frameId = requestAnimationFrame(animate);
  };
  animate();
  
  return () => cancelAnimationFrame(frameId);
}, []);
```

### **Data Management**

**1. Use Supabase for Production**

```javascript
// Store reading progress in database
const saveProgress = async (bookId, progress) => {
  const { data, error } = await supabase
    .from('reading_progress')
    .upsert({
      user_id: user.id,
      book_id: bookId,
      current_page: progress.currentPage,
      total_pages: progress.totalPages,
      last_read: new Date()
    });
};
```

**2. Implement Offline Support**

```javascript
// Cache books for offline reading
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

**3. Batch LocalStorage Writes**

```javascript
// Instead of multiple writes
const batchUpdate = {
  progress: progressData,
  bookmarks: bookmarksData,
  settings: settingsData
};
localStorage.setItem(`book-data-${bookId}`, JSON.stringify(batchUpdate));
```

### **Accessibility**

**1. Keyboard Navigation**

- Ensure all components are keyboard accessible
- Test with screen readers
- Provide clear focus indicators

**2. ARIA Labels**

```javascript
<button aria-label="Add bookmark to current page">
  <Bookmark size={20} />
</button>
```

**3. Color Contrast**

- High contrast theme available
- Test with accessibility tools
- Ensure text is readable on all backgrounds

### **Error Handling**

**1. Graceful Degradation**

```javascript
try {
  const data = await loadBook();
} catch (error) {
  console.error('Book load failed:', error);
  return <EmptyState 
    title="Failed to load book"
    message="Please try again or contact support"
    action={{ label: 'Retry', onClick: retry }}
  />;
}
```

**2. User Feedback**

```javascript
// Always inform users
notify.success('Bookmark added');
notify.error('Failed to save progress');
notify.info('Page loaded');
```

**3. Fallback Content**

```javascript
{!imageLoaded && (
  <div className="fallback-icon">
    <BookOpen size={48} />
  </div>
)}
```

---

## 🎯 COMMON USE CASES

### **Use Case 1: Simple Library Page**

```jsx
function SimpleLibrary() {
  return (
    <EBookGrid
      books={ebooksData['light-novels']}
      onRead={(book) => navigate(`/read/${book.id}`)}
      pathway="lorebound"
    />
  );
}
```

### **Use Case 2: Full Reading Experience**

```jsx
function FullReaderPage({ bookId }) {
  const [book, setBook] = useState(null);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    loadBook(bookId).then(setBook);
    loadProgress(bookId).then(setProgress);
  }, [bookId]);

  return book ? (
    <EBookReader
      book={book}
      initialPage={progress?.currentPage}
      onProgress={saveProgress}
      onClose={() => navigate('/library')}
    />
  ) : <LoadingCrest />;
}
```

### **Use Case 3: Stats Dashboard**

```jsx
function StatsPage({ userId }) {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);

  return (
    <div>
      <BookSelector books={books} onSelect={setSelectedBook} />
      {selectedBook && (
        <ReadingProgress
          book={selectedBook}
          currentPage={selectedBook.progress}
          totalPages={selectedBook.totalPages}
          timeSpent={selectedBook.timeSpent}
          readingSessions={selectedBook.sessions}
        />
      )}
    </div>
  );
}
```

---

## 🔐 SECURITY CONSIDERATIONS

**1. File Access**

- Validate file paths before loading
- Ensure files are from trusted sources
- Implement rate limiting for downloads

**2. LocalStorage**

- Don't store sensitive user data
- Encrypt if necessary
- Clear on logout

**3. CORS**

- Configure properly for external files
- Use CDN for PDF.js worker
- Test cross-origin requests

---

## 📱 MOBILE CONSIDERATIONS

**1. Touch Gestures**

```javascript
// Swipe to change pages
const handleTouchStart = (e) => {
  startX = e.touches[0].clientX;
};

const handleTouchEnd = (e) => {
  const endX = e.changedTouches[0].clientX;
  if (startX - endX > 50) nextPage();
  if (endX - startX > 50) prevPage();
};
```

**2. Responsive Layouts**

- Grid becomes single column on mobile
- Sidebar becomes bottom sheet
- Reduce 3D effects on mobile

**3. Performance**

- Disable heavy animations
- Reduce particle counts
- Optimize image sizes

---

## 🎨 CUSTOMIZATION

### **Theming**

**Add Custom Reading Theme:**

```javascript
// In EBookReader settings
const customTheme = {
  bg: '#1a1a2e',
  text: '#eee',
  secondary: '#999'
};

// Apply in reader
<div style={{
  background: customTheme.bg,
  color: customTheme.text
}}>
```

### **Custom Bookmark Colors**

```javascript
// Add to BookmarkPanel
const customColors = {
  ...bookmarkColors,
  cyan: { color: '#00CED1', label: 'Reference', icon: '📌' }
};
```

### **Custom Progress Visualization**

```javascript
// Replace constellation with custom viz
<CustomProgressViz
  progress={progressPercentage}
  style="bars" // or "circles", "waves"
/>
```

---

## 🚀 ADVANCED FEATURES

### **Multi-Language Support**

```javascript
// Add i18n
const t = useTranslation();

<button>{t('reader.bookmark.add')}</button>
```

### **Cloud Sync**

```javascript
// Sync progress across devices
const syncProgress = async () => {
  const localProgress = getLocalProgress();
  const cloudProgress = await fetchCloudProgress();
  
  const latest = localProgress.lastRead > cloudProgress.lastRead
    ? localProgress
    : cloudProgress;
    
  setProgress(latest);
};
```

### **AI Reading Assistant**

```javascript
// Add AI summaries
const generateSummary = async (text) => {
  const response = await fetch('/api/ai/summarize', {
    method: 'POST',
    body: JSON.stringify({ text })
  });
  return response.json();
};
```

---

## 📖 ADDITIONAL RESOURCES

**Documentation:**

- [react-pdf Documentation](https://github.com/wojtekmaj/react-pdf)
- [epubjs Documentation](https://github.com/futurepress/epub.js)
- [Canvas API Reference](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

**Community:**

- GitHub Discussions
- Discord Server
- Stack Overflow

---

## ✅ CHECKLIST

Before deploying:

- [ ] All components tested with sample books
- [ ] PDF rendering works
- [ ] EPUB rendering works
- [ ] Bookmarks persist correctly
- [ ] Progress auto-saves
- [ ] Mobile responsive
- [ ] Keyboard shortcuts work
- [ ] Accessibility tested
- [ ] Error handling implemented
- [ ] Loading states present
- [ ] Empty states handled
- [ ] LocalStorage cleaned on logout
- [ ] Performance optimized
- [ ] 3D effects work (desktop)
- [ ] Download system functional

---

**END OF E-BOOK COMPONENTS GUIDE**

**Next Guide:** [Site Components Guide →](./SITE_COMPONENTS_GUIDE.md)
