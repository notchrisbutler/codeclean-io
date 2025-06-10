/**
 * CodeClean.io Main Application
 * Initializes the application and coordinates all modules
 */

// Application state
let firstFocus = true;

/**
 * Initialize service worker for offline functionality
 */
function initializeServiceWorker() {
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

    // Monitor storage usage
    if ('storage' in navigator && 'estimate' in navigator.storage) {
        navigator.storage.estimate().then(({usage, quota}) => {
            console.log(`Storage: ${(usage / 1048576).toFixed(2)} MB / ${(quota / 1048576).toFixed(2)} MB`);
        }).catch(console.error);
    }
}

/**
 * Load data from localStorage or URL hash
 */
function loadSavedData() {
    const $input = $("#json-input");
    
    // Check URL hash first
    if (window.location.hash.startsWith('#d=')) {
        try {
            const compressed = decodeURIComponent(window.location.hash.substring(3));
            const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
            if (decompressed) {
                $input.val(decompressed);
                updateJsonView(decompressed);
                updateFooterStats(decompressed);
                return;
            }
        } catch (e) {
            console.error('Failed to load from URL:', e);
        }
    }
    
    // Load from localStorage if no URL data and not cleared
    if (window.location.hash !== '#new') {
        const savedInput = localStorage.getItem(STORAGE_KEY);
        if (savedInput) {
            $input.val(savedInput);
            updateJsonView(savedInput);
            updateFooterStats(savedInput);
        }
    }
}

/**
 * Save data to localStorage and URL hash
 * @param {string} data - Data to save
 */
function saveData(data) {
    // Save to localStorage (with size limit)
    if (data.length < 5 * 1024 * 1024) { // 5MB limit
        localStorage.setItem(STORAGE_KEY, data);
    }
    
    // Update URL for sharing (with size limit)
    if (data.length > 0 && data.length < MAX_INPUT_SIZE) {
        try {
            const compressed = LZString.compressToEncodedURIComponent(data);
            window.history.replaceState(null, null, '#d=' + compressed);
        } catch (e) {
            console.error('Failed to update URL:', e);
        }
    } else if (data.length === 0) {
        // Clear URL hash when input is empty
        window.history.replaceState(null, null, window.location.pathname);
    }
}

/**
 * Handle input changes with debouncing
 */
function handleInputChange() {
    const $input = $("#json-input");
    
    // Debounced update function
    const debouncedUpdate = debounce((value) => {
        updateJsonView(value);
        updateFooterStats(value);
        saveData(value);
    }, 300);
    
    $input.on("input", function() {
        const value = $(this).val();
        debouncedUpdate(value);
    });
}

/**
 * Handle URL hash changes (for navigation)
 */
function handleHashChange() {
    $(window).on('hashchange', function() {
        if (window.location.hash === '#new') {
            $("#json-input").val('').focus();
            updateJsonView('');
            updateFooterStats('');
            localStorage.removeItem(STORAGE_KEY);
            window.history.replaceState(null, null, window.location.pathname);
        } else if (window.location.hash.startsWith('#d=')) {
            loadSavedData();
        }
    });
}

/**
 * Initialize error handling
 */
function initializeErrorHandling() {
    // Global error handler
    window.addEventListener('error', function(e) {
        console.error('Global error:', e.error);
        showNotification('An unexpected error occurred', 'error');
    });
    
    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', function(e) {
        console.error('Unhandled promise rejection:', e.reason);
        showNotification('Processing error occurred', 'error');
    });
}

/**
 * Initialize performance monitoring
 */
function initializePerformanceMonitoring() {
    // Monitor memory usage (if available)
    if ('memory' in performance) {
        setInterval(() => {
            const memory = performance.memory;
            const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
            const limitMB = Math.round(memory.jsHeapSizeLimit / 1048576);
            
            // Warn if memory usage is high
            if (usedMB > limitMB * 0.8) {
                showNotification('High memory usage detected. Consider reducing input size.', 'warning');
            }
        }, 30000); // Check every 30 seconds
    }
}

