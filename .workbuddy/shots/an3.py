from PIL import Image
im = Image.open(r"C:\Users\ysc02\Desktop\xuanshiai-admin\.workbuddy\shots\captcha.png").convert("RGB")
# 裁剪拼图图片区域并放大 2x
crop = im.crop((455, 140, 810, 330))
crop = crop.resize((crop.width*2, crop.height*2), Image.LANCZOS)
crop.save(r"C:\Users\ysc02\Desktop\xuanshiai-admin\.workbuddy\shots\puzzle_zoom.png")
print("saved", crop.size)
