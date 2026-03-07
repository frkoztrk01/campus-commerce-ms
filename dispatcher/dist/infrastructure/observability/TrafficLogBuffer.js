"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrafficLogBuffer = void 0;
class TrafficLogBuffer {
    maxEntries;
    entries = [];
    constructor(maxEntries) {
        this.maxEntries = maxEntries;
    }
    push(entry) {
        if (this.maxEntries <= 0) {
            return;
        }
        this.entries.push(entry);
        while (this.entries.length > this.maxEntries) {
            this.entries.shift();
        }
    }
    getSnapshot() {
        return [...this.entries];
    }
}
exports.TrafficLogBuffer = TrafficLogBuffer;
