/**
 * CodeClean.io UI Controller
 * Handles user interface interactions and visual updates
 */

/**
 * Create interactive JSON tree view
 * @param {Array|Object} json - Data to visualize
 * @param {jQuery} parent - Parent element to append to
 * @param {number} depth - Current nesting depth
 */
function createJsonView(json, parent, depth = 0) {
    const indent = "&nbsp;".repeat(depth * 2);
    const keys = Object.keys(json);

    keys.forEach((key, index) => {
        let value = json[key];
        const isLast = index === keys.length - 1;
        const element = $('<div class="child"></div>');
        element.html(indent);
        
        key = escapeHtml(key);

        if (value === null) {
            element.append(`<span class='key'>"${key}"</span>: <span class='null'>null</span>`);
            if (!isLast) element.append(",");
            parent.append(element);
        } else if (Array.isArray(value) || typeof value === "object") {
            const toggle = $("<span class='toggle'></span>");
            const isNumericKey = !isNaN(parseFloat(key)) && isFinite(key);
            
            // Replace initial indent with toggle + spacing for proper positioning
            element.html('');
            element.append(toggle);
            element.append(indent);
            
            if (!isNumericKey) {
                element.append(`<span class='key'>"${key}"</span>: `);
            }
            
            element.append(Array.isArray(value) ? "[" : "{");
            
            // Add item count for arrays and objects
            if (Array.isArray(value) && value.length > 0) {
                element.append(`<span class='children-count'>${value.length} items</span>`);
            } else if (!Array.isArray(value)) {
                const objKeys = Object.keys(value);
                if (objKeys.length > 0) {
                    element.append(`<span class='children-count'>${objKeys.length} props</span>`);
                }
            }

            const children = $("<div class='children'></div>");
            createJsonView(value, children, depth + 1);
            element.append(children);
            
            const closeIndent = "&nbsp;".repeat(depth * 2);
            const closeElement = $(`<div>${closeIndent}${Array.isArray(value) ? "]" : "}"}</div>`);
            if (!isLast) closeElement.append(",");
            element.append(closeElement);
            
            parent.append(element);
        } else if (typeof value === "string") {
            value = escapeHtml(value);
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            const isNumericKey = !isNaN(parseFloat(key)) && isFinite(key);
            
            if (!isNumericKey) {
                element.append(`<span class='key'>"${key}"</span>: `);
            }
            
            // Make URLs clickable
            if (urlRegex.test(value) && (value.startsWith('http://') || value.startsWith('https://'))) {
                element.append(`<span class='string'>"<a href="${value}" target="_blank" rel="noopener noreferrer">${value}</a>"</span>`);
            } else {
                element.append(`<span class='string'>"${value}"</span>`);
            }
            
            if (!isLast) element.append(",");
            parent.append(element);
        } else if (typeof value === "number") {
            const isNumericKey = !isNaN(parseFloat(key)) && isFinite(key);
            if (!isNumericKey) {
                element.append(`<span class='key'>"${key}"</span>: `);
            }
            element.append(`<span class='number'>${value}</span>`);
            if (!isLast) element.append(",");
            parent.append(element);
        } else if (typeof value === "boolean") {
            const isNumericKey = !isNaN(parseFloat(key)) && isFinite(key);
            if (!isNumericKey) {
                element.append(`<span class='key'>"${key}"</span>: `);
            }
            element.append(`<span class='boolean'>${value}</span>`);
            if (!isLast) element.append(",");
            parent.append(element);
        }
    });
}

/**
 * Update the output view with processed data
 * @param {string} rawInput - Raw input data
 */
