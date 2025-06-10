/**
 * CodeClean.io Data Parsers
 * Contains parsing functions for various data formats
 */

/**
 * Parse JSON and highlight errors if invalid
 * @param {string} input - JSON string to parse
 * @returns {Object|boolean} Parsed JSON or false if invalid
 */
function parseJSON(input) {
    const trimmed = input.trim();
    if ((trimmed.startsWith("{") && trimmed.endsWith("}")) ||
        (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
        try {
            return JSON.parse(trimmed);
        } catch (error) {
            highlightInvalidJSON(trimmed, error);
            return false;
        }
    }
    return false;
}

/**
 * Highlight invalid JSON with error position
 * @param {string} jsonString - Invalid JSON string
 * @param {Error} error - Parse error object
 */
function highlightInvalidJSON(jsonString, error) {
    const errorMatch = error.message.match(/position (\d+)/i);
    if (errorMatch) {
        const position = parseInt(errorMatch[1], 10);
        const beforeError = escapeHtml(jsonString.slice(0, position));
        const errorChar = escapeHtml(jsonString.charAt(position));
        const afterError = escapeHtml(jsonString.slice(position + 1));
        
        $('#json-view').html(`
            <div class="error">❌ Invalid JSON at position ${position}:</div>
            <pre style="white-space: pre-wrap; word-wrap: break-word; margin-top: 16px;">
                ${beforeError}<span class="error">${errorChar}</span>${afterError}
            </pre>
        `);
    } else {
        $('#json-view').html(`<div class="error">❌ Invalid JSON: ${escapeHtml(error.message)}</div>`);
    }
}

/**
 * Parse XML and convert to JSON structure
 * @param {string} input - XML string
 * @returns {Object|null} JSON representation of XML
 */
function parseXML(input) {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(input.trim(), "application/xml");
        
        if (xmlDoc.querySelector("parsererror")) {
            return null;
        }
        
        return xmlToJson(xmlDoc);
    } catch {
        return null;
    }
}

/**
 * Convert XML DOM to JSON object
 * @param {Document|Element} xml - XML document or element
 * @returns {Object} JSON representation
 */
function xmlToJson(xml) {
    let obj = {};

    if (xml.nodeType === 1) { // Element node
        // Handle attributes
        if (xml.attributes.length > 0) {
            obj["@attributes"] = {};
            for (let j = 0; j < xml.attributes.length; j++) {
                const attribute = xml.attributes.item(j);
                obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
            }
        }
    } else if (xml.nodeType === 3) { // Text node
        obj = xml.nodeValue;
    }

    // Handle child nodes
    if (xml.hasChildNodes()) {
        for (let i = 0; i < xml.childNodes.length; i++) {
            const item = xml.childNodes.item(i);
            const nodeName = item.nodeName;
            
            if (typeof obj[nodeName] === "undefined") {
                obj[nodeName] = xmlToJson(item);
            } else {
                if (typeof obj[nodeName].push === "undefined") {
                    const old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(xmlToJson(item));
            }
        }
    }
    return obj;
}

/**
 * Parse YAML string to JSON
 * @param {string} yamlString - YAML string
 * @returns {Object} Parsed YAML as JSON
 */
function parseYAML(yamlString) {
    const lines = yamlString.trim().split("\n");
    const result = {};
    const stack = [result];
    let currentIndent = 0;

    for (const line of lines) {
        // Skip empty lines, comments, and YAML document delimiters
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#") || trimmed === "---" || trimmed === "...") continue;

        // Determine current indentation level
        const indent = line.match(/^\s*/)[0].length;

        // Adjust stack based on indentation
        while (indent < currentIndent) {
            stack.pop();
            currentIndent -= 2; // Assuming 2 spaces per level
        }

        const parent = stack[stack.length - 1];

        if (trimmed.startsWith("-")) {
            // Handle lists
            const value = trimmed.substring(1).trim();
            if (!Array.isArray(parent)) {
                stack[stack.length - 1] = [];
                if (stack.length > 1) {
                    const grandParent = stack[stack.length - 2];
                    const parentKey = Object.keys(grandParent).find(key => grandParent[key] === parent);
                    if (parentKey) {
                        grandParent[parentKey] = stack[stack.length - 1];
                    }
                }
            }
            if (value) {
                stack[stack.length - 1].push(parseYAMLValue(value));
            } else {
                const newItem = [];
                stack[stack.length - 1].push(newItem);
                stack.push(newItem);
                currentIndent = indent + 2;
            }
        } else {
            // Handle key-value pairs
            const [key, value] = trimmed.split(":").map(s => s.trim());
            if (value) {
                parent[key] = parseYAMLValue(value);
            } else {
                parent[key] = {};
                stack.push(parent[key]);
                currentIndent = indent + 2;
            }
        }
    }

    return result;
}

/**
 * Parse individual YAML value with type inference
 * @param {string} value - YAML value string
 * @returns {*} Parsed value with correct type
 */
function parseYAMLValue(value) {
    // Handle quoted strings
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
        return value.slice(1, -1);
    }
    
    // Handle numbers
    if (/^-?\d+(\.\d+)?$/.test(value)) {
        return parseFloat(value);
    }
    
    // Handle booleans
    if (/^(true|false)$/.test(value)) {
        return value === "true";
    }
    
    // Handle null
    if (value === "null") {
        return null;
    }
    
    return value; // Return as string
}

