import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
const safeUser = user => ({ id: user._id, name: user.name, email: user.email, coins: user.coins, currentLevel: user.currentLevel, totalScore: user.totalScore, totalStars: user.totalStars, completedLevels: user.completedLevels || [] });
const tokenFor = user => jwt.sign({ sub: user._id.toString(), email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
router.post('/register', async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim(); const email = String(req.body.email || '').trim().toLowerCase(); const password = String(req.body.password || '');
    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) return res.status(400).json({ error: 'Enter a name, valid email, and password of at least 8 characters.' });
    const passwordHash = await bcrypt.hash(password, 12); const user = await User.create({ name, email, passwordHash });
    res.status(201).json({ token: tokenFor(user), user: safeUser(user) });
  } catch (err) { if (err.code === 11000) return res.status(409).json({ error: 'An account with this email already exists.' }); next(err); }
});
router.post('/login', async (req, res, next) => {
  try { const user = await User.findOne({ email: String(req.body.email || '').trim().toLowerCase() }); if (!user || !(await bcrypt.compare(String(req.body.password || ''), user.passwordHash))) return res.status(401).json({ error: 'Email or password is incorrect.' }); res.json({ token: tokenFor(user), user: safeUser(user) }); }
  catch (err) { next(err); }
});
router.get('/me', requireAuth, async (req, res, next) => { try { const user = await User.findById(req.user.sub); if (!user) return res.status(404).json({ error: 'User not found' }); res.json({ user: safeUser(user) }); } catch (err) { next(err); } });
router.post('/logout', (_req, res) => res.json({ message: 'Logged out. Remove the bearer token on the client.' }));
export default router;
