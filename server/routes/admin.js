import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import multer from 'multer';
import { Router } from 'express';
import { z } from 'zod';
import { Product } from '../models/Product.js';
import { requireAdmin } from '../middleware/auth.js';
import { uploadsDir, deleteUpload } from '../lib/uploads.js';

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const ext = (path.extname(file.originalname) || '.jpg').toLowerCase();
      cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
    }
  }),
  limits: { fileSize: 8 * 1024 * 1024, files: 10 },
  fileFilter: (_req, file, cb) => {
    // Trust neither mimetype nor extension alone: both must agree on an image type.
    const ext = (path.extname(file.originalname) || '').toLowerCase();
    const okMime = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
    const okExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
    if (okMime && okExt) return cb(null, true);
    const err = new Error('Only JPG, PNG or WebP images are allowed');
    err.status = 400;
    cb(err, false);
  }
});

export const adminRouter = Router();
adminRouter.use(requireAdmin);

const spec = z.object({ label: z.string().max(300), value: z.string().max(500) });
const productSchema = z.object({
  id: z.string().min(1).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(1).max(160),
  reference: z.string().max(80).optional().default(''),
  category: z.string().min(1).max(60),
  price: z.number().nonnegative(),
  compareAtPrice: z.number().nonnegative().nullable().optional(),
  material: z.string().max(160).optional().default(''),
  shortDescription: z.string().max(500).optional().default(''),
  description: z.string().max(6000).optional().default(''),
  highlights: z.array(z.string().max(300)).max(30).optional().default([]),
  specs: z.array(spec).max(40).optional().default([]),
  sizes: z.array(z.string().max(40)).max(50).optional().default([]),
  images: z.array(z.string().max(2000)).max(40),
  status: z.enum(['available', 'sold_out', 'hidden']).optional().default('available'),
  isNew: z.boolean().optional().default(false),
  isBestseller: z.boolean().optional().default(false)
});
const statusSchema = z.object({ status: z.enum(['available', 'sold_out', 'hidden']) });

// NOTE: multer must run before same-origin/JSON routes are relevant; it is mounted
// from index.js ahead of requireSameOrigin for multipart requests.
adminRouter.post('/upload', upload.array('images', 10), (req, res) => {
  const files = (req.files ?? []).map((f) => `/uploads/${f.filename}`);
  if (!files.length) return res.status(400).json({ error: 'No images received' });
  res.status(201).json({ images: files });
});

function cleanupUploaded(req) {
  for (const f of req.files ?? []) deleteUpload(f.filename);
}

adminRouter.post('/products', upload.none(), async (req, res, next) => {
  try {
    const body = productSchema.parse(JSON.parse(req.body.payload));
    const exists = await Product.exists({ id: body.id });
    if (exists) return res.status(409).json({ error: 'A product with that reference already exists' });
    res.status(201).json(await Product.create(body));
  } catch (e) { if (req.files?.length) cleanupUploaded(req); next(e); }
});

adminRouter.put('/products/:id', upload.none(), async (req, res, next) => {
  try {
    const body = productSchema.parse(JSON.parse(req.body.payload));
    const current = await Product.findOne({ id: req.params.id });
    if (!current) { cleanupUploaded(req); return res.status(404).json({ error: 'Product not found' }); }
    // remove uploaded files that are no longer referenced by any product
    const removed = current.images.filter((img) => !body.images.includes(img));
    const stillUsed = await Product.countDocuments({ images: { $in: removed }, id: { $ne: current.id } });
    for (const img of removed) if (!stillUsed) deleteUpload(img);
    const updated = await Product.findOneAndUpdate({ id: req.params.id }, body, { new: true, runValidators: true });
    res.json(updated);
  } catch (e) { if (req.files?.length) cleanupUploaded(req); next(e); }
});

adminRouter.post('/products/:id/duplicate', async (req, res, next) => {
  try {
    const source = await Product.findOne({ id: req.params.id });
    if (!source) return res.status(404).json({ error: 'Product not found' });
    const baseId = `${source.id}-copy`;
    let id = baseId, n = 2;
    while (await Product.exists({ id })) id = `${baseId}-${n++}`;
    const doc = source.toJSON();
    delete doc.createdAt; delete doc.updatedAt;
    res.status(201).json(await Product.create({ ...doc, id, name: `${source.name} (copy)`, status: 'hidden' }));
  } catch (e) { next(e); }
});

adminRouter.patch('/products/:id/status', async (req, res, next) => {
  try {
    const { status } = statusSchema.parse(req.body);
    const updated = await Product.findOneAndUpdate({ id: req.params.id }, { status }, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  } catch (e) { next(e); }
});

adminRouter.delete('/products/:id', async (req, res, next) => {
  try {
    const removed = await Product.findOneAndDelete({ id: req.params.id });
    if (!removed) return res.status(404).json({ error: 'Product not found' });
    const stillUsed = await Product.countDocuments({ images: { $in: removed.images } });
    if (!stillUsed) for (const img of removed.images) deleteUpload(img);
    res.status(204).end();
  } catch (e) { next(e); }
});
