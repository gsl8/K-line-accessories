import 'dotenv/config';

const isProduction = process.env.NODE_ENV === 'production';
const required = ['MONGODB_URI', 'SESSION_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'];
if (isProduction) {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) throw new Error(`Missing required production environment variables: ${missing.join(', ')}`);
}

const portNumber = Number(process.env.PORT);
export const config = {
  port: Number.isFinite(portNumber) && portNumber > 0 ? portNumber : 4000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kline-shop',
  sessionSecret: process.env.SESSION_SECRET || 'dev-only-change-me',
  adminEmail: (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase(),
  adminPassword: process.env.ADMIN_PASSWORD || 'change-me-now',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  isProduction
};
