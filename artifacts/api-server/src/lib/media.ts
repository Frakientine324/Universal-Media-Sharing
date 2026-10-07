export const MAX_MEDIA_BYTES = 250 * 1024 * 1024;

const allowedMediaTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);

export function isAllowedMediaType(contentType: string): boolean {
  return allowedMediaTypes.has(contentType.toLowerCase());
}
