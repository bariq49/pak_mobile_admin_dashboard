/**
 * JWT Token Utility Functions
 * Helper functions to decode and extract information from JWT tokens
 */

/**
 * Extract user role from JWT token
 * @param token - JWT token string
 * @returns "admin" | "user" | null
 */
export const getUserRoleFromToken = (token: string | null | undefined): string | null => {
  if (!token) return null;

  try {
    // JWT token structure: header.payload.signature
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    if (!payload) return null;

    // Decode base64 payload
    const decoded = JSON.parse(atob(payload));
    return decoded.role || null;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

/**
 * Extract user ID from JWT token
 * @param token - JWT token string
 * @returns user ID string or null
 */
export const getUserIdFromToken = (token: string | null | undefined): string | null => {
  if (!token) return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    if (!payload) return null;

    const decoded = JSON.parse(atob(payload));
    return decoded.id || decoded._id || decoded.userId || null;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

/**
 * Check if token is expired
 * @param token - JWT token string
 * @returns true if token is expired, false otherwise
 */
export const isTokenExpired = (token: string | null | undefined): boolean => {
  if (!token) return true;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;

    const payload = parts[1];
    if (!payload) return true;

    const decoded = JSON.parse(atob(payload));
    const exp = decoded.exp;

    if (!exp) return false; // No expiration claim

    // exp is in seconds, Date.now() is in milliseconds
    return Date.now() >= exp * 1000;
  } catch (error) {
    console.error("Error checking token expiration:", error);
    return true;
  }
};
