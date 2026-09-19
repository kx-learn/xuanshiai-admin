import json, urllib.request, io

out = []
try:
    raw = urllib.request.urlopen("https://xhztest.xyz/openapi.json", timeout=60).read().decode("utf-8")
    spec = json.loads(raw)
    paths = spec.get("paths", {})
    schemas = (spec.get("components") or {}).get("schemas") or {}

    for p in ["/api/v1/admin/matchmaker/accounts", "/api/v1/admin/matchmaker/accounts/{account_id}",
              "/api/v1/admin/matchmaker/accounts/{account_id}/status"]:
        node = paths.get(p)
        if node:
            out.append("=== %s" % p)
            out.append(json.dumps(node, ensure_ascii=False, indent=1)[:3000])

    out.append("=== schemas containing 'account'")
    for name, sch in schemas.items():
        if "account" in name.lower():
            out.append("--- " + name)
            out.append(json.dumps(sch, ensure_ascii=False, indent=1)[:2500])
except Exception as e:
    out.append(str(e))

io.open(r"E:\HTML\xuanshiai-admin\scripts\_tmp_api3.txt", "w", encoding="utf-8").write("\n".join(out))
