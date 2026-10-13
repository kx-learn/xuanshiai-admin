from PIL import Image
im = Image.open(r"C:\Users\ysc02\Desktop\xuanshiai-admin\.workbuddy\shots\captcha.png").convert("RGB")
px = im.load()
W,H = im.size
def is_blue(p):
    r,g,b = p
    return b>200 and 100<g<190 and r<120
minx=maxx=miny=maxy=None
for y in range(320, 480):
    for x in range(400, 820):
        if is_blue(px[x,y]):
            if minx is None: minx=maxx=x; miny=maxy=y
            minx=min(minx,x); maxx=max(maxx,x); miny=min(miny,y); maxy=max(maxy,y)
print("blue button bbox:", minx, miny, maxx, maxy, "center", (minx+maxx)/2, (miny+maxy)/2)
# 滑轨灰条范围（同 y 行，灰色）
cy = (miny+maxy)//2
row=[]
for x in range(400, 830):
    r,g,b = px[x,cy]
    if abs(r-g)<12 and abs(g-b)<12 and 190<r<235: row.append(x)
print("track gray range:", (row[0], row[-1]) if row else None)
