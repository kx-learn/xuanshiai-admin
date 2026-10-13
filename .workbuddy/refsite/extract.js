(() => {
  const t = (s) => (s || "").replace(/\s+/g, " ").trim();
  const uniq = (a) => Array.from(new Set(a.filter(Boolean)));
  const short = (s) => s && s.length <= 40;
  const q = (sel) => Array.from(document.querySelectorAll(sel));
  const btns = uniq(q("button,[role=button],.ant-btn,.el-button").map((e) => t(e.innerText))).filter(short);
  const labels = uniq(q("label").map((e) => t(e.innerText))).filter(short);
  const placeholders = uniq(q("input,textarea").map((e) => e.placeholder || e.getAttribute("aria-label") || "")).filter(short);
  const ths = uniq(q("th,.ant-table-thead th").map((e) => t(e.innerText))).filter(short);
  const selects = uniq(q("select").map((s) => Array.from(s.options).map((o) => t(o.text)).filter(Boolean).join(" / "))).filter(Boolean);
  const tabs = uniq(q("[role=tab],.ant-tabs-tab,.el-tabs__item").map((e) => t(e.innerText))).filter(short);
  const radios = uniq(q("[role=radio],.ant-radio-wrapper").map((e) => t(e.innerText))).filter(short);
  const imgs = uniq(q("img").map((e) => e.getAttribute("src") || e.getAttribute("data-src") || "")).filter(Boolean);
  const links = uniq(q("a").map((a) => t(a.innerText))).filter(short);
  const text = t(document.body.innerText).slice(0, 4000);
  return JSON.stringify({
    url: location.pathname,
    title: document.title,
    tabs, buttons: btns, labels, placeholders, tableHeaders: ths,
    selects, radios, links, images: imgs.slice(0, 60), text,
  }, null, 1);
})()
