/**
 * CodeClean.io Utility Functions
 * Contains helper functions for data processing and UI utilities
 */

// Constants
const MAX_INPUT_SIZE = 1024 * 1024; // 1MB
const STORAGE_KEY = "codeCleanInput";

/**
 * Escape HTML characters to prevent XSS
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Calculate text statistics for footer display
 * @param {string} text - Input text to analyze
 * @returns {Object} Statistics object
 */
function calculateStats(text) {
    const lines = text.trim().split(/\r?\n/);
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    const characterCount = text.length;
    const tokenCount = Math.ceil(characterCount / 4);
    const lineCount = lines.length;
    const sizeInKB = (new Blob([text]).size / 1024).toFixed(2);

    return {
        words: wordCount.toLocaleString(),
        characters: characterCount.toLocaleString(),
        tokens: tokenCount.toLocaleString(),
        lines: lineCount.toLocaleString(),
        sizeInKB: sizeInKB
    };
}

/**
 * Check if input is valid JSON
 * @param {string} input - String to validate
 * @returns {boolean} True if valid JSON
 */
function isJSON(input) {
    const trimmed = input.trim();
    if ((trimmed.startsWith("{") && trimmed.endsWith("}")) ||
        (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
        try {
            JSON.parse(trimmed);
            return true;
        } catch (error) {
            return false;
        }
    }
    return false;
}

/**
 * Check if input is XML format
 * @param {string} input - String to validate
 * @returns {boolean} True if valid XML
 */
function isXML(input) {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(input.trim(), "application/xml");
        return !xmlDoc.querySelector("parsererror");
    } catch {
        return false;
    }
}

/**
 * Check if input is SVG format
 * @param {string} input - String to validate
 * @returns {boolean} True if valid SVG
 */
function isSVG(input) {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(input.trim(), "image/svg+xml");
        return !doc.querySelector("parsererror") && doc.documentElement.nodeName === "svg";
    } catch {
        return false;
    }
}

/**
 * Check if input is CSV format
 * @param {string} input - String to validate
 * @returns {boolean} True if likely CSV
 */
function isCSV(input) {
    const lines = input.trim().split(/\r?\n/);
    if (lines.length < 2) return false;
    
    const commaCounts = lines.map(line => (line.match(/,/g) || []).length);
    const firstLineCount = commaCounts[0];
    
    return firstLineCount > 0 && 
           commaCounts.filter(count => Math.abs(count - firstLineCount) <= 1).length >= lines.length * 0.8;
}

/**
 * Check if input is YAML format
 * @param {string} input - String to validate
 * @returns {boolean} True if likely YAML
 */
function isYAML(input) {
    const cleanedInput = input.trim().replace(/^---\s*/, "").replace(/\s*\.\.\.\s*$/, "");
    const yamlRegex = /^(\s*-\s+.+|[a-zA-Z0-9_-]+:\s+.+)/m;
    return yamlRegex.test(cleanedInput);
}

/**
 * Check if input is a URL
 * @param {string} str - String to validate
 * @returns {boolean} True if valid URL
 */
function isURL(str) {
    return str.startsWith('http://') || str.startsWith('https://');
}

/**
 * Check if input is Base64 encoded
 * @param {string} input - String to validate
 * @returns {boolean} True if valid Base64
 */
function isBase64(input) {
    const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
    return base64Regex.test(input.trim()) && input.length > 20;
}

/**
 * Check if input is hexadecimal
 * @param {string} input - String to validate
 * @returns {boolean} True if valid hex
 */
function isHex(input) {
    const hexRegex = /^[0-9a-fA-F\s]+$/;
    return hexRegex.test(input.trim()) && input.length > 10;
}

/**
 * Check if input is binary
 * @param {string} input - String to validate
 * @returns {boolean} True if valid binary
 */
function isBinary(input) {
    const binaryRegex = /^[01\s]+$/;
    return binaryRegex.test(input.trim()) && input.length > 10;
}

/**
 * Parse URL into components
 * @param {string} url - URL to parse
 * @returns {Object|null} Parsed URL object or null if invalid
 */
function parseURL(url) {
    try {
        const urlObj = new URL(url);
        return {
            protocol: urlObj.protocol.replace(':', ''),
            hostname: urlObj.hostname,
            pathname: urlObj.pathname.split('/').filter(Boolean),
            searchParams: Object.fromEntries(urlObj.searchParams),
            hash: urlObj.hash
        };
    } catch {
        return null;
    }
}

/**
 * Convert CSV to HTML table
 * @param {string} csv - CSV string
 * @returns {string} HTML table string
 */
function csvToTable(csv) {
    const rows = csv.trim().split(/\r?\n/);
    let html = '<table>';
    
    rows.forEach((row, index) => {
        const columns = row.split(',').map(col => col.trim());
        html += '<tr>';
        columns.forEach(col => {
            const tag = index === 0 ? 'th' : 'td';
            html += `<${tag}>${escapeHtml(col)}</${tag}>`;
        });
        html += '</tr>';
    });
    
    html += '</table>';
    return html;
}

/**
 * Sanitize SVG content for security
 * @param {string} input - SVG string
 * @returns {string} Sanitized SVG
 */
function sanitizeSVG(input) {
    return DOMPurify.sanitize(input, { 
        FORBID_TAGS: ['script'], 
        FORBID_ATTR: ['onload', 'onclick', 'xlink:href'] 
    });
}

/**
 * Throttle function execution
 * @param {Function} func - Function to throttle
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Debounce function execution
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Generate unique ID
 * @returns {string} Unique identifier
 */
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

/**
 * Check if device is mobile
 * @returns {boolean} True if mobile device
 */
function isMobile() {
    return window.innerWidth <= 768;
}

/**
 * Show notification to user
 * @param {string} message - Message to display
 * @param {string} type - Type of notification (success, error, warning, info)
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = $(`
        <div class="notification notification-${type}">
            ${escapeHtml(message)}
        </div>
    `);
    
    // Add to page
    $('body').append(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.fadeOut(300, () => notification.remove());
    }, 3000);
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('Copied to clipboard!', 'success');
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        showNotification('Failed to copy to clipboard', 'error');
        return false;
    }
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size string
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        escapeHtml,
        calculateStats,
        isJSON,
        isXML,
        isSVG,
        isCSV,
        isYAML,
        isURL,
        isBase64,
        isHex,
        isBinary,
        parseURL,
        csvToTable,
        sanitizeSVG,
        throttle,
        debounce,
        generateId,
        isMobile,
        showNotification,
        copyToClipboard,
        formatFileSize,
        MAX_INPUT_SIZE,
        STORAGE_KEY
    };
} 