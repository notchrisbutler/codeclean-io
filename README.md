# CodeClean.io

A comprehensive data visualization and formatting tool that converts various data formats into a friendly, readable format with syntax highlighting and tree view capabilities.

## 🚀 Features

### Multi-Format Data Support
- **JSON** - Parse, validate, and visualize with syntax highlighting
- **XML** - Convert to structured JSON format with attribute support
- **CSV** - Render as beautiful HTML tables
- **YAML** - Parse YAML documents to JSON structure
- **SVG** - Render images directly with sanitization
- **INI** - Parse configuration files to JSON structure
- **URLs** - Break down URLs into structured components
- **Base64** - Decode Base64 encoded strings
- **Hex/Binary** - Convert hex and binary strings to readable text
- **Serialized Data** - Handle PHP-style serialized strings
- **Escaped Strings** - Unescape escaped string data

### Privacy & Security
- **100% Local Processing** - Your data never leaves your browser
- **No Server Communication** - All processing happens client-side
- **SVG Sanitization** - Safe rendering with DOMPurify
- **XSS Prevention** - Secure link generation and content handling

### User Experience
- **Interactive Tree View** - Collapsible/expandable nodes with color-coded data types
- **Auto-Save** - Persistent data storage using localStorage
- **URL Sharing** - Share data via compressed URL hash (privacy-first)
- **Drag & Drop** - File upload support (up to 1MB)
- **Mobile Responsive** - Optimized for all screen sizes
- **Dark Mode** - Automatic dark theme detection
- **Real-time Stats** - Word count, character count, token estimation

### Advanced Features
- **Resizable Interface** - Draggable panels with persistent state
- **Keyboard Shortcuts** - Tab support, hotkeys for common actions
- **Error Highlighting** - Detailed error messages with position indicators
- **Link Detection** - Automatic URL detection and clickable links
- **Memory Monitoring** - Performance optimization with usage warnings

## 🛠️ Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Libraries**: jQuery, LZ-String, DOMPurify
- **Processing**: 100% client-side data parsing and visualization
- **Storage**: localStorage for persistence, URL hash for sharing
- **Security**: Content sanitization, XSS prevention

## 🎯 Use Cases

- **Developers** - Debug JSON APIs, format configuration files
- **Data Analysts** - Visualize CSV data, convert between formats
- **Designers** - Preview SVG files, format structured data
- **DevOps** - Parse configuration files, debug serialized data
- **Students** - Learn data structure formats, validate syntax

## 📱 Usage

1. **Paste Data** - Simply paste your data into the input area
2. **Auto-Detection** - The tool automatically detects the format
3. **Visualize** - View your data in a beautiful, interactive tree format
4. **Share** - Use the URL hash to share your formatted data
5. **Save** - Data is automatically saved to localStorage

## 🔧 Development

### Local Development
```bash
# Clone the repository
git clone https://github.com/notchrisbutler/codeclean-io.git
cd codeclean-io

# Serve locally (any HTTP server works)
python -m http.server 8000
# or
npx serve .
```

### Project Structure
```
codeclean.io/
├── index.html          # Main application HTML
├── css/
│   └── styles.css      # Application styles
├── js/
│   ├── app.js          # Main application logic
│   ├── parsers.js      # Data format parsers
│   ├── ui.js           # User interface components
│   └── utils.js        # Utility functions
└── docs/               # Documentation
```

## 🚀 Deployment

The application is a static site that can be deployed to any web server or CDN:

- **GitHub Pages** - Push to gh-pages branch
- **Netlify** - Connect repository for automatic deployment
- **Vercel** - Import project for instant deployment
- **Any Static Host** - Upload files to web server

## 🌟 Performance

- **Client-side Processing** - No server roundtrips required
- **Memory Efficient** - Optimized for large datasets
- **Lazy Rendering** - Only renders visible tree nodes
- **Compression** - LZ-String compression for URL sharing
- **Caching** - localStorage for instant load times

## 🔒 Privacy

- **No Data Collection** - Zero tracking or analytics on user data
- **Local Processing** - All parsing happens in your browser
- **Secure Sharing** - URL hash storage keeps data private
- **No Cookies** - No user tracking or session management

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Credits

This project is inspired by and built upon the original implementation by [@levelsio](https://github.com/levelsio) at [json.pub](https://json.pub). Thank you for the inspiration and the foundation that made this enhanced version possible.

## 📧 Contact

- **Developer**: [Chris Butler](https://chrisbutler.dev)
- **GitHub**: [notchrisbutler/codeclean-io](https://github.com/notchrisbutler/codeclean-io)
- **Website**: [codeclean.io](https://codeclean.io)

---

**CodeClean.io** - Transform your data into beautiful, interactive visualizations. ✨ 