import mongoose from 'mongoose';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { requireAuth } from '../middleware/auth.js';
import User from '../models/User.js';
import RewardTransaction from '../models/RewardTransaction.js';
import WalletTransaction from '../models/WalletTransaction.js';

const router = Router();

// Default demo hall of fame gardeners for leaderboard vibrancy
const DEMO_LEADERBOARD = [
  { rank: 1, name: 'Khushi the Sage', currentLevel: 50, totalStars: 150, totalScore: 8420, completedCount: 50, badge: '👑 Master Gardener' },
  { rank: 2, name: 'Aria Slither', currentLevel: 47, totalStars: 138, totalScore: 7850, completedCount: 47, badge: '🌟 Puzzle Prodigy' },
  { rank: 3, name: 'Bramble Bob', currentLevel: 42, totalStars: 121, totalScore: 6920, completedCount: 42, badge: '🌿 Flora Navigator' },
  { rank: 4, name: 'Zephyr Worm', currentLevel: 36, totalStars: 104, totalScore: 5740, completedCount: 36, badge: '💎 Cavern Seeker' },
  { rank: 5, name: 'Clover Knight', currentLevel: 30, totalStars: 88, totalScore: 4890, completedCount: 30, badge: '🛡️ Maze Runner' },
  { rank: 6, name: 'Pip the Speedy', currentLevel: 25, totalStars: 72, totalScore: 3950, completedCount: 25, badge: '🍎 Apple Chaser' },
  { rank: 7, name: 'Mossy Marvel', currentLevel: 18, totalStars: 52, totalScore: 2840, completedCount: 18, badge: '🌱 Meadow Scout' }
];

// GET /api/player/leaderboard - Top gardeners across the realm
router.get('/leaderboard', async (req, res, next) => {
  try {
    let currentUserId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
        currentUserId = decoded.sub;
      } catch {
        // Continue as unauthenticated guest
      }
    }

    let users = [];
    if (mongoose.connection.readyState === 1) {
      try {
        users = await User.find({})
          .select('name currentLevel totalStars totalScore completedLevels')
          .sort({ totalStars: -1, totalScore: -1, currentLevel: -1 })
          .limit(30)
          .lean();
      } catch {
        users = [];
      }
    }

    let leaderboard = [];

    if (users && users.length > 0) {
      leaderboard = users.map((u, idx) => ({
        rank: idx + 1,
        id: String(u._id),
        name: u.name,
        currentLevel: u.currentLevel || 1,
        totalStars: u.totalStars || 0,
        totalScore: u.totalScore || 0,
        completedCount: u.completedLevels ? u.completedLevels.length : 0,
        isMe: currentUserId && String(u._id) === String(currentUserId)
      }));
    } else {
      leaderboard = DEMO_LEADERBOARD.map(entry => ({ ...entry, isMe: false }));
    }

    // Determine current user's rank
    let myRank = null;
    if (currentUserId) {
      const foundIdx = leaderboard.findIndex(entry => entry.id === String(currentUserId));
      if (foundIdx !== -1) {
        myRank = leaderboard[foundIdx];
      } else if (mongoose.connection.readyState === 1) {
        try {
          const user = await User.findById(currentUserId).lean();
          if (user) {
            const higherCount = await User.countDocuments({
              $or: [
                { totalStars: { $gt: user.totalStars } },
                { totalStars: user.totalStars, totalScore: { $gt: user.totalScore } }
              ]
            });
            myRank = {
              rank: higherCount + 1,
              id: String(user._id),
              name: user.name,
              currentLevel: user.currentLevel || 1,
              totalStars: user.totalStars || 0,
              totalScore: user.totalScore || 0,
              completedCount: user.completedLevels ? user.completedLevels.length : 0,
              isMe: true
            };
          }
        } catch {
          // Ignore
        }
      }
    }

    res.json({
      leaderboard,
      myRank,
      totalPlayers: Math.max(leaderboard.length, 50)
    });
  } catch (e) {
    next(e);
  }
});

// GET /api/player/dashboard
router.get('/dashboard', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.sub).select('-passwordHash').lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    const rewards = await RewardTransaction.countDocuments({ userId: req.user.sub, status: 'GRANTED' });
    res.json({ user, rewardedAdsWatched: rewards });
  } catch (e) {
    next(e);
  }
});

// GET /api/player/wallet/history
router.get('/wallet/history', requireAuth, async (req, res, next) => {
  try {
    const items = await WalletTransaction.find({ userId: req.user.sub })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    res.json({ items });
  } catch (e) {
    next(e);
  }
});

// POST /api/player/wallet/spend - Spend coins on boosters/hints
router.post('/wallet/spend', requireAuth, async (req, res, next) => {
  try {
    const amount = Number(req.body.amount);
    const item = String(req.body.item || 'BOOSTER');

    if (!Number.isInteger(amount) || amount <= 0 || amount > 1000) {
      return res.status(400).json({ error: 'Invalid spend amount' });
    }

    const user = await User.findById(req.user.sub);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.coins < amount) {
      return res.status(400).json({ error: 'Insufficient coin balance' });
    }

    const balanceBefore = user.coins;
    user.coins -= amount;
    const balanceAfter = user.coins;

    await WalletTransaction.create({
      userId: user._id,
      type: 'DEBIT',
      amount,
      balanceBefore,
      balanceAfter,
      source: 'BOOSTER_PURCHASE',
      referenceId: `purchase-${item}-${Date.now()}`
    });

    await user.save();

    res.json({
      success: true,
      coins: user.coins,
      spent: amount,
      item
    });
  } catch (e) {
    next(e);
  }
});

// POST /api/player/progress - Save level progress, award stars & first-time coins
router.post('/progress', requireAuth, async (req, res, next) => {
  try {
    const levelId = Number(req.body.levelId);
    const score = Number(req.body.score);
    const moves = Number(req.body.moves);
    const stars = Number(req.body.stars);

    if (
      !Number.isInteger(levelId) || levelId < 1 || levelId > 50 ||
      !Number.isFinite(score) || score < 0 || score > 100000 ||
      !Number.isInteger(moves) || moves < 1 || moves > 1000 ||
      !Number.isInteger(stars) || stars < 0 || stars > 3
    ) {
      return res.status(400).json({ error: 'Progress payload failed validation' });
    }

    const user = await User.findById(req.user.sub);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Ensure sequential progression (can replay completed levels or play the active level)
    if (levelId > user.currentLevel) {
      return res.status(409).json({ error: 'Complete levels sequentially' });
    }

    const firstCompletion = !user.completedLevels.includes(levelId);
    if (firstCompletion) {
      user.completedLevels.push(levelId);
    }

    user.totalScore += Math.min(score, 5000);
    user.totalStars = Math.min(150, user.totalStars + (firstCompletion ? stars : 0));
    user.currentLevel = Math.min(50, Math.max(user.currentLevel, levelId + (firstCompletion ? 1 : 0)));

    if (firstCompletion) {
      const before = user.coins;
      user.coins += 25;
      await WalletTransaction.create({
        userId: user._id,
        type: 'CREDIT',
        amount: 25,
        balanceBefore: before,
        balanceAfter: user.coins,
        source: 'LEVEL_REWARD',
        referenceId: `level-${levelId}`
      });
    }

    await user.save();

    res.json({
      currentLevel: user.currentLevel,
      coins: user.coins,
      totalScore: user.totalScore,
      totalStars: user.totalStars,
      completedLevels: user.completedLevels
    });
  } catch (e) {
    next(e);
  }
});

export default router;
