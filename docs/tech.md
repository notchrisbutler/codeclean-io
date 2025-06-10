# CodeClean.io Technical Documentation

## Architecture Overview

CodeClean.io is built as a client-side web application with offline capabilities, zero server-side processing, and privacy-first design principles. The application uses modern web technologies to provide a fast, secure, and accessible data visualization tool.

## Dependencies & Packages

### Core Libraries

#### jQuery 3.6.0
- **Purpose**: DOM manipulation, event handling, and AJAX operations
- **Source**: Local copy (`/jquery-3.6.0.min.js`)
- **Usage**: 
  - Event binding for user interactions
  - DOM traversal and manipulation
  - Textarea and resize functionality
  - File drag-and-drop handling

#### LZ-String
- **Purpose**: Data compression for URL-based sharing
- **Source**: Local copy (`/lz-string.min.js`)
- **Usage**:
  - Compresses user input data before URL encoding
  - Enables sharing of large datasets via URLs
  - Privacy-focused sharing (data in URL hash, not query params)

#### DOMPurify 3.0.0
- **Purpose**: HTML sanitization for security
- **Source**: Local copy (`/purify.min.js`)
- **Usage**:
  - Sanitizes SVG content before rendering
  - Prevents XSS attacks from malicious SVG files
  - Removes dangerous attributes and elements

### Analytics

#### Simple Analytics
- **Purpose**: Privacy-first analytics
- **Source**: `https://scripts.simpleanalyticscdn.com/latest.js`
- **Features**:
  - 100% privacy-compliant
  - No cookies or personal data collection
  - Aggregate usage statistics only

## Service Worker Implementation

### Purpose
The service worker enables offline functionality and improves performance through caching strategies.

### Registration
```javascript
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/service-worker.js")
    .then((registration) => {
       console.log("Service Worker registered with scope:", registration.scope);
    })
    .catch((error) => {
      console.error("Service Worker registration failed:", error);
    });
}
```

### Storage Monitoring
The application monitors service worker storage usage:
```javascript
if ('storage' in navigator && 'estimate' in navigator.storage) {
    navigator.storage.estimate().then(({usage, quota}) => {
        console.log(`Service Worker is using ${(usage / 1048576).toFixed(2)} MB out of ${(quota / 1048576).toFixed(2)} MB.`);
    });
}
```

### Benefits
- Offline application availability
- Faster load times through caching
- Reduced server requests
- Improved user experience on slow connections

## Storage Systems

### LocalStorage Implementation

#### Auto-Save Functionality
- **Key**: `"userJsonInput"`
- **Trigger**: Every input change
- **Size Limit**: 5MB per storage operation
- **Persistence**: Survives browser sessions

#### Data Management
```javascript
// Save to localStorage
if ($(this).val().length < 1024 * 1024 * 5) {
    localStorage.setItem(storageKey, $(this).val());
}

// Load from localStorage
const savedInput = localStorage.getItem(storageKey);
if (savedInput) {
    $('textarea').val(savedInput).trigger('input');
}
```

### URL-Based Storage

#### Hash-Based Privacy
- Uses URL hash (`#d=`) instead of query parameters
- Hash data never reaches server logs
- Enables private sharing of sensitive data

#### Compression Pipeline
1. User input → LZ-String compression
2. Compressed data → URL encoding
3. Encoded data → URL hash
4. Shareable URL generation

#### Size Limitations
- **Input Size**: 1MB maximum for URL storage
- **File Import**: 1MB maximum file size
- **Processing**: 1MB maximum for real-time processing

### Resize State Persistence
- **Key**: `"xPos"`
- **Value**: Percentage-based position of resizer
- **Restoration**: Applied on page load
- **Scope**: Per-browser, persistent across sessions

## Data Processing Architecture

### Format Detection Pipeline
The application uses a cascading detection system:

1. **Empty Check**: Skip processing for empty input
2. **Escaped String Detection**: Unescape if needed
3. **JSON Detection**: Primary format with error handling
4. **SVG Detection**: XML parsing for SVG elements
5. **CSV Detection**: Pattern matching for tabular data
6. **URL Detection**: HTTP/HTTPS URL validation
7. **INI Detection**: Section and key-value pair detection
8. **Binary Detection**: Binary string pattern matching
9. **Hex Detection**: Hexadecimal pattern matching
10. **Base64 Detection**: Base64 pattern matching
11. **Serialized Detection**: PHP serialization format
12. **YAML Detection**: YAML structure patterns
13. **XML Detection**: Generic XML parsing
14. **Fallback**: Plain text display

### Parser Implementations

#### Custom YAML Parser
- Handles indentation-based structure
- Supports lists, objects, and scalar values
- Processes quoted strings and type inference

#### Custom XML-to-JSON Converter
- Preserves attributes in special `@attributes` objects
- Handles multiple child elements with same names as arrays
- Manages mixed content scenarios

#### CSV-to-HTML Converter
- Generates HTML tables with proper styling
- First row treated as headers
- Responsive table design

## Security Measures

### Content Sanitization
- **SVG Files**: DOMPurify sanitization removes dangerous elements
- **Link Generation**: Only HTTP/HTTPS URLs are made clickable
- **File Upload**: Size and type validation

### XSS Prevention
- HTML entity encoding for all user content
- Safe attribute handling in generated HTML
- No dynamic script execution

### Privacy Protection
- **No Server Communication**: All processing client-side
- **Hash-Based Sharing**: Data never sent to servers
- **Local Storage Only**: No external data persistence

## Performance Optimizations

### Memory Management
- **Size Limits**: Multiple layers of size checking
- **Efficient DOM Updates**: Minimal redraws and reflows
- **Lazy Processing**: Only process visible content

### UI Responsiveness
- **Debounced Updates**: Prevents excessive re-rendering
- **Progressive Enhancement**: Core functionality works without JavaScript
- **Responsive Design**: Mobile-first approach

### Loading Optimizations
- **Local Dependencies**: No external CDN dependencies for core functionality
- **Minified Assets**: Compressed JavaScript libraries
- **Service Worker Caching**: Offline capability and faster loads

## Browser Compatibility

### Modern Web APIs
- **Service Workers**: For offline functionality
- **LocalStorage**: For data persistence
- **File API**: For drag-and-drop functionality
- **URL API**: For URL parsing
- **DOMParser**: For XML/SVG processing

### Fallback Strategies
- Graceful degradation when APIs unavailable
- Feature detection before usage
- Error handling for unsupported features

## Development Considerations

### Code Organization
- Single-file architecture for simplicity
- Modular function design
- Clear separation of concerns
- Comprehensive error handling

### Maintainability
- Well-documented functions
- Consistent coding patterns
- Error logging and debugging support
- Version tracking for dependencies

### Scalability
- Efficient algorithms for large datasets
- Memory-conscious processing
- Configurable size limits
- Modular parser architecture 