"""Build a full-site filter inventory of the reference admin, mapping each
route to whether our project has a matching page directory."""
import json, os, re

BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(BASE, '..', '..'))
PAGES = os.path.join(ROOT, 'src', 'app', '(admin)')
from analyze import load, parse, PLACEHOLDER_RE  # noqa: E402

routes = json.load(open(os.path.join(BASE, 'routes.json'), encoding='utf-8'))
ours = set()
if os.path.isdir(PAGES):
    ours = {d for d in os.listdir(PAGES)
            if os.path.isfile(os.path.join(PAGES, d, 'page.tsx'))}

cache = {}
lines = []
cur_mod = None
for r in routes:
    path, title, chunk = r['path'], r['title'], r['chunk']
    if path.endswith('-wrap') or path.count('/') == 1 and path != '/':
        pass
    if not chunk:
        continue
    if chunk not in cache:
        src = load(chunk)
        cache[chunk] = (parse(src), sorted(set(PLACEHOLDER_RE.findall(src)))) if src else ([], [])
    groups, phs = cache[chunk]
    seg = path.strip('/').split('/')[0]
    if seg != cur_mod:
        cur_mod = seg
        lines.append('\n### module /%s' % seg)
    have = path.strip('/') in ours
    mark = 'HAVE' if have else 'MISS'
    body = []
    seen = set()
    for g in groups:
        if g.get('tab'):
            k = 'TAB:' + g['tab']
            if k in seen:
                continue
            seen.add(k)
            body.append('- Tab: %s' % g['tab'])
            continue
        if not g['options']:
            continue
        opts = ' / '.join(t for _, t in g['options'])
        k = g['label'] + opts
        if k in seen:
            continue
        seen.add(k)
        body.append('- `%s`: %s' % (g['label'], opts))
    for p in phs:
        if p and re.search(r'[\u4e00-\u9fff]', p) and len(p) <= 30:
            k = 'PH:' + p
            if k in seen:
                continue
            seen.add(k)
            body.append('- input: `%s`' % p)
    if not body:
        continue
    lines.append('\n#### %s (%s) [%s] chunk=%s' % (path, title, mark, chunk))
    lines.extend(sorted(set(body)))

out = os.path.join(BASE, 'filters_report.md')
open(out, 'w', encoding='utf-8').write(
    '# 原站后台筛选项清单（静态分析自 www.xuanshiai.com/admin）\n'
    + 'HAVE = 我们项目已有该页面目录；MISS = 我们项目尚无\n'
    + '\n'.join(lines) + '\n')
print('written', out, len(lines), 'lines')
print('our page dirs:', len(ours))
