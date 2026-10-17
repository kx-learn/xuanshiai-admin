// Clean group-menu save round-trip: read server value -> edit -> submit -> confirm PATCH + toast.
import { connect, sleep } from "./cdp.mjs";
import { readFileSync } from "node:fs";

const TOKEN = readFileSync(process.env.TEMP + "\\admin_token.txt", "utf8").trim();
const ORIGIN = "http://127.0.0.1:3000";
const s = await connect(9222);

const net = [];
s.ws.addEventListener("message", (ev) => {
  const m = JSON.parse(ev.data);
  if (m.method === "Network.requestWillBeSent" && m.params.request.method === "PATCH") {
    net.push({ url: new URL(m.params.request.url).pathname, body: (m.params.request.postData || "").slice(0, 300) });
  }
  if (m.method === "Network.responseReceived" && m.params.response.url.includes("/configs/")) {
    net.push({ resp: new URL(m.params.response.url).pathname, status: m.params.response.status });
  }
});

await s.goto(`${ORIGIN}/`, 1500);
await s.eval(`localStorage.setItem("xuanshiai_admin_access_token", ${JSON.stringify(TOKEN)}); "ok"`);

await s.goto(`${ORIGIN}/group-menu`, 7000);
const before = await s.eval(`document.querySelector(".xm-input")?.value ?? null`);

const typed = await s.eval(`(() => {
  const input = document.querySelector(".xm-input");
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  setter.call(input, "找搭子-roundtrip-check");
  input.dispatchEvent(new Event("input", { bubbles: true }));
  return input.value;
})()`);

const clicked = await s.eval(`(() => {
  const btn = [...document.querySelectorAll("button")].find(b => /确定提交/.test(b.textContent||""));
  if (!btn) return "NO_BUTTON";
  if (btn.disabled) return "DISABLED";
  btn.click();
  return "CLICKED";
})()`);

await sleep(4000);
const toast = await s.eval(`(() => { const t = document.getElementById("pcfg-toast-host"); return t ? t.innerText.trim() : null; })()`);
const errs = await s.eval(`(() => document.querySelectorAll(".pcfg-toast.error").length)()`);

console.log(JSON.stringify({ before, typed, clicked, toast, errorToasts: errs, net }, null, 2));
process.exit(0);
