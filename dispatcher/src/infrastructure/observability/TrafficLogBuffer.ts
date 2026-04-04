export interface TrafficLogEntry {
  readonly timestamp: string;
  readonly method: string;
  readonly path: string;
  readonly statusCode: number;
  readonly durationMs: number;
}

export class TrafficLogBuffer {
  private readonly entries: TrafficLogEntry[] = [];

  constructor(private readonly maxEntries: number) {}

  push(entry: TrafficLogEntry): void {
    if (this.maxEntries <= 0) {
      return;
    }
    this.entries.push(entry);
    while (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }
  }

  getSnapshot(): readonly TrafficLogEntry[] {
    return [...this.entries];
  }
}
