import type { AccessEvent, CachePolicy } from "../simulation/types";

export class FIFOPolicy implements CachePolicy {
  readonly name = "FIFO" as const;
  private queue: number[] = [];
  private set = new Set<number>();
  private accessIndex = 0;
  readonly capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  access(item: number): AccessEvent {
    const index = this.accessIndex++;

    if (this.set.has(item)) {
      return {
        index,
        requestedItem: item,
        result: "hit",
        victim: null,
        cacheState: [...this.queue],
      };
    }

    let victim: number | null = null;
    if (this.queue.length >= this.capacity) {
      victim = this.queue.shift()!;
      this.set.delete(victim);
    }

    this.queue.push(item);
    this.set.add(item);

    return {
      index,
      requestedItem: item,
      result: "miss",
      victim,
      cacheState: [...this.queue],
    };
  }

  getState(): number[] {
    return [...this.queue];
  }

  reset(): void {
    this.queue = [];
    this.set.clear();
    this.accessIndex = 0;
  }
}
