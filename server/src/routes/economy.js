import { Router } from 'express';
import { ECONOMY_CONFIG } from '../config/gameConfig.js';
import { requireAuth } from '../middleware/auth.js';
import RewardTransaction from '../models/RewardTransaction.js';
import WalletTransaction from '../models/WalletTransaction.js';
import User from '../models/User.js';
const router = Router();
router.get('/config', (_req, res) => res.json(ECONOMY_CONFIG));
router.get('/balance', requireAuth, async (req, res, next) => { try { const user = await User.findById(req.user.sub).select('coins'); res.json({ coins: user?.coins ?? 0 }); } catch (e) { next(e); } });
router.get('/history', requireAuth, async (req, res, next) => { try { const items = await RewardTransaction.find({ userId: req.user.sub }).sort({ createdAt: -1 }).limit(100).lean(); res.json({ items }); } catch (e) { next(e); } });
router.post('/ad/opportunity', requireAuth, async (req, res, next) => {
  try {
    const allowed = ['REVIVE','HINT','DOUBLE_SCORE','DOUBLE_COINS','EXTRA_MOVES','BOOSTER'];
    const placement = String(req.body.placement || ''); if (!allowed.includes(placement)) return res.status(400).json({ error: 'Unsupported reward placement' });
    const sinceDay = new Date(); sinceDay.setHours(0,0,0,0);
    const count = await RewardTransaction.countDocuments({ userId: req.user.sub, source: 'REWARDED_AD', createdAt: { $gte: sinceDay }, status: { $in: ['REQUESTED','VERIFIED','GRANTED'] } });
    if (count >= ECONOMY_CONFIG.maxRewardedAdsPerDay) return res.status(429).json({ error: 'Daily rewarded-ad limit reached' });
    const recent = await RewardTransaction.findOne({ userId: req.user.sub, source: 'REWARDED_AD', createdAt: { $gte: new Date(Date.now() - ECONOMY_CONFIG.minSecondsBetweenRewardedAds * 1000) }, status: { $in: ['REQUESTED','VERIFIED','GRANTED'] } });
    if (recent) return res.status(429).json({ error: 'Please wait before requesting another reward' });
    const tx = await RewardTransaction.create({ userId: req.user.sub, gameId: process.env.GAME_NAME || 'APPLE WORM ADVENTURE', type: placement, source: 'REWARDED_AD', amount: 0, status: 'REQUESTED' });
    res.status(201).json({ opportunityId: tx._id, placement, status: tx.status, expiresInSeconds: 120, providerMode: process.env.ALLOW_DEMO_ADS === 'true' && process.env.NODE_ENV !== 'production' ? 'DEMO_ONLY' : 'PROVIDER_REQUIRED' });
  } catch (e) { next(e); }
});
// Intentionally does not grant rewards. A real provider's signed server-to-server callback must verify the event.
router.post('/ad/verify', requireAuth, async (req, res) => {
  if (process.env.ALLOW_DEMO_ADS !== 'true' || process.env.NODE_ENV === 'production') return res.status(501).json({ error: 'Connect a real ad provider server-side verification callback before enabling reward claims.' });
  return res.status(501).json({ error: 'Demo provider verification is intentionally not implemented as a fake ad completion. No reward was granted.' });
});
router.post('/ad/claim', requireAuth, async (_req, res) => res.status(403).json({ error: 'Rewards can only be claimed after a provider-verified event.' }));
export default router;
