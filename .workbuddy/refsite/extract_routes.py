import re, json, os

base = os.path.dirname(os.path.abspath(__file__))
d = open(os.path.join(base, 'decoded.js'), encoding='utf-8', errors='replace').read()
i = d.find('const asyncRouterMap')
seg = d[i:i + 120000]

rows = []
for m in re.finditer(r'path:"(/[A-Za-z0-9_./-]*)"', seg):
    p = m.group(1)
    w = seg[m.start():m.start() + 900]
    t = re.search(r'title:"([^"]*)"', w)
    c = re.search(r'import\("(?:\./)?(?:assets/)?([A-Za-z0-9._-]+\.js)"', w)
    rows.append((p, t.group(1) if t else '', c.group(1) if c else ''))

seen = set()
out = []
for p, t, c in rows:
    if p in seen:
        continue
    seen.add(p)
    out.append({'path': p, 'title': t, 'chunk': c})

json.dump(out, open(os.path.join(base, 'routes.json'), 'w', encoding='utf-8'),
          ensure_ascii=False, indent=1)
print('routes', len(out))
for r in out:
    print(r['path'], '|', r['title'], '|', r['chunk'])
