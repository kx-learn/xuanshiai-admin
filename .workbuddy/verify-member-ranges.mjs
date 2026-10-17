// 验证区间筛选（年龄/身高/收入）与「门店/推广红娘」下拉取值。
import { connect, sleep } from "./cdp.mjs";

const session = await connect("9222");
await session.goto("http://localhost:3000/love-user-list", 6000);
session.events.length = 0;

await session.eval(`(() => {
  [...document.querySelectorAll("button")].find(b => b.textContent.includes("更多选项"))?.click();
  return "ok";
})()`);
await sleep(1000);

const set = await session.eval(`(() => {
  function setSel(sel, value) {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value").set;
    setter.call(sel, value);
    sel.dispatchEvent(new Event("change", { bubbles: true }));
  }
  function byOption(v) {
    return [...document.querySelectorAll("select")].find(s => [...s.options].some(o => o.value === v));
  }
  const out = {};
  for (const [label, value] of [
    ["age", "26-35岁"],
    ["height", "160-170cm"],
    ["income", "8000-15000"],
    ["education", "本科"],
    ["zodiac", "龙"],
  ]) {
    const el = byOption(value);
    if (el) { setSel(el, value); out[label] = value; }
    else out[label] = "missing";
  }
  return out;
})()`);
console.log("set:", set);
await sleep(600);

session.events.length = 0;
await session.eval(`[...document.querySelectorAll("button")].find(b => b.textContent.trim() === "搜索")?.click()`);
await sleep(3500);

const reqs = session.events
  .filter((e) => e.method === "Network.requestWillBeSent")
  .map((e) => e.params.request.url)
  .filter((u) => u.includes("matchmaker/members") && !u.includes("statistics"));
const decoded = reqs.map((u) => decodeURIComponent(u.split("?")[1] || ""));
console.log("QUERY:", JSON.stringify(decoded, null, 1));

// 门店 / 推广红娘 下拉是否已填充
const opts = await session.eval(`(() => {
  const stores = [...document.querySelectorAll("select")].filter(s =>
    s.getAttribute("aria-label") === "门店：不限" || [...s.options].some(o => o.textContent === "总店"));
  const promo = [...document.querySelectorAll("select")].filter(s =>
    s.getAttribute("aria-label") === "推广红娘");
  return {
    storeOptionCounts: stores.map(s => s.options.length),
    promoOptionCounts: promo.map(s => s.options.length),
    optionsApi: "see console",
  };
})()`);
console.log("dropdowns:", JSON.stringify(opts));

process.exit(0);
