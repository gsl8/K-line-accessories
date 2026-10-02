import { Router } from 'express';
import { z } from 'zod';
import { Settings } from '../models/Settings.js';
import { requireAdmin } from '../middleware/auth.js';
export const settingsRouter = Router();
const schema = z.object({
  brandName: z.string().min(1).max(120),
  tagline: z.string().max(240),
  whatsappNumber: z.string().min(7).max(32),
  whatsappGreeting: z.string().max(300),
  instagramHandle: z.string().max(120),
  location: z.string().max(300),
  categories: z.array(z.string().min(1).max(60)).max(24)
});
settingsRouter.get('/', async (_req,res,next)=>{try{res.json(await Settings.findOne({singleton:'store'}));}catch(e){next(e)}});
settingsRouter.put('/', requireAdmin, async (req,res,next)=>{try{const body=schema.parse(req.body);res.json(await Settings.findOneAndUpdate({singleton:'store'},{...body,singleton:'store'},{new:true,upsert:true,runValidators:true}));}catch(e){next(e)}});
