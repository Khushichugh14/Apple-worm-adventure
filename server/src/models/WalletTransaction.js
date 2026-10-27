import mongoose from 'mongoose';
const walletTransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['CREDIT','DEBIT','REVERSAL'], required: true },
  amount: { type: Number, required: true, min: 0 }, balanceBefore: { type: Number, required: true, min: 0 },
  balanceAfter: { type: Number, required: true, min: 0 }, referenceId: { type: String, default: null },
  source: { type: String, enum: ['LEVEL_REWARD','REWARDED_AD','BOOSTER_PURCHASE','DAILY_BONUS','ADMIN'], required: true }
}, { timestamps: true });
export default mongoose.model('WalletTransaction', walletTransactionSchema);