/**
 * Initialize keyboard shortcuts help
 */
function initializeHelp() {
    // Show help modal on Ctrl/Cmd + ?
    $(document).on('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === '?') {
            e.preventDefault();
            showHelpModal();
        }
    });
}

/**
 * Show help modal with keyboard shortcuts
 */
function showHelpModal() {
    const helpContent = `
        <div class="help-modal">
            <h3>CodeClean.io Keyboard Shortcuts</h3>
            <div class="shortcut-list">
                <div class="shortcut">
                    <kbd>Ctrl/Cmd + Enter</kbd>
                    <span>Reformat current input</span>
                </div>
                <div class="shortcut">
                    <kbd>Ctrl/Cmd + K</kbd>
                    <span>Clear input</span>
                </div>
                <div class="shortcut">
                    <kbd>Tab</kbd>
                    <span>Insert tab in textarea</span>
                </div>
                <div class="shortcut">
                    <kbd>Click toggle</kbd>
                    <span>Expand/collapse node</span>
                </div>
                <div class="shortcut">
                    <kbd>Long press toggle</kbd>
                    <span>Collapse all children</span>
                </div>
            </div>
            <div class="help-footer">
                <button onclick="$(this).closest('.help-modal').remove()">Close</button>
            </div>
        </div>
    `;
    
    const $modal = $('<div class="modal-overlay"></div>').html(helpContent);
    $('body').append($modal);
    
    // Close on overlay click
    $modal.on('click', function(e) {
        if (e.target === this) {
            $(this).remove();
        }
    });
}

/**
 * Initialize theme detection and handling
 */
function initializeTheme() {
    // Listen for system theme changes
    if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        // Initial theme setup is handled by CSS
        // Could add theme toggle functionality here in the future
        
        mediaQuery.addEventListener('change', function(e) {
            // Theme change handling could go here
            console.log('System theme changed to:', e.matches ? 'dark' : 'light');
        });
    }
}

/**
 * Initialize analytics (privacy-first)
 */
function initializeAnalytics() {
    // Simple Analytics is already loaded via script tag
    // No additional setup needed - it's privacy-first by default
    
    // Track some basic usage metrics locally (no external sending)
    const usage = JSON.parse(localStorage.getItem('usage-stats') || '{}');
    usage.sessions = (usage.sessions || 0) + 1;
    usage.lastUsed = new Date().toISOString();
    localStorage.setItem('usage-stats', JSON.stringify(usage));
}

/**
 * Main application initialization
 */
function initializeApp() {
    console.log('🚀 Initializing CodeClean.io...');
    
    try {
        // Initialize core systems
        initializeServiceWorker();
        initializeErrorHandling();
        initializePerformanceMonitoring();
        initializeTheme();
        initializeAnalytics();
        
        // Initialize UI components
        initializeUI();
        
        // Initialize data handling
        handleInputChange();
        handleHashChange();
        initializeHelp();
        
        // Load saved data
        loadSavedData();
        
        // Initial updates
        const initialInput = $("#json-input").val();
        updateJsonView(initialInput);
        updateFooterStats(initialInput);
        
        console.log('✅ CodeClean.io initialized successfully');
        
    } catch (error) {
        console.error('❌ Failed to initialize CodeClean.io:', error);
        showNotification('Failed to initialize application', 'error');
    }
}

// Initialize when DOM is ready
$(document).ready(function() {
    initializeApp();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        // Page became visible - could refresh data or check for updates
        console.log('Page became visible');
    } else {
        // Page became hidden - could save state or pause operations
        console.log('Page became hidden');
    }
});

// Handle before unload (save state)
window.addEventListener('beforeunload', function(e) {
    const input = $("#json-input").val();
    if (input.length > 0) {
        saveData(input);
    }
});

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeServiceWorker,
        loadSavedData,
        saveData,
        handleInputChange,
        handleHashChange,
        initializeErrorHandling,
        initializePerformanceMonitoring,
        initializeHelp,
        showHelpModal,
        initializeTheme,
        initializeAnalytics,
        initializeApp
    };
} 