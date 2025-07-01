
/**
 * Sanitizes a filename to ensure it's valid for Supabase Storage
 * Removes special characters, converts spaces to hyphens, and ensures ASCII-only characters
 */
export const sanitizeFilename = (filename: string): string => {
  // Get the file extension
  const lastDotIndex = filename.lastIndexOf('.');
  const name = lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename;
  const extension = lastDotIndex > 0 ? filename.substring(lastDotIndex) : '';
  
  // Sanitize the name part
  const sanitizedName = name
    // Replace special characters and spaces with hyphens
    .replace(/[^\w\-_.]/g, '-')
    // Replace multiple consecutive hyphens with single hyphen
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Limit length to prevent overly long filenames
    .substring(0, 100);
  
  // Return sanitized filename with extension
  return sanitizedName + extension.toLowerCase();
};
