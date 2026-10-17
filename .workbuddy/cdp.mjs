// Minimal Chrome DevTools Protocol driver (no deps; Node 18+ built-in WebSocket).
// Usage: node cdp.mjs <chromeDebugPort> <script.mjs>
import { readFileSync } from "node:fs";

const port = process.env.CDP_PORT || "9222";

async function targets() {
  const res = await fetch(`http://127.0.0.1:${port}/json/list`);
  return res.json();
}

export async function newTab(url) {
  const res = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`, {
    method: "PUT",
  });
  return res.json();
}

class Session {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.events = [];
    ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
      } else if (msg.method) {
        this.events.push(msg);
      }
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`timeout: ${method}`));
        }
      }, 30000);
    });
  }
  async eval(expression) {
    const r = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (r.exceptionDetails) {
      throw new Error(
        `eval threw: ${r.exceptionDetails.exception?.description || r.exceptionDetails.text}`,
      );
    }
    return r.result.value;
  }
  async goto(url, waitMs = 3500) {
    await this.send("Page.navigate", { url });
    await sleep(waitMs);
  }
}

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function connect(port, targetFilter) {
  const list = await targets();
  const page = targetFilter
    ? list.find((t) => t.type === "page" && targetFilter(t))
    : list.find((t) => t.type === "page");
  if (!page) throw new Error("no page target");
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve);
    ws.addEventListener("error", reject);
  });
  const s = new Session(ws);
  await s.send("Page.enable");
  await s.send("Runtime.enable");
  await s.send("Network.enable");
  return s;
}
