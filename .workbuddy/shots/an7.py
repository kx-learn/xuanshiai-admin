from PIL import Image, ImageDraw
im = Image.open(r"C:\Users\ysc02\Desktop\xuanshiai-admin\.workbuddy\shots\after_drag.png").convert("RGB")
crop = im.crop((455, 145, 812, 330))
crop = crop.resize((crop.width*2, crop.height*2), Image.LANCZOS)
d = ImageDraw.Draw(crop)
# 画标尺：每 50 原始像素一条竖线，标注原始 x 坐标
for ox in range(460, 810, 50):
    zx = (ox-455)*2
    d.line([(zx,0),(zx,crop.height)], fill=(255,0,0), width=1)
    d.text((zx+2, 2), str(ox), fill=(255,0,0))
crop.save(r"C:\Users\ysc02\Desktop\xuanshiai-admin\.workbuddy\shots\puzzle_ruler.png")
print("ok")
