import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import User from '../models/User.js';
import RewardTransaction from '../models/RewardTransaction.js';
import WalletTransaction from '../models/WalletTransaction.js';
const router = Router();
router.get('/dashboard', requireAuth, async (req, res, next) => { try { const user = await User.findById(req.user.sub).select('-passwordHash').lean(); const rewards = await RewardTransaction.countDocuments({ userId: req.user.sub, status: 'GRANTED' }); res.json({ user, rewardedAdsWatched: rewards }); } catch (e) { next(e); } });
router.get('/wallet/history', requireAuth, async (req, res, next) => { try { const items = await WalletTransaction.find({ userId: req.user.sub }).sort({ createdAt: -1 }).limit(100).lean(); res.json({ items }); } catch (e) { next(e); } });
router.post('/progress', requireAuth, async (req, res, next) => {
  try {
    const levelId = Number(req.body.levelId); const score = Number(req.body.score); const moves = Number(req.body.moves); const stars = Number(req.body.stars);
    if (!Number.isInteger(levelId) || levelId < 1 || levelId > 50 || !Number.isFinite(score) || score < 0 || score > 100000 || !Number.isInteger(moves) || moves < 1 || moves > 1000 || !Number.isInteger(stars) || stars < 0 || stars > 3) return res.status(400).json({ error: 'Progress payload failed validation' });
    // Production game sessions should be server-simulated before accepting scores; this endpoint only records bounded progress.
    const user = await User.findById(req.user.sub); if (!user) return res.status(404).json({ error: 'User not found' });
    if (levelId > user.currentLevel) return res.status(409).json({ error: 'Complete levels sequentially' });
    const firstCompletion = !user.completedLevels.includes(levelId); if (firstCompletion) user.completedLevels.push(levelId);
    user.totalScore += Math.min(score, 5000); user.totalStars = Math.min(150, user.totalStars + (firstCompletion ? stars : 0)); user.currentLevel = Math.min(50, Math.max(user.currentLevel, levelId + (firstCompletion ? 1 : 0)));
    if (firstCompletion) { const before = user.coins; user.coins += 25; await WalletTransaction.create({ userId: user._id, type: 'CREDIT', amount: 25, balanceBefore: before, balanceAfter: user.coins, source: 'LEVEL_REWARD', referenceId: `level-${levelId}` }); }
    await user.save(); res.json({ currentLevel: user.currentLevel, coins: user.coins, totalScore: user.totalScore, totalStars: user.totalStars, completedLevels: user.completedLevels });
  } catch (e) { next(e); }
});
export default router;
