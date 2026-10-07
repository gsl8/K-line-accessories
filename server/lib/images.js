import crypto from 'node:crypto';
import mongoose from 'mongoose';

let bucketPromise = null;

export function getBucket() {
  if (!bucketPromise) {
    bucketPromise = (async () => {
      if (mongoose.connection.readyState !== 1) throw new Error('MongoDB is not connected');
      return new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'images' });
    })().catch((err) => {
      bucketPromise = null;
      throw err;
    });
  }
  return bucketPromise;
}

export function imageUrl(id) {
  return `/api/images/${id.toString()}`;
}

export async function saveImage(buffer, { contentType, originalName } = {}) {
  const bucket = await getBucket();
  const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
  const stream = bucket.openUploadStream(filename, {
    contentType: contentType || 'application/octet-stream',
    metadata: { originalName: originalName || '' }
  });
  await new Promise((resolve, reject) => {
    stream.once('finish', resolve);
    stream.once('error', reject);
    stream.end(buffer);
  });
  return stream.id;
}

export async function deleteImage(urlOrId) {
  if (!urlOrId) return;
  const value = String(urlOrId);
  const fromUrl = /^\/api\/images\/([a-f0-9]{24})$/i.exec(value);
  const id = fromUrl ? fromUrl[1] : (/^[a-f0-9]{24}$/i.test(value) ? value : null);
  if (!id) return;
  try {
    const bucket = await getBucket();
    await bucket.delete(new mongoose.Types.ObjectId(id));
  } catch (err) {
    console.warn('[images] delete failed:', err?.message || err);
  }
}
