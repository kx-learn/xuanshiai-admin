import json, urllib.request, io, re

url = "https://xhztest.xyz/openapi.json"
raw = urllib.request.urlopen(url, timeout=60).read().decode("utf-8")
spec = json.loads(raw)
paths = spec.get("paths", {})
lines = []
for p, methods in paths.items():
    if "accounts" in p or "account" in p:
        for m in methods:
            lines.append("%s %s" % (m.upper(), p))
lines.append("--- total paths: %d" % len(paths))
# also search description text mentioning delete account
io.open(r"E:\HTML\xuanshiai-admin\scripts\_tmp_api.txt", "w", encoding="utf-8").write("\n".join(lines))
print("ok")
