/**
 * EXPERIMENTAL — ML-Guided replacement policy abstraction.
 *
 * This is a lightweight deterministic demonstration, not a real ML model.
 * It must never be mixed with classical measured results.
 */

export interface MLFeatures {
  recency: number;
  lifetimeFrequency: number;
  recentWindowFrequency: number;
  reuseBehaviour: number;
}

export interface MLPrediction {
  reuseProbability: number;
  suggestedVictim: number | null;
  predictionConfidence: number;
}

export function extractFeatures(
  item: number,
  _cacheState: number[],
  accessHistory: number[],
  windowSize: number = 10,
): MLFeatures {
  const lastIndex = accessHistory.lastIndexOf(item);
  const recency = lastIndex >= 0 ? accessHistory.length - 1 - lastIndex : Infinity;

  const lifetimeFrequency = accessHistory.filter((a) => a === item).length;

  const window = accessHistory.slice(-windowSize);
  const recentWindowFrequency = window.filter((a) => a === item).length;

  let reuseCount = 0;
  let lastSeen = -1;
  for (let i = 0; i < accessHistory.length; i++) {
    if (accessHistory[i] === item) {
      if (lastSeen >= 0) reuseCount++;
      lastSeen = i;
    }
  }
  const reuseBehaviour =
    lifetimeFrequency > 1 ? reuseCount / (lifetimeFrequency - 1) : 0;

  return { recency, lifetimeFrequency, recentWindowFrequency, reuseBehaviour };
}

export function predictReuse(features: MLFeatures): number {
  const recencyScore = features.recency === Infinity ? 0 : 1 / (1 + features.recency);
  const freqScore = Math.min(features.lifetimeFrequency / 10, 1);
  const recentScore = Math.min(features.recentWindowFrequency / 5, 1);
  const reuseScore = features.reuseBehaviour;

  return 0.3 * recencyScore + 0.25 * freqScore + 0.25 * recentScore + 0.2 * reuseScore;
}

export function suggestVictim(
  cacheState: number[],
  accessHistory: number[],
): MLPrediction {
  if (cacheState.length === 0) {
    return { reuseProbability: 0, suggestedVictim: null, predictionConfidence: 0 };
  }

  let lowestProb = Infinity;
  let victim = cacheState[0];

  for (const item of cacheState) {
    const features = extractFeatures(item, cacheState, accessHistory);
    const prob = predictReuse(features);
    if (prob < lowestProb) {
      lowestProb = prob;
      victim = item;
    }
  }

  const confidence = cacheState.length > 1 ? Math.min(0.5 + accessHistory.length / 200, 0.95) : 0.5;

  return {
    reuseProbability: Math.round(lowestProb * 100),
    suggestedVictim: victim,
    predictionConfidence: Math.round(confidence * 100) / 100,
  };
}
