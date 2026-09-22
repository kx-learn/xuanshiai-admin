import json, os, subprocess, sys

base = os.path.dirname(os.path.abspath(__file__))
outdir = os.path.join(base, 'chunks')
os.makedirs(outdir, exist_ok=True)

routes = json.load(open(os.path.join(base, 'routes.json'), encoding='utf-8'))
names = sorted({r['chunk'] for r in routes if r['chunk']})
print('chunks to fetch:', len(names))

ok = fail = skip = 0
for i, n in enumerate(names, 1):
    dest = os.path.join(outdir, n)
    if os.path.exists(dest) and os.path.getsize(dest) > 200:
        skip += 1
        continue
    url = 'https://www.xuanshiai.com/admin/assets/' + n
    r = subprocess.run(['curl', '-s', '--max-time', '60', '-o', dest, url],
                       capture_output=True)
    size = os.path.getsize(dest) if os.path.exists(dest) else 0
    if size > 200:
        ok += 1
    else:
        fail += 1
        print('FAIL', n, size)
    if i % 20 == 0:
        print('progress', i, '/', len(names), 'ok', ok, 'fail', fail, flush=True)

print('done ok=%d fail=%d skip=%d' % (ok, fail, skip))
