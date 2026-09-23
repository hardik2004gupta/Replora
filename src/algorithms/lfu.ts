import type { AccessEvent, CachePolicy } from "../simulation/types";

/**
 * Tie-breaking: when multiple items share the lowest frequency,
 * the one inserted earliest (lowest insertion order) is evicted.
 */
export class LFUPolicy implements CachePolicy {
  readonly name = "LFU" as const;
  private items: number[] = [];
  private freq = new Map<number, number>();
  private insertionOrder = new Map<number, number>();
  private insertionCounter = 0;
  private accessIndex = 0;
  readonly capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  access(item: number): AccessEvent {
    const index = this.accessIndex++;

    if (this.freq.has(item) && this.items.includes(item)) {
      this.freq.set(item, this.freq.get(item)! + 1);

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
      victim = this.findVictim();
      const victimIdx = this.items.indexOf(victim);
      this.items.splice(victimIdx, 1);
      this.freq.delete(victim);
      this.insertionOrder.delete(victim);
    }

    this.items.push(item);
    this.freq.set(item, 1);
    this.insertionOrder.set(item, this.insertionCounter++);

    return {
      index,
      requestedItem: item,
      result: "miss",
      victim,
      cacheState: [...this.items],
    };
  }

  private findVictim(): number {
    let minFreq = Infinity;
    let victim = this.items[0];
    let victimOrder = Infinity;

    for (const item of this.items) {
      const f = this.freq.get(item)!;
      const order = this.insertionOrder.get(item)!;
      if (f < minFreq || (f === minFreq && order < victimOrder)) {
        minFreq = f;
        victim = item;
        victimOrder = order;
      }
    }

    return victim;
  }

  getState(): number[] {
    return [...this.items];
  }

  reset(): void {
    this.items = [];
    this.freq.clear();
    this.insertionOrder.clear();
    this.insertionCounter = 0;
    this.accessIndex = 0;
  }
}
