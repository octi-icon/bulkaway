export class PayloadTooLarge extends Error {}
export async function readBoundedBytes(
  request: Request,
  limit = 20000,
): Promise<Uint8Array<ArrayBuffer>> {
  if (Number(request.headers.get('content-length') || 0) > limit)
    throw new PayloadTooLarge();
  if (!request.body) throw new SyntaxError('Empty request');
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        throw new PayloadTooLarge();
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}
export async function readBoundedJson(
  request: Request,
  limit = 20000,
): Promise<unknown> {
  return JSON.parse(
    new TextDecoder().decode(await readBoundedBytes(request, limit)),
  );
}