/**
 * Decode Base64 string
 * @param {string} base64String - Base64 encoded string
 * @returns {string} Decoded string
 */
function decodeBase64(base64String) {
    try {
        return atob(base64String.trim());
    } catch {
        throw new Error('Invalid Base64 format');
    }
}

/**
 * Decode hexadecimal string
 * @param {string} hexString - Hex encoded string  
 * @returns {string} Decoded string
 */
function decodeHex(hexString) {
    try {
        return hexString.match(/.{1,2}/g)
            .map(byte => String.fromCharCode(parseInt(byte, 16)))
            .join('');
    } catch {
        throw new Error('Invalid Hex format');
    }
}

/**
 * Decode binary string
 * @param {string} binaryString - Binary string
 * @returns {string} Decoded string
 */
function decodeBinary(binaryString) {
    try {
        return binaryString.split(' ')
            .map(bin => String.fromCharCode(parseInt(bin, 2)))
            .join('');
    } catch {
        throw new Error('Invalid Binary format');
    }
}

/**
 * Parse INI format to JSON
 * @param {string} iniString - INI format string
 * @returns {Object} Parsed INI as JSON
 */
function parseINI(iniString) {
    const result = {};
    const lines = iniString.split('\n');
    let currentSection = null;

    for (const line of lines) {
        const trimmed = line.trim();
        
        // Skip empty lines and comments
        if (!trimmed || trimmed.startsWith(';') || trimmed.startsWith('#')) {
            continue;
        }

        // Check for section headers
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            currentSection = trimmed.slice(1, -1);
            result[currentSection] = {};
        } else if (trimmed.includes('=')) {
            // Parse key-value pairs
            const [key, ...valueParts] = trimmed.split('=');
            const value = valueParts.join('=').trim();
            
            if (currentSection) {
                result[currentSection][key.trim()] = parseYAMLValue(value);
            } else {
                result[key.trim()] = parseYAMLValue(value);
            }
        }
    }

    return result;
}

/**
 * Check if string is INI format
 * @param {string} input - String to check
 * @returns {boolean} True if INI format
 */
function isINI(input) {
    const iniSectionRegex = /^\s*\[.+\]\s*$/m;
    const iniKeyValueRegex = /^\s*[^;#=\s]+\s*=\s*.+$/m;
    
    return iniSectionRegex.test(input) || iniKeyValueRegex.test(input);
}

/**
 * Detect and parse escaped strings
 * @param {string} input - Input string
 * @returns {boolean} True if escaped string
 */
function isEscapedString(input) {
    const escapedStringRegex = /^".*(\\["\\/bfnrt]|\\u[0-9a-fA-F]{4}).*"$/;
    return escapedStringRegex.test(input);
}

/**
 * Unescape escaped string
 * @param {string} escapedStr - Escaped string
 * @returns {string} Unescaped string
 */
function unescapeString(escapedStr) {
    // Remove enclosing quotes
    if (escapedStr.startsWith('"') && escapedStr.endsWith('"')) {
        escapedStr = escapedStr.slice(1, -1);
    }
    
    // Replace common escape sequences
    escapedStr = escapedStr.replace(/\\(['"\\/bfnrt])/g, (_, char) => {
        const escapeMap = {
            '"': '"',
            "'": "'",
            '\\': '\\',
            '/': '/',
            b: '\b',
            f: '\f',
            n: '\n',
            r: '\r',
            t: '\t',
        };
        return escapeMap[char];
    });
    
    // Replace Unicode escape sequences
    return escapedStr.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => 
        String.fromCharCode(parseInt(hex, 16))
    );
}

/**
 * Parse serialized PHP data (basic implementation)
 * @param {string} data - Serialized string
 * @returns {*} Parsed data
 */
function parseSerializedData(data) {
    // This is a simplified implementation
    // For full PHP serialization support, a more comprehensive parser would be needed
    try {
        // Handle basic serialized formats
        if (data.startsWith('s:')) {
            // String format: s:length:"string"
            const match = data.match(/^s:(\d+):"(.*)";?$/);
            if (match) {
                return match[2];
            }
        }
        
        if (data.startsWith('i:')) {
            // Integer format: i:number;
            const match = data.match(/^i:(-?\d+);?$/);
            if (match) {
                return parseInt(match[1], 10);
            }
        }
        
        if (data.startsWith('b:')) {
            // Boolean format: b:0 or b:1
            const match = data.match(/^b:([01]);?$/);
            if (match) {
                return match[1] === '1';
            }
        }
        
        return data; // Return as-is if can't parse
    } catch {
        return data;
    }
}

/**
 * Check if string is serialized data
 * @param {string} input - String to check
 * @returns {boolean} True if serialized
 */
function isSerialized(input) {
    const serializedRegex = /^[a-z]:\d+:/;
    return serializedRegex.test(input.trim());
}

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        parseJSON,
        highlightInvalidJSON,
        parseXML,
        xmlToJson,
        parseYAML,
        parseYAMLValue,
        decodeBase64,
        decodeHex,
        decodeBinary,
        parseINI,
        isINI,
        isEscapedString,
        unescapeString,
        parseSerializedData,
        isSerialized
    };
} 