import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { ZodError } from 'zod';
import { config } from './config.js';
import { authRouter } from './routes/auth.js';
import { productsRouter } from './routes/products.js';
import { settingsRouter } from './routes/settings.js';
import { adminRouter } from './routes/admin.js';
import { imagesRouter } from './routes/images.js';
import { requireSameOrigin } from './middleware/auth.js';
import { bootstrap } from './bootstrap.js';

const app = express();
if (config.isProduction) app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: config.clientOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 60_000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false }));
app.use(session({
  name: 'kline.sid', secret: config.sessionSecret, resave: false, saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: config.mongoUri, collectionName: 'sessions', ttl: 60 * 60 * 24 * 7 }),
  cookie: { httpOnly: true, secure: config.isProduction, sameSite: config.isProduction ? 'lax' : 'lax', maxAge: 1000 * 60 * 60 * 24 * 7 }
}));
app.use(requireSameOrigin);
app.get('/api/health', (_req,res)=>res.json({ok:true}));
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/admin', adminRouter);
// uploaded product images: served from MongoDB GridFS, written via /api/admin/upload
app.use('/api/images', imagesRouter);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(__dirname, '../dist');
if (config.isProduction) {
  app.use(express.static(dist));
  app.get('*', (_req,res)=>res.sendFile(path.join(dist,'index.html')));
}
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err instanceof ZodError) return res.status(400).json({ error: 'Invalid input', details: err.flatten() });
  if (err?.code === 11000) return res.status(409).json({ error: 'A record with that identifier already exists' });
  if (err?.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'File too large' });
  // Body-parser and multer errors carry their own HTTP status (400/413/...).
  const status = err?.status || err?.statusCode;
  if (Number.isInteger(status) && status >= 400 && status < 500) return res.status(status).json({ error: status === 413 ? 'Request too large' : 'Invalid request' });
  res.status(500).json({ error: 'Internal server error' });
});

await mongoose.connect(config.mongoUri);
await bootstrap();
app.listen(config.port, ()=>console.log(`K-Line server listening on http://localhost:${config.port}`));
