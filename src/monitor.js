import net from "node:net";
import { lookup } from "node:dns/promises";

function isPrivateIPv4(address) {
  const p = address.split(".").map(Number);
  if (p.length !== 4 || p.some(n => !Number.isInteger(n) || n < 0 || n > 255)) return true;
  const [a, b] = p;
  return a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
}

function isPrivateAddress(address) {
  const family = net.isIP(address);
  if (family === 4) return isPrivateIPv4(address);
  if (family === 6) {
    const a = address.toLowerCase();
    return a === "::1" || a === "::" || a.startsWith("fc") || a.startsWith("fd") ||
      /^fe[89ab]/.test(a) || a.startsWith("::ffff:") || a.startsWith("2001:db8:");
  }
  return true;
}

export function validateTarget(host, port, timeoutMs = 5000) {
  if (typeof host !== "string" || host.length > 253) return { ok: false, error: "Enter a valid public hostname." };
  const normalized = host.trim().replace(/\.$/, "").toLowerCase();
  if (!normalized || normalized === "localhost" || normalized.endsWith(".localhost") ||
      normalized.includes("/") || normalized.includes("@") || /\s/.test(normalized)) {
    return { ok: false, error: "Enter a valid public hostname, not a URL or local address." };
  }
  if (!Number.isInteger(port) || port < 1 || port > 65535) return { ok: false, error: "Port must be between 1 and 65535." };
  if (!Number.isInteger(timeoutMs) || timeoutMs < 500 || timeoutMs > 15000) return { ok: false, error: "Timeout must be between 500 and 15000 milliseconds." };
  if (net.isIP(normalized) && isPrivateAddress(normalized)) return { ok: false, error: "Private and local network addresses are not allowed." };
  return { ok: true, host: normalized, port, timeoutMs };
}

export async function checkTcpTarget(host, port = 443, timeoutMs = 5000) {
  const validation = validateTarget(host, port, timeoutMs);
  if (!validation.ok) throw new Error(validation.error);
  const addresses = await lookup(validation.host, { all: true, verbatim: true });
  if (!addresses.length || addresses.some(item => isPrivateAddress(item.address))) {
    throw new Error("The hostname did not resolve exclusively to public IP addresses.");
  }
  const address = addresses[0];
  const started = performance.now();
  return await new Promise(resolve => {
    const socket = net.createConnection({ host: address.address, port: validation.port, family: address.family });
    let settled = false;
    const finish = result => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve({ host: validation.host, port: validation.port, reachable: result.reachable,
        status: result.reachable ? "online" : "offline",
        latencyMs: Math.round(performance.now() - started), error: result.error ?? null });
    };
    socket.setTimeout(validation.timeoutMs);
    socket.once("connect", () => finish({ reachable: true }));
    socket.once("timeout", () => finish({ reachable: false, error: "Connection timed out" }));
    socket.once("error", error => finish({ reachable: false, error: error.code || "Connection failed" }));
  });
}
