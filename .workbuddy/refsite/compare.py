"""Diff reference-site filter options against what our pages already have."""
import json, os, re

BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(BASE, '..', '..'))
PAGES = os.path.join(ROOT, 'src', 'app', '(admin)')
from analyze import load, parse, PLACEHOLDER_RE, decode  # noqa: E402

CJK_RE = re.compile(r'[\u4e00-\u9fff]')
# strings worth treating as "filter option" on the reference side
NOISE = re.compile(r'^(div|span|a|section|view|CustomerSource|-|/)$')


def our_strings(path):
    if not os.path.exists(path):
        return None
    src = open(path, encoding='utf-8', errors='replace').read()
    out = set()
    # 先扫文本节点（>中文<），避免被字符串字面量吞掉 option 文案
    for m in re.finditer(r'>\s*([^<>{}\n=]{1,24}?)\s*<', src):
        s = m.group(1).strip()
        if s and CJK_RE.search(s):
            out.add(s)
    for m in re.finditer(r'"([^"<>{}\\\n]{1,24})"|\'([^\'<>{}\\\n]{1,24})\'', src):
        s = (m.group(1) or m.group(2) or '').strip()
        if not s or not CJK_RE.search(s):
            continue
        out.add(s)
    return out


def ref_items(chunk):
    src = load(chunk)
    if not src:
        return set()
    items = set()
    for g in parse(src):
        if g.get('tab'):
            items.add(g['tab'])
            continue
        for _, t in g['options']:
            if NOISE.match(t):
                continue
            items.add(t)
    for p in PLACEHOLDER_RE.findall(src):
        if CJK_RE.search(p) and len(p) <= 24 and not NOISE.match(p):
            items.add(p)
    return items


def main():
    routes = json.load(open(os.path.join(BASE, 'routes.json'), encoding='utf-8'))
    cache = {}
    rows = []
    for r in routes:
        slug = r['path'].strip('/')
        p = os.path.join(PAGES, slug, 'page.tsx')
        if not os.path.isfile(p):
            continue
        chunk = r['chunk']
        if chunk not in cache:
            cache[chunk] = ref_items(chunk)
        ref = cache[chunk]
        mine = our_strings(p)
        if mine is None:
            continue
        missing = sorted(x for x in ref if x not in mine)
        rows.append((slug, r['title'], len(ref), len(missing), missing))

    rows.sort(key=lambda x: -x[3])
    lines = ['# 我们站点 vs 原站 — 筛选项缺失清单',
             '',
             '按缺失数量排序。missing = 原站该页面（含弹窗）出现、但我们 page.tsx 里找不到的中文选项文案。',
             '']
    for slug, title, nref, nmiss, missing in rows:
        if nmiss == 0:
            continue
        lines.append('## /%s （%s）' % (slug, title))
        lines.append('- 原站选项文案 %d 条，疑似缺失 %d 条' % (nref, nmiss))
        lines.append('')
        for m in missing[:60]:
            lines.append('- ' + m)
        if nmiss > 60:
            lines.append('- ... 另 %d 条' % (nmiss - 60))
        lines.append('')
    out = os.path.join(BASE, 'gap_report.md')
    open(out, 'w', encoding='utf-8').write('\n'.join(lines))
    print('written', out, 'pages compared', len(rows))
    for slug, title, nref, nmiss, _ in rows[:25]:
        print('%-42s ref=%3d missing=%3d' % (slug, nref, nmiss))


if __name__ == '__main__':
    main()
