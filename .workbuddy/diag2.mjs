import { connect, sleep } from "./cdp.mjs";
import { readFileSync } from "node:fs";
const TOKEN = readFileSync(process.env.TEMP + "\\admin_token.txt", "utf8").trim();
const ORIGIN = "http://127.0.0.1:3000";
const s = await connect(9222);
await s.goto(`${ORIGIN}/`, 1500);
await s.eval(`localStorage.setItem("xuanshiai_admin_access_token", ${JSON.stringify(TOKEN)}); "ok"`);
await s.goto(`${ORIGIN}/branch-config`, 6000);
const r = await s.eval(`(() => {
  const p = document.querySelector("nextjs-portal");
  const card = document.querySelector(".bc-card");
  const mode = document.querySelector(".bc-mode");
  return {
    overlayText: p ? (p.innerText||p.textContent||"").slice(0,1500) : null,
    cardText: card ? (card.innerText||"").slice(0,500) : null,
    bcModeHTML: mode ? mode.outerHTML.slice(0,800) : null,
  };
})()`);
console.log(JSON.stringify(r, null, 2));
process.exit(0);
