// Development tools configuration
// This file aggressively suppresses WASM errors from Figma DevTools

// Execute immediately in global scope
(function() {
  'use strict';
  
  if (typeof window === 'undefined') return;

  // Enhanced WASM error detection with comprehensive patterns
  const suppressWasmError = (obj: any): boolean => {
    if (!obj) return false;
    
    try {
      const str = String(obj);
      const patterns = [
        'wasm',
        'devtools_worker',
        'webpack-artifacts',
        'wasm-function',
        '[wasm code]',
        '<?>.wasm',
        'figma.com/webpack-artifacts',
        'figma.com.*devtools',
      ];
      
      // Check basic patterns
      for (const pattern of patterns) {
        if (str.includes(pattern)) return true;
      }
      
      // Check regex patterns
      if (/wasm-function\[\d+\]/.test(str)) return true;
      if (/<\?>\s*\.\s*wasm/.test(str)) return true;
      if (/figma\.com.*devtools/.test(str)) return true;
      if (/figma\.com.*webpack/.test(str)) return true;
      if (str.match(/\[\d+\]@\[wasm code\]/)) return true;
      if (str.match(/@https:\/\/www\.figma\.com\/webpack-artifacts/)) return true;
      
      return false;
    } catch {
      return false;
    }
  };

  // Store original console methods
  const _originalError = console.error;
  const _originalWarn = console.warn;
  const _originalLog = console.log;
  const _originalInfo = console.info;
  const _originalDebug = console.debug;

  // Create filtered console method
  const createFilteredConsole = (original: Function) => {
    return function(...args: any[]) {
      // Fast path: check if any argument contains WASM-related content
      for (const arg of args) {
        if (suppressWasmError(arg)) return;
        if (arg?.stack && suppressWasmError(arg.stack)) return;
        if (arg?.message && suppressWasmError(arg.message)) return;
      }
      
      // Call original if not suppressed
      original.apply(console, args);
    };
  };

  // Override console methods
  console.error = createFilteredConsole(_originalError);
  console.warn = createFilteredConsole(_originalWarn);
  console.log = createFilteredConsole(_originalLog);
  console.info = createFilteredConsole(_originalInfo);
  console.debug = createFilteredConsole(_originalDebug);

  // Global error handler
  const originalOnError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    if (
      suppressWasmError(message) ||
      suppressWasmError(source) ||
      suppressWasmError(error?.stack)
    ) {
      return true; // Prevent default
    }
    
    if (originalOnError) {
      return originalOnError.call(window, message, source, lineno, colno, error);
    }
    return false;
  };

  // Error event listener (capture phase)
  window.addEventListener('error', (event) => {
    if (
      suppressWasmError(event.message) ||
      suppressWasmError(event.filename) ||
      suppressWasmError(event.error?.stack)
    ) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
  }, true);

  // Unhandled promise rejections
  const originalOnRejection = window.onunhandledrejection;
  window.onunhandledrejection = function(event: PromiseRejectionEvent) {
    if (
      suppressWasmError(event.reason) ||
      suppressWasmError(event.reason?.stack)
    ) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      return;
    }
    
    if (originalOnRejection) {
      return originalOnRejection.call(window, event);
    }
  };

  // Additional unhandledrejection listener
  window.addEventListener('unhandledrejection', (event) => {
    if (
      suppressWasmError(event.reason) ||
      suppressWasmError(event.reason?.stack)
    ) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
  }, true);

  // Block network requests to devtools_worker
  try {
    const originalFetch = window.fetch;
    window.fetch = function(...args: any[]) {
      const url = String(args[0] || '');
      if (url.includes('devtools_worker') || url.includes('webpack-artifacts')) {
        return Promise.reject(new Error('Blocked'));
      }
      return originalFetch.apply(window, args as any);
    };
  } catch {
    // Ignore
  }

  // Block XMLHttpRequest to devtools_worker
  try {
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...rest: any[]) {
      const urlStr = String(url);
      if (urlStr.includes('devtools_worker') || urlStr.includes('webpack-artifacts')) {
        return;
      }
      return originalXHROpen.call(this, method, url, ...rest);
    };
  } catch {
    // Ignore
  }

  // Disable React DevTools hook to prevent WASM worker loading
  try {
    // Define a dummy hook before React DevTools tries to inject
    Object.defineProperty(window, '__REACT_DEVTOOLS_GLOBAL_HOOK__', {
      configurable: false,
      enumerable: false,
      get() {
        return {
          supportsFiber: true,
          renderers: new Map(),
          onCommitFiberRoot: () => {},
          onCommitFiberUnmount: () => {},
          inject: () => {},
          checkDCE: () => {},
        };
      },
    });
  } catch {
    // If already defined, try to modify it
    try {
      const hook = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
      if (hook && typeof hook === 'object') {
        hook.checkDCE = () => {};
        if (hook.inject) {
          const originalInject = hook.inject;
          hook.inject = function(...args: any[]) {
            try {
              return originalInject.apply(this, args);
            } catch (error) {
              if (!suppressWasmError(error)) {
                throw error;
              }
            }
          };
        }
      }
    } catch {
      // Ignore
    }
  }

  // Monitor and re-apply filters periodically
  setInterval(() => {
    try {
      if (console.error.toString().includes('native')) {
        console.error = createFilteredConsole(_originalError);
      }
      if (console.warn.toString().includes('native')) {
        console.warn = createFilteredConsole(_originalWarn);
      }
    } catch {
      // Ignore
    }
  }, 1000);

})();

export {};