function updateJsonView(rawInput) {
    const view = $("#json-view");
    
    // Check input size limit
    if (rawInput.length > MAX_INPUT_SIZE) {
        view.html('<div class="error">⚠️ Input too large to process. Please provide smaller input.</div>');
        return;
    }
    
    view.empty();
    
    if (rawInput === '') {
        view.html('<div style="color: var(--text-muted); font-style: italic;">Formatted output will appear here...</div>');
        return;
    }
    
    try {
        // Process escaped strings first
        if (isEscapedString(rawInput)) {
            rawInput = unescapeString(rawInput);
        }
        
        // Try different format parsers in order of priority
        if (isJSON(rawInput)) {
            const json = parseJSON(rawInput);
            if (json !== false) {
                createJsonView([json], view);
                view.addClass('fade-in');
            }
        } else if (isSVG(rawInput)) {
            const sanitized = sanitizeSVG(rawInput);
            view.html(sanitized);
        } else if (isCSV(rawInput)) {
            const table = csvToTable(rawInput);
            view.html(table);
        } else if (isXML(rawInput)) {
            const parsed = parseXML(rawInput);
            if (parsed) {
                createJsonView([parsed], view);
            } else {
                view.html('<div class="error">❌ Invalid XML format</div>');
            }
        } else if (isYAML(rawInput)) {
            const parsed = parseYAML(rawInput);
            createJsonView([parsed], view);
        } else if (isINI(rawInput)) {
            const parsed = parseINI(rawInput);
            createJsonView([parsed], view);
        } else if (isURL(rawInput)) {
            const parsed = parseURL(rawInput);
            if (parsed) {
                createJsonView([parsed], view);
            } else {
                view.html('<div class="error">❌ Invalid URL format</div>');
            }
        } else if (isBase64(rawInput)) {
            try {
                const decoded = decodeBase64(rawInput);
                view.html(`<div><strong>Base64 Decoded:</strong></div><pre>${escapeHtml(decoded)}</pre>`);
            } catch {
                view.html('<div class="error">❌ Invalid Base64 format</div>');
            }
        } else if (isHex(rawInput)) {
            try {
                const decoded = decodeHex(rawInput);
                view.html(`<div><strong>Hex Decoded:</strong></div><pre>${escapeHtml(decoded)}</pre>`);
            } catch {
                view.html('<div class="error">❌ Invalid Hex format</div>');
            }
        } else if (isBinary(rawInput)) {
            try {
                const decoded = decodeBinary(rawInput);
                view.html(`<div><strong>Binary Decoded:</strong></div><pre>${escapeHtml(decoded)}</pre>`);
            } catch {
                view.html('<div class="error">❌ Invalid Binary format</div>');
            }
        } else if (isSerialized(rawInput)) {
            const parsed = parseSerializedData(rawInput);
            if (typeof parsed === 'object') {
                createJsonView([parsed], view);
            } else {
                view.html(`<div><strong>Serialized Data:</strong></div><pre>${escapeHtml(parsed)}</pre>`);
            }
        } else {
            // Fallback to plain text
            view.html(`<pre>${escapeHtml(rawInput)}</pre>`);
        }
    } catch (error) {
        view.html(`<div class="error">❌ Processing Error: ${escapeHtml(error.message)}</div>`);
    }
}

/**
 * Update footer statistics
 * @param {string} text - Input text to analyze
 */
function updateFooterStats(text) {
    const { words, characters, tokens, lines, sizeInKB } = calculateStats(text);
    
    $("#footer-stats").html(`
        <span class="hide-before-600px">Words: ${words} | </span>
        Lines: ${lines} | 
        Chars: ${characters} | 
        Tokens: ${tokens}
        <span class="hide-before-600px"> | Size: ${sizeInKB} KB</span>
    `);
}

/**
 * Initialize drag and drop functionality
 */
