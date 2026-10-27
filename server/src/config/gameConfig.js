export const GAME_NAME = process.env.GAME_NAME || 'APPLE WORM ADVENTURE';
export const ECONOMY_CONFIG = Object.freeze({
  levelCompletionCoins: 25,
  goldenAppleCoins: 10,
  doubleCoinsMultiplier: 2,
  doubleScoreMultiplier: 2,
  extraMoves: 5,
  maxRewardedAdsPerDay: 10,
  maxRewardedAdsPerSession: 5,
  minSecondsBetweenRewardedAds: 30,
  maxRevivesPerLevel: 1,
  maxDoubleScorePerLevel: 1,
  maxDoubleCoinsPerLevel: 1,
  hintEnabled: true,
  reviveEnabled: true,
  doubleScoreEnabled: true,
  doubleCoinsEnabled: true
});
