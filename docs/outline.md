# CodeClean.io Functionality Outline

## Overview
CodeClean.io is a comprehensive data visualization and formatting tool that converts various data formats into a friendly, readable format with syntax highlighting and tree view capabilities. All processing is done locally in the browser with no data sent to servers.

## Core Features

### 1. Multi-Format Data Support
- **JSON**: Primary format with full parsing, validation, and tree view
- **XML**: Converts XML to JSON structure with attribute support
- **CSV**: Renders as HTML tables with proper formatting
- **YAML**: Parses YAML documents to JSON structure
- **SVG**: Renders SVG images directly with sanitization
- **INI**: Parses configuration files to JSON structure
- **URLs**: Breaks down URLs into structured components
- **Serialized Data**: Handles PHP-style serialized strings
- **Base64**: Decodes Base64 encoded strings
- **Hexadecimal**: Converts hex strings to readable text
- **Binary**: Converts binary strings to text
- **Escaped Strings**: Unescapes escaped string data

### 2. User Interface Components

#### Input Area
- Large textarea for data input
- Placeholder text with usage instructions
- Tab key support for proper indentation
- Drag and drop file support (up to 1MB)
- Visual feedback during drag operations
- Auto-focus on page load

#### Output Area
- Formatted tree view with syntax highlighting
- Collapsible/expandable nodes with toggle buttons
- Color-coded data types:
  - Keys: Blue
  - Strings: Green (with automatic URL linking)
  - Numbers: Purple
  - Booleans: Gold
  - Null values: Gray
  - Errors: Red
- Click-to-expand/collapse functionality
- Long-press to collapse all child nodes

#### Resizable Interface
- Draggable resizer between input and output panels
- Persistent resize state saved to localStorage
- Responsive design for mobile devices
- Vertical stacking on screens < 600px width

### 3. Data Processing Features

#### JSON Validation
- Real-time JSON parsing and validation
- Error highlighting with position indicators
- Detailed error messages for invalid JSON

#### Tree View Generation
- Hierarchical display of nested data structures
- Proper indentation and formatting
- Comma placement for valid JSON structure
- Support for arrays and objects

#### Link Detection
- Automatic URL detection in string values
- Clickable links that open in new tabs
- Security measures (only HTTP/HTTPS links)

### 4. Data Persistence & Sharing

#### Local Storage
- Auto-save functionality using localStorage
- Persistent data across browser sessions
- 5MB storage limit with size checking
- Clear data option via URL hash (#new)

#### URL-Based Sharing
- Data compression using LZ-String
- URL hash-based storage for privacy
- Shareable links with compressed data
- No server-side data storage

#### File Import
- Drag and drop file support
- File size validation (1MB limit)
- Text file reading capability
- Error handling for file operations

### 5. User Experience Features

#### Statistics Display
- Word count, character count, line count
- Token estimation for AI usage
- File size in KB
- Real-time updates as user types

#### Mobile Responsiveness
- Optimized layout for mobile devices
- Touch-friendly interface
- Responsive font sizes and spacing
- Fixed footer on mobile

#### Dark Mode Support
- Automatic dark mode detection
- Optimized color scheme for dark environments
- Consistent theming across all components

### 6. Interactive Features

#### Toggle Controls
- Click to expand/collapse nodes
- Long-press to collapse all children
- Visual feedback on hover/active states
- Smart toggle indicators (+ / -)

#### Copy Functionality
- Standard text selection and copy
- Preserved formatting in copied content
- Clean output without UI elements

#### Keyboard Support
- Tab key support in textarea
- Standard keyboard navigation
- Accessibility considerations

## Technical Implementation

### Client-Side Processing
- 100% local processing - no server communication
- Real-time parsing and formatting
- Efficient DOM manipulation with jQuery
- Memory-conscious processing with size limits

### Error Handling
- Graceful degradation for invalid formats
- User-friendly error messages
- Fallback display for unrecognized formats
- Safe handling of potentially malicious content

### Performance Optimization
- Lazy rendering for large datasets
- Efficient tree structure generation
- Minimal DOM manipulation
- Responsive UI updates

## Security Features
- SVG sanitization using DOMPurify
- XSS prevention in link generation
- Safe file handling with size limits
- No external script execution in processed content 