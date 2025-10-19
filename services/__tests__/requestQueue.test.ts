import AsyncStorage from "@react-native-async-storage/async-storage";

import { persistentRequestQueue, QueuedRequest } from "../resilience/requestQueue";

describe("PersistentRequestQueue", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    await persistentRequestQueue.clear();
  });

  it("enforces idempotent request ids", async () => {
    const baseRequest: QueuedRequest = {
      requestId: "abc-123",
      endpoint: "/test",
      method: "POST",
      body: { value: 1 },
      headers: { "Content-Type": "application/json" },
    };

    const first = await persistentRequestQueue.enqueue(baseRequest);
    const second = await persistentRequestQueue.enqueue({ ...baseRequest, body: { value: 2 } });

    expect(first).toBe(true);
    expect(second).toBe(false);

    const stored = await persistentRequestQueue.peek();
    expect(stored).toHaveLength(1);
    expect(stored[0].body).toEqual({ value: 1 });
  });

  it("flushes requests sequentially and clears queue", async () => {
    const sent: QueuedRequest[] = [];

    await persistentRequestQueue.enqueue({
      requestId: "req-1",
      endpoint: "/one",
      method: "POST",
      body: { test: 1 },
      headers: { "Content-Type": "application/json" },
    });

    await persistentRequestQueue.enqueue({
      requestId: "req-2",
      endpoint: "/two",
      method: "PUT",
      body: { test: 2 },
      headers: { "Content-Type": "application/json" },
    });

    await persistentRequestQueue.flush(async item => {
      sent.push(item);
    });

    expect(sent).toHaveLength(2);
    expect(sent.map(item => item.requestId)).toEqual(["req-1", "req-2"]);
    const remaining = await persistentRequestQueue.peek();
    expect(remaining).toHaveLength(0);
  });
});
