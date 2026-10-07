import { Router } from 'express';
import mongoose from 'mongoose';
import { getBucket } from '../lib/images.js';

export const imagesRouter = Router();

imagesRouter.get('/:id', async (req, res, next) => {
  try {
    if (!/^[a-f0-9]{24}$/i.test(req.params.id)) {
      return res.status(404).json({ error: 'Image not found' });
    }
    const bucket = await getBucket();
    const _id = new mongoose.Types.ObjectId(req.params.id);
    const files = await bucket.find({ _id }).limit(1).toArray();
    const file = files[0];
    if (!file) return res.status(404).json({ error: 'Image not found' });

    res.setHeader('Content-Type', file.contentType || 'application/octet-stream');
    res.setHeader('Content-Length', String(file.length));
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    if (file.uploadDate) res.setHeader('Last-Modified', new Date(file.uploadDate).toUTCString());
    bucket.openDownloadStream(file._id).pipe(res);
  } catch (e) {
    next(e);
  }
});
