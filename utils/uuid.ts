/**
 * Generates a UUID.
 * Prefers the built-in `crypto.randomUUID()` if available in a secure context.
 * Falls back to a simple random string implementation for non-secure contexts (like file://).
 */
export const generateUUID = (): string => {
    if (crypto && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for non-secure contexts
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
};