function initializeDragDrop() {
    const jsonInput = $('#json-input');

    // Prevent default drag behaviors on document
    $(document).on('dragover dragenter drop', function (e) {
        e.preventDefault();
        e.stopPropagation();
    });

    // Highlight input area when file is dragged over
    jsonInput.on('dragover dragenter', function () {
        $(this).addClass('dragover');
    });

    // Remove highlight when dragging leaves
    jsonInput.on('dragleave', function () {
        $(this).removeClass('dragover');
    });

    // Handle file drop
    jsonInput.on('drop', function (e) {
        e.preventDefault();
        $(this).removeClass('dragover');

        const file = e.originalEvent.dataTransfer.files[0];
        if (!file) {
            jsonInput.val('❌ No file detected. Please try again.');
            return;
        }

        if (file.size > MAX_INPUT_SIZE) {
            jsonInput.val('❌ File too large! Please upload a file smaller than 1MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (event) {
            jsonInput.val(event.target.result);
            updateJsonView(event.target.result);
            updateFooterStats(event.target.result);
        };
        reader.onerror = function () {
            jsonInput.val('❌ Error reading file. Please try again.');
        };
        reader.readAsText(file);
    });
}

/**
 * Initialize resizer functionality for split panes
 */
function initializeResizer() {
    let isResizing = false;
    const $jsonInput = $("#json-input");
    const $jsonView = $("#json-view");
    const $resizer = $("#resizer");

    // Load saved position
    const savedXPos = localStorage.getItem("xPos");
    if (savedXPos) {
        $jsonInput.css("width", `calc(${savedXPos}% - 5px)`);
        $jsonView.css("width", `calc(${100 - savedXPos}% - 5px)`);
    }

    $resizer.on("mousedown", function () {
        isResizing = true;
        $("body").css("cursor", "ew-resize");
    });

    $(document).on("mousemove", function (e) {
        if (!isResizing) return;
        const totalWidth = $("body").width();
        const xPos = (e.clientX / totalWidth) * 100;
        if (xPos < 10 || xPos > 90) return; // Set limits
        
        $jsonInput.css("width", `calc(${xPos}% - 5px)`);
        $jsonView.css("width", `calc(${100 - xPos}% - 5px)`);
        localStorage.setItem("xPos", xPos);
    });

    $(document).on("mouseup", function () {
        if (isResizing) {
            isResizing = false;
            $("body").css("cursor", "default");
        }
    });
}

/**
 * Initialize tree view toggle functionality
 */
function initializeTreeToggle() {
    // Toggle functionality for tree view
    $('#json-view').on('click', '.toggle', function(event) {
        event.preventDefault();
        const $this = $(this);
        const $parent = $this.closest('.child');
        
        if (event.originalEvent.detail > 1) {
            // Double click - collapse all children
            $parent.find('.child').addClass('collapsed');
        } else {
            // Single click - toggle this element
            $parent.toggleClass('collapsed');
        }
    });

    // Long press to collapse all
    let longPressTimer;
    $('#json-view').on('mousedown', '.toggle', function(event) {
        const $parent = $(this).closest('.child');
        longPressTimer = setTimeout(() => {
            $parent.find('.child').addClass('collapsed');
            $parent.addClass('collapsed');
        }, 500);
    });

    $('#json-view').on('mouseup mouseleave', '.toggle', function() {
        clearTimeout(longPressTimer);
    });
}

/**
 * Initialize keyboard shortcuts
 */
function initializeKeyboardShortcuts() {
    // Tab support in textarea
    $('textarea').on('keydown', function(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            let $this = $(this);
            let start = this.selectionStart;
            let end = this.selectionEnd;
            let value = $this.val();
            $this.val(value.substring(0, start) + '\t' + value.substring(end));
            this.selectionStart = this.selectionEnd = start + 1;
        }
    });

    // Global keyboard shortcuts
    $(document).on('keydown', function(e) {
        // Ctrl/Cmd + Enter to format
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            const input = $("#json-input").val();
            updateJsonView(input);
        }
        
        // Ctrl/Cmd + K to clear
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            $("#json-input").val('').focus();
            updateJsonView('');
            updateFooterStats('');
        }
    });
}

/**
 * Initialize link click handling
 */
function initializeLinkHandling() {
    $('#json-view').on('click', function(event) {
        if ($(event.target).is('a')) {
            const href = $(event.target).attr('href');
            if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
                window.open(href, '_blank', 'noopener,noreferrer');
                event.preventDefault();
            }
        }
    });
}

/**
 * Show loading state
 * @param {boolean} show - Whether to show loading state
 */
function showLoading(show = true) {
    const view = $("#json-view");
    if (show) {
        view.html('<div class="loading"></div> Processing...');
    }
}

/**
 * Initialize responsive behavior
 */
function initializeResponsive() {
    // Handle window resize
    $(window).on('resize', debounce(() => {
        // Adjust UI for mobile/desktop
        if (isMobile()) {
            // Mobile-specific adjustments
            $('.tagline').hide();
        } else {
            $('.tagline').show();
        }
    }, 250));
}

/**
 * Initialize all UI components
 */
function initializeUI() {
    initializeDragDrop();
    initializeResizer();
    initializeTreeToggle();
    initializeKeyboardShortcuts();
    initializeLinkHandling();
    initializeResponsive();
    
    // Focus input on load
    $("#json-input").focus();
    
    // Initial responsive check
    if (isMobile()) {
        $('.tagline').hide();
    }
}

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createJsonView,
        updateJsonView,
        updateFooterStats,
        initializeDragDrop,
        initializeResizer,
        initializeTreeToggle,
        initializeKeyboardShortcuts,
        initializeLinkHandling,
        showLoading,
        initializeResponsive,
        initializeUI
    };
} 