// Verify the branch-config 确定切换 gate AND a real save round-trip on group-menu.
import { connect, sleep } from "./cdp.mjs";
import { readFileSync } from "node:fs";

const TOKEN = readFileSync(process.env.TEMP + "\\admin_token.txt", "utf8").trim();
const ORIGIN = "http://127.0.0.1:3000";
const s = await connect(9222);
await s.goto(`${ORIGIN}/`, 1500);
await s.eval(`localStorage.setItem("xuanshiai_admin_access_token", ${JSON.stringify(TOKEN)}); "ok"`);

const out = {};

// --- 1. branch-config: every button's disabled state ---
s.events.length = 0;
await s.goto(`${ORIGIN}/branch-config`, 4000);
out.branchConfig = await s.eval(`(() => {
  return [...document.querySelectorAll("button")].map((b) => ({
    text: (b.textContent||"").trim().slice(0,14), disabled: b.disabled,
  })).filter((b) => b.text);
})()`);

// --- 2. group-menu: real save round-trip ---
s.events.length = 0;
await s.goto(`${ORIGIN}/group-menu`, 4500);
out.groupMenu_before = await s.eval(
  `document.querySelector(".xm-input") ? document.querySelector(".xm-input").value : null`,
);

// change title, click 确定提交, and watch for the PATCH
await s.eval(`(() => {
  const input = document.querySelector(".xm-input");
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  setter.call(input, "找搭子-自动化验证");
  input.dispatchEvent(new Event("input", { bubbles: true }));
  return input.value;
})()`);
await sleep(300);
await s.eval(`(() => {
  const btn = [...document.querySelectorAll("button")].find(b => /确定提交/.test(b.textContent||""));
  btn.click(); return "clicked";
})()`);
await sleep(3000);

out.patchRequests = s.events
  .filter((e) => e.method === "Network.requestWillBeSent" && e.params.request.method === "PATCH")
  .map((e) => ({
    url: new URL(e.params.request.url).pathname,
    body: (e.params.request.postData || "").slice(0, 200),
  }));
out.toast = await s.eval(
  `(() => { const t = document.getElementById("pcfg-toast-host"); return t ? t.innerText.trim() : null; })()`,
);
out.groupMenu_afterReload = await (async () => {
  await s.goto(`${ORIGIN}/group-menu`, 4000);
  return s.eval(`document.querySelector(".xm-input").value`);
})();

console.log(JSON.stringify(out, null, 2));
process.exit(0);
