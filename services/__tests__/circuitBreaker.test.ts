import { CircuitBreaker } from "../resilience/circuitBreaker";
describe("CircuitBreaker", () => {
  it("opens after consecutive failures and recovers after timeout", async () => {
    const breaker = new CircuitBreaker({ failureThreshold: 3, timeout: 100 });

    expect(breaker.canRequest()).toBe(true);
    breaker.recordFailure();
    breaker.recordFailure();
    breaker.recordFailure();

    expect(breaker.canRequest()).toBe(false);

    await new Promise(resolve => setTimeout(resolve, 120));

    expect(breaker.canRequest()).toBe(true);

    breaker.recordFailure();
    expect(breaker.canRequest()).toBe(false);
  });

  it("closes after successful half-open requests", async () => {
    const breaker = new CircuitBreaker({ failureThreshold: 1, timeout: 50, successThreshold: 1 });

    breaker.recordFailure();
    expect(breaker.canRequest()).toBe(false);

    await new Promise(resolve => setTimeout(resolve, 60));

    expect(breaker.canRequest()).toBe(true);
    breaker.recordSuccess();

    expect(breaker.canRequest()).toBe(true);
  });
});
