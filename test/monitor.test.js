import test from "node:test";
import assert from "node:assert/strict";
import { validateTarget } from "../src/monitor.js";

test("accepts a public hostname and valid port", () => {
  assert.deepEqual(validateTarget("example.com", 443), {
    ok: true, host: "example.com", port: 443, timeoutMs: 5000
  });
});

test("normalizes host casing and trailing dot", () => {
  assert.equal(validateTarget("EXAMPLE.COM.", 80).host, "example.com");
});

test("rejects local and private destinations", () => {
  for (const host of ["localhost", "127.0.0.1", "10.0.0.1", "192.168.1.1", "172.16.0.2"]) {
    assert.equal(validateTarget(host, 443).ok, false, host);
  }
});

test("rejects malformed hostnames and URLs", () => {
  for (const host of ["", "https://example.com", "user@example.com", "bad host"]) {
    assert.equal(validateTarget(host, 443).ok, false, host);
  }
});

test("rejects invalid ports and timeout values", () => {
  assert.equal(validateTarget("example.com", 0).ok, false);
  assert.equal(validateTarget("example.com", 65536).ok, false);
  assert.equal(validateTarget("example.com", 443, 100).ok, false);
  assert.equal(validateTarget("example.com", 443, 20000).ok, false);
});
