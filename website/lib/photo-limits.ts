export const MAX_PHOTOS = 5;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const MAX_TOTAL_PHOTO_BYTES = 10 * 1024 * 1024;
export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export function photoSelectionError(
  files: { size: number; type: string }[],
): string | undefined {
  if (files.length > MAX_PHOTOS) return 'Choose up to 5 photos.';
  if (files.some((file) => !PHOTO_TYPES.includes(file.type)))
    return 'Use JPG, PNG, or WebP photos. Convert HEIC photos to JPG first.';
  if (files.some((file) => !file.size || file.size > MAX_PHOTO_BYTES))
    return 'Each photo must be between 1 byte and 5 MB.';
  if (
    files.reduce((total, file) => total + file.size, 0) > MAX_TOTAL_PHOTO_BYTES
  )
    return 'Keep your photos under 10 MB combined.';
}
