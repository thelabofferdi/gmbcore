/**
 * Secure Logger Utility
 * Only logs in development mode to prevent information leakage in production
 */

const isDev = process.env.NODE_ENV === 'development' || (typeof window !== 'undefined' && window.location.hostname === 'localhost');

export const logger = {
    /**
     * Log error messages (only in development)
     */
    error: (...args: any[]) => {
        if (isDev) {
            console.error('[ERROR]', ...args);
        }
    },

    /**
     * Log warning messages (only in development)
     */
    warn: (...args: any[]) => {
        if (isDev) {
            console.warn('[WARN]', ...args);
        }
    },

    /**
     * Log info messages (only in development)
     */
    info: (...args: any[]) => {
        if (isDev) {
            console.log('[INFO]', ...args);
        }
    },

    /**
     * Log debug messages (only in development)
     */
    debug: (...args: any[]) => {
        if (isDev) {
            console.debug('[DEBUG]', ...args);
        }
    },

    /**
     * Log table data (only in development)
     */
    table: (data: any) => {
        if (isDev) {
            console.table(data);
        }
    }
};

export default logger;
