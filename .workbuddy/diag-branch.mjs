// Dump console errors + the config card region for branch-config.
import { connect, sleep } from "./cdp.mjs";
import { readFileSync } from "node:fs";

const TOKEN = readFileSync(process.env.TEMP + "\\admin_token.txt", "utf8").trim();
const ORIGIN = "http://127.0.0.1:3000";
const s = await connect(9222);
await s.goto(`${ORIGIN}/`, 1500);
await s.eval(`localStorage.setItem("xuanshiai_admin_access_token", ${JSON.stringify(TOKEN)}); "ok"`);

s.events.length = 0;
await s.goto(`${ORIGIN}/branch-config`, 5000);

const errs = s.events
  .filter((e) => e.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(e.params.type))
  .map((e) => e.params.args.map((a) => a.value ?? a.description).join(" ").slice(0, 300));
const exceptions = s.events
  .filter((e) => e.method === "Runtime.exceptionThrown")
  .map((e) => (e.params.exceptionDetails.exception?.description || "").slice(0, 400));

const info = await s.eval(`(() => {
  const card = document.querySelector(".bc-card");
  const mode = document.querySelector(".bc-mode");
  return {
    url: location.pathname,
    hasBcCard: !!card,
    hasBcMode: !!mode,
    bodyLen: document.body.innerText.length,
    bodyHead: document.body.innerText.slice(0, 400),
    allCards: document.querySelectorAll(".finord-card").length,
    nextError: !!document.querySelector("nextjs-portal"),
  };
})()`);

console.log(JSON.stringify({ info, errs, exceptions }, null, 2));
process.exit(0);
