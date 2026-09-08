import { sharp } from './image-processor.ts';
import {
  readBoundedBytes,
  readBoundedJson,
  PayloadTooLarge,
} from './read-json.ts';
import { MAX_TOTAL_PHOTO_BYTES, photoSelectionError } from './photo-limits.ts';

export class PhotoError extends Error {}
export type PhotoAttachment = {
  filename: string;
  contentType: string;
  content: Buffer;
};

export async function readPickupRequest(
  request: Request,
): Promise<{ input: unknown; files: File[] }> {
  const type = request.headers.get('content-type') || '';
  if (type.split(';')[0].trim() === 'application/json')
    return { input: await readBoundedJson(request), files: [] };
  if (!type.startsWith('multipart/form-data;'))
    throw new SyntaxError('Unsupported request format');
  const bytes = await readBoundedBytes(request, MAX_TOTAL_PHOTO_BYTES + 100000);
  const form = await new Response(bytes, {
    headers: { 'Content-Type': type },
  }).formData();
  if (
    Array.from(form.keys()).some(
      (key) => key !== 'request' && key !== 'photos',
    ) ||
    form.getAll('request').length !== 1
  )
    throw new SyntaxError('Invalid fields');
  const data = form.get('request');
  if (typeof data !== 'string') throw new SyntaxError('Missing request');
  if (new TextEncoder().encode(data).byteLength > 20000)
    throw new PayloadTooLarge();
  const files = form.getAll('photos');
  if (files.some((file) => !(file instanceof File)))
    throw new PhotoError('Please choose image files to upload.');
  const error = photoSelectionError(files as File[]);
  if (error) throw new PhotoError(error);
  return { input: JSON.parse(data), files: files as File[] };
}

export async function preparePhotos(files: File[]): Promise<PhotoAttachment[]> {
  const error = photoSelectionError(files);
  if (error) throw new PhotoError(error);
  const attachments: PhotoAttachment[] = [];
  // Process one image at a time and cap decoded pixels, including tiny compressed bombs.
  for (const file of files) {
    try {
      const source = Buffer.from(await file.arrayBuffer());
      const options = {
        limitInputPixels: 40000000,
        failOn: 'warning' as const,
      };
      const metadata = await sharp(source, options).metadata();
      const expected = {
        'image/jpeg': 'jpeg',
        'image/png': 'png',
        'image/webp': 'webp',
      }[file.type];
      if (metadata.format !== expected || (metadata.pages || 1) > 1)
        throw new Error('Unsupported image');
      const content = await sharp(source, options)
        .rotate()
        .resize({
          width: 2000,
          height: 2000,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .flatten({ background: '#ffffff' })
        .jpeg({ quality: 82 })
        .toBuffer();
      // Sharp strips metadata by default. Only newly encoded pixels leave the server.
      attachments.push({
        filename: `pickup-photo-${attachments.length + 1}.jpg`,
        contentType: 'image/jpeg',
        content,
      });
    } catch {
      throw new PhotoError(
        'One photo could not be read. Use a non-animated JPG, PNG, or WebP under 40 megapixels, or remove it and try again.',
      );
    }
  }
  return attachments;
}
