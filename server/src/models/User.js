import mongoose from 'mongoose';

const progressEntrySchema = new mongoose.Schema({
  bestStars: { type: Number, default: 0, min: 0, max: 3 },
  bestMoves: { type: Number, default: 0, min: 0 },
  bestScore: { type: Number, default: 0, min: 0 }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  coins: { type: Number, default: 0, min: 0 },
  currentLevel: { type: Number, default: 1, min: 1, max: 50 },
  totalScore: { type: Number, default: 0, min: 0 },
  totalStars: { type: Number, default: 0, min: 0 },
  completedLevels: { type: [Number], default: [] },
  rewardedAdsWatched: { type: Number, default: 0, min: 0 },
  ownedSkins: { type: [String], default: ['emerald'] },
  levelProgress: { type: Map, of: progressEntrySchema, default: {} },
  achievements: { type: [String], default: [] },
  settings: { type: mongoose.Schema.Types.Mixed, default: {} },
  dailyRewardClaimedAt: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
