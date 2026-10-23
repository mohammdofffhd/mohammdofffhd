import os
import sys
import requests
import re
from urllib.parse import quote


query = " ".join(sys.argv[1:]).strip()

if not query:
    exit()


folder = "stickers"
os.makedirs(folder, exist_ok=True)


# حذف الصور القديمة
for f in os.listdir(folder):
    if f.endswith(".jpg"):
        os.remove(os.path.join(folder, f))


headers = {
    "User-Agent":
    "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36"
}


url = (
    "https://www.bing.com/images/search?q="
    + quote(query)
    + "&count=50"
)


try:

    r = requests.get(
        url,
        headers=headers,
        timeout=20
    )


    html = r.text


    images = re.findall(
        r'"murl"\s*:\s*"([^"]+)"',
        html
    )


    if not images:
        images = re.findall(
            r'murl&quot;:&quot;(.*?)&quot;',
            html
        )


    print("تم العثور على روابط:", len(images))


    count = 0
    used = set()


    for img in images:


        if count >= 30:
            break


        img = img.replace(
            "\\",
            ""
        )


        try:

            res = requests.get(
                img,
                headers=headers,
                timeout=10
            )


            if len(res.content) < 3000:
                continue


            # منع التكرار
            size = len(res.content)

            if size in used:
                continue


            used.add(size)


            with open(
                f"{folder}/{count}.jpg",
                "wb"
            ) as f:
                f.write(res.content)


            count += 1

            print("تحميل صورة:", count)


        except Exception:
            pass


    print("عدد الصور:", count)


except Exception as e:
    print("خطأ:", e)