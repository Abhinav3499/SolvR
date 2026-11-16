import LZString from 'lz-string';

/**
 * Compresses a raw string into a URI-safe encoded component suitable for URL hash parameters.
 */
export function compressPayload(raw: string): string {
  if (!raw) return '';
  return LZString.compressToEncodedURIComponent(raw) || '';
}

/**
 * Decompresses an encoded component back into the raw UTF-8 string.
 */
export function decompressPayload(compressed: string): string {
  if (!compressed) return '';
  return LZString.decompressFromEncodedURIComponent(compressed) || '';
}
