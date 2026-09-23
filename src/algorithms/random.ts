import type { AccessEvent, CachePolicy } from "../simulation/types";

function createSeededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0x100000000;
  };
}

export class RandomPolicy implements CachePolicy {
  readonly name = "RANDOM" as const;
  private items: number[] = [];
  private set = new Set<number>();
  private rng: () => number;
  private accessIndex = 0;
  private seed: number;

  readonly capacity: number;

  constructor(capacity: number, seed: number = 42) {
    this.capacity = capacity;
    this.seed = seed;
    this.rng = createSeededRng(seed);
  }

  access(item: number): AccessEvent {
    const index = this.accessIndex++;

    if (this.set.has(item)) {
      return {
        index,
        requestedItem: item,
        result: "hit",
        victim: null,
        cacheState: [...this.items],
      };
    }

    let victim: number | null = null;
    if (this.items.length >= this.capacity) {
      const victimIdx = Math.floor(this.rng() * this.items.length);
      victim = this.items[victimIdx];
      this.set.delete(victim);
      this.items[victimIdx] = item;
    } else {
      this.items.push(item);
    }

    this.set.add(item);

    return {
      index,
      requestedItem: item,
      result: "miss",
      victim,
      cacheState: [...this.items],
    };
  }

  getState(): number[] {
    return [...this.items];
  }

  reset(): void {
    this.items = [];
    this.set.clear();
    this.rng = createSeededRng(this.seed);
    this.accessIndex = 0;
  }
}
