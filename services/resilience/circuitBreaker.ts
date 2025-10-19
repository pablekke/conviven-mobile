export type CircuitState = "closed" | "open" | "half-open";

interface CircuitBreakerOptions {
  failureThreshold?: number;
  successThreshold?: number;
  timeout?: number;
}

interface CircuitBreakerSnapshot {
  state: CircuitState;
  failures: number;
  nextAttempt: number | null;
}

export class CircuitOpenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CircuitOpenError";
  }
}

const DEFAULT_FAILURE_THRESHOLD = 3;
const DEFAULT_SUCCESS_THRESHOLD = 1;
const DEFAULT_TIMEOUT = 60_000;

export class CircuitBreaker {
  private state: CircuitState = "closed";
  private failures = 0;
  private successes = 0;
  private nextAttempt: number | null = null;
  private readonly failureThreshold: number;
  private readonly successThreshold: number;
  private readonly timeout: number;

  constructor(options: CircuitBreakerOptions = {}) {
    this.failureThreshold = options.failureThreshold ?? DEFAULT_FAILURE_THRESHOLD;
    this.successThreshold = options.successThreshold ?? DEFAULT_SUCCESS_THRESHOLD;
    this.timeout = options.timeout ?? DEFAULT_TIMEOUT;
  }

  get snapshot(): CircuitBreakerSnapshot {
    return {
      state: this.state,
      failures: this.failures,
      nextAttempt: this.nextAttempt,
    };
  }

  canRequest(): boolean {
    if (this.state === "open") {
      if (this.nextAttempt && Date.now() > this.nextAttempt) {
        this.state = "half-open";
        return true;
      }
      return false;
    }

    return true;
  }

  recordSuccess(): void {
    this.failures = 0;
    if (this.state === "half-open") {
      this.successes += 1;
      if (this.successes >= this.successThreshold) {
        this.close();
      }
    } else {
      this.successes = 0;
    }
  }

  recordFailure(): void {
    this.failures += 1;

    if (this.state === "half-open") {
      this.open();
      return;
    }

    if (this.failures >= this.failureThreshold) {
      this.open();
    }
  }

  private open(): void {
    this.state = "open";
    this.nextAttempt = Date.now() + this.timeout;
    this.successes = 0;
  }

  private close(): void {
    this.state = "closed";
    this.failures = 0;
    this.successes = 0;
    this.nextAttempt = null;
  }
}

class CircuitBreakerRegistry {
  private breakers = new Map<string, CircuitBreaker>();

  getBreaker(key: string, options?: CircuitBreakerOptions): CircuitBreaker {
    if (!this.breakers.has(key)) {
      this.breakers.set(key, new CircuitBreaker(options));
    }

    return this.breakers.get(key)!;
  }
}

export const circuitBreakerRegistry = new CircuitBreakerRegistry();
