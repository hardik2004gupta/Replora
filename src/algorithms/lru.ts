import type { AccessEvent, CachePolicy } from "../simulation/types";

export class LRUPolicy implements CachePolicy {
  readonly name = "LRU" as const;
  private order: number[] = [];
  private set = new Set<number>();
  private accessIndex = 0;
  readonly capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  access(item: number): AccessEvent {
    const index = this.accessIndex++;

    if (this.set.has(item)) {
      const pos = this.order.indexOf(item);
      this.order.splice(pos, 1);
      this.order.push(item);

      return {
        index,
        requestedItem: item,
        result: "hit",
        victim: null,
        cacheState: [...this.order],
      };
    }

    let victim: number | null = null;
    if (this.order.length >= this.capacity) {
      victim = this.order.shift()!;
      this.set.delete(victim);
    }

    this.order.push(item);
    this.set.add(item);

    return {
      index,
      requestedItem: item,
      result: "miss",
      victim,
      cacheState: [...this.order],
    };
  }

  getState(): number[] {
    return [...this.order];
  }

  reset(): void {
    this.order = [];
    this.set.clear();
    this.accessIndex = 0;
  }
}
