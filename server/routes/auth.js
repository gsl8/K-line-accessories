import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { Admin } from '../models/Admin.js';

export const authRouter = Router();
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-7', legacyHeaders: false });
// Identifier can be an email or a plain username (e.g. "kachow304"); stored lowercased.
const loginSchema = z.object({ email: z.string().min(3).max(120).trim(), password: z.string().min(8).max(200) });
const passwordSchema = z.object({ currentPassword: z.string().min(8).max(200), newPassword: z.string().min(10).max(200) });

authRouter.get('/me', async (req, res) => {
  if (!req.session.adminId) return res.json({ authenticated: false });
  const admin = await Admin.findById(req.session.adminId).select('email').lean();
  if (!admin) return res.json({ authenticated: false });
  res.json({ authenticated: true, email: admin.email });
});

authRouter.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const admin = await Admin.findOne({ email: body.email.toLowerCase() });
    if (!admin || !(await bcrypt.compare(body.password, admin.passwordHash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    await new Promise((resolve, reject) => req.session.regenerate(err => err ? reject(err) : resolve()));
    req.session.adminId = admin.id;
    await new Promise((resolve, reject) => req.session.save(err => err ? reject(err) : resolve()));
    res.json({ authenticated: true, email: admin.email });
  } catch (err) { next(err); }
});

authRouter.post('/logout', async (req, res, next) => {
  try {
    await new Promise((resolve, reject) => req.session.destroy(err => err ? reject(err) : resolve()));
    res.clearCookie('kline.sid');
    res.status(204).end();
  } catch (err) { next(err); }
});

// Change the signed-in admin's password: verify current, store bcrypt hash, done.
authRouter.patch('/password', loginLimiter, async (req, res, next) => {
  try {
    if (!req.session?.adminId) return res.status(401).json({ error: 'Authentication required' });
    const body = passwordSchema.parse(req.body);
    const admin = await Admin.findById(req.session.adminId);
    if (!admin) return res.status(401).json({ error: 'Authentication required' });
    if (!(await bcrypt.compare(body.currentPassword, admin.passwordHash))) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    admin.passwordHash = await bcrypt.hash(body.newPassword, 12);
    await admin.save();
    res.json({ ok: true });
  } catch (err) { next(err); }
});
