import type { WorkloadType } from "./types";

function createSeededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0x100000000;
  };
}

export function generateTrace(
  workload: WorkloadType,
  length: number,
  seed: number = 42,
): number[] {
  switch (workload) {
    case "sequential":
      return generateSequential(length);
    case "random":
      return generateRandom(length, seed);
    case "looping":
      return generateLooping(length);
    case "bursty":
      return generateBursty(length, seed);
    case "frequency-skewed":
      return generateFrequencySkewed(length, seed);
  }
}

function generateSequential(length: number): number[] {
  const trace: number[] = [];
  for (let i = 0; i < length; i++) {
    trace.push(i + 1);
  }
  return trace;
}

function generateRandom(length: number, seed: number): number[] {
  const rng = createSeededRng(seed);
  const range = 20;
  const trace: number[] = [];
  for (let i = 0; i < length; i++) {
    trace.push(Math.floor(rng() * range) + 1);
  }
  return trace;
}

function generateLooping(length: number): number[] {
  const loop = [1, 2, 3, 4];
  const trace: number[] = [];
  for (let i = 0; i < length; i++) {
    trace.push(loop[i % loop.length]);
  }
  return trace;
}

function generateBursty(length: number, seed: number): number[] {
  const rng = createSeededRng(seed);
  const trace: number[] = [];
  let i = 0;

  while (i < length) {
    const burstItem = Math.floor(rng() * 10) + 1;
    const burstLen = Math.min(3 + Math.floor(rng() * 8), length - i);
    for (let j = 0; j < burstLen; j++) {
      const noise = rng() < 0.2 ? Math.floor(rng() * 10) + 11 : burstItem;
      trace.push(noise);
      i++;
    }
  }

  return trace;
}

function generateFrequencySkewed(length: number, seed: number): number[] {
  const rng = createSeededRng(seed);
  const hotItems = [1, 2, 3];
  const coldItems = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  const trace: number[] = [];

  for (let i = 0; i < length; i++) {
    if (rng() < 0.7) {
      trace.push(hotItems[Math.floor(rng() * hotItems.length)]);
    } else {
      trace.push(coldItems[Math.floor(rng() * coldItems.length)]);
    }
  }

  return trace;
}
