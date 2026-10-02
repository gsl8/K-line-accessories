import bcrypt from 'bcryptjs';
import { Admin } from './models/Admin.js';
import { Settings } from './models/Settings.js';
import { config } from './config.js';
import seed from './seed-data.json' with { type: 'json' };
import { Product } from './models/Product.js';

export async function bootstrap() {
  if (!await Admin.exists({})) {
    const passwordHash = await bcrypt.hash(config.adminPassword, 12);
    await Admin.create({ email: config.adminEmail, passwordHash });
    console.log(`[bootstrap] created admin ${config.adminEmail}`);
  }
  if (!await Settings.exists({ singleton: 'store' })) await Settings.create({ ...seed.settings, singleton: 'store' });
  // Demo catalog removed: no products are seeded on fresh installations.
  if (Array.isArray(seed.products) && seed.products.length) {
    await Product.insertMany(seed.products, { ordered: false });
    console.log(`[bootstrap] seeded ${seed.products.length} products`);
  }
}
