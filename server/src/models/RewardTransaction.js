import mongoose from 'mongoose';
const rewardTransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  gameId: { type: String, required: true }, sessionId: { type: String, default: null },
  type: { type: String, required: true, enum: ['LEVEL_REWARD','DOUBLE_COINS','DOUBLE_SCORE','HINT','REVIVE','EXTRA_MOVES','BOOSTER'] },
  source: { type: String, required: true, enum: ['GAMEPLAY','REWARDED_AD','ADMIN'] },
  amount: { type: Number, required: true, min: 0 }, multiplier: { type: Number, default: 1 },
  adProvider: { type: String, default: null }, adEventId: { type: String, default: null, unique: true, sparse: true },
  status: { type: String, required: true, enum: ['REQUESTED','VERIFIED','GRANTED','REJECTED','EXPIRED'], default: 'REQUESTED' }
}, { timestamps: true });
export default mongoose.model('RewardTransaction', rewardTransactionSchema);
