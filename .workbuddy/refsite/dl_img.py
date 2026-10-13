import json,glob,re,os,urllib.request,hashlib,collections
BASE=r"C:/Users/ysc02/Desktop/xuanshiai-admin/public/refimg"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0"
urls=collections.Counter()
for fp in glob.glob(r"C:/Users/ysc02/Desktop/xuanshiai-admin/.workbuddy/refsite/pages/*.json"):
    try: d=json.loads(open(fp,encoding="utf-8").read())
    except Exception: continue
    txt=json.dumps(d,ensure_ascii=False)
    for u in re.findall(r'https?://[^\s"\\]+?\.(?:png|jpg|jpeg|gif|webp|svg|ico)', txt, re.I):
        urls[u.replace("\\/","/")]+=1
ok=fail=skip=0
manifest={}
for u in urls:
    name=os.path.basename(u.split("?")[0])
    if not name or len(name)>120: name=hashlib.md5(u.encode()).hexdigest()+".img"
    dest=os.path.join(BASE,name)
    if os.path.exists(dest) and os.path.getsize(dest)>0:
        skip+=1; manifest[u]="/refimg/"+name; continue
    try:
        req=urllib.request.Request(u,headers={"User-Agent":UA,"Referer":"https://www.xuanshiai.com/"})
        with urllib.request.urlopen(req,timeout=20) as r: data=r.read()
        if len(data)<200: fail+=1; continue
        open(dest,"wb").write(data); ok+=1; manifest[u]="/refimg/"+name
    except Exception as e:
        fail+=1
json.dump(manifest,open(os.path.join(BASE,"_manifest.json"),"w",encoding="utf-8"),ensure_ascii=False,indent=1)
print(f"downloaded={ok} skip={skip} fail={fail} total={len(urls)}")
