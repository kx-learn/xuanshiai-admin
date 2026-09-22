"""Extract filter controls (selects / search inputs / tabs / buttons) from a
built Vue chunk of the reference admin site."""
import json, os, re, sys

BASE = os.path.dirname(os.path.abspath(__file__))
CHUNKS = os.path.join(BASE, 'chunks')


def decode(text: str) -> str:
    return re.sub(r'\\u([0-9a-fA-F]{4})', lambda m: chr(int(m.group(1), 16)), text)


def load(name: str) -> str:
    p = os.path.join(CHUNKS, name)
    if not os.path.exists(p):
        return ''
    return decode(open(p, encoding='utf-8', errors='replace').read())


OPT_RE = re.compile(
    r'\{value:([^}]{0,40})\},\s*\{default:\w*\(\(\)\s*=>\s*\[.{0,140}?\b\w+\("([^"]{1,30})"')
PLACEHOLDER_RE = re.compile(r'placeholder:"([^"]{0,60})"')
TAB_RE = re.compile(r'tab:"([^"]{1,20})"')
BTN_TEXT_RE = re.compile(r'\[(?:\w+)\|\)?\(?[\w$]+\)?\]?\|?\(?\s*\w+\("([^"]{1,20})",-1\)')


def parse(src: str):
    """Walk the render function, grouping option texts under the nearest
    preceding placeholder (the select's default label)."""
    events = []
    for m in PLACEHOLDER_RE.finditer(src):
        events.append((m.start(), 'ph', m.group(1)))
    for m in OPT_RE.finditer(src):
        events.append((m.start(), 'opt', (m.group(1), m.group(2))))
    for m in TAB_RE.finditer(src):
        events.append((m.start(), 'tab', m.group(1)))
    events.sort(key=lambda x: x[0])

    groups = []
    cur = None
    for pos, kind, val in events:
        if kind == 'ph':
            cur = {'label': val, 'options': [], 'pos': pos}
            groups.append(cur)
        elif kind == 'opt' and cur is not None:
            v, t = val
            if (v, t) not in [(a, b) for a, b in cur['options']]:
                cur['options'].append((v, t))
        elif kind == 'tab':
            groups.append({'label': 'TAB', 'options': [], 'tab': val, 'pos': pos})
    return groups


def render(groups):
    lines = []
    for g in groups:
        if g.get('tab'):
            lines.append('  [Tab] %s' % g['tab'])
            continue
        if not g['options']:
            continue
        opts = ' / '.join(t for _, t in g['options'])
        lines.append('  [%s] %s' % (g['label'], opts))
    return lines


if __name__ == '__main__':
    for name in sys.argv[1:]:
        src = load(name)
        if not src:
            print('MISSING', name)
            continue
        print('=== ' + name)
        gs = parse(src)
        out = render(gs)
        print('\n'.join(out) if out else '  (no selects found)')
        print()
