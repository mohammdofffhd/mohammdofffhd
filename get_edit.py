import sys
import subprocess
import os

query = " ".join(sys.argv[1:]).strip()

if not query:
    exit()

os.makedirs("edits", exist_ok=True)

# حذف الفيديوهات القديمة
for f in os.listdir("edits"):
    os.remove("edits/" + f)

search = f"ytsearch1:{query} edit"

cmd = [
    "yt-dlp",
    search,
    "-f",
    "mp4",
    "--max-filesize",
    "50M",
    "-o",
    "edits/edit.%(ext)s"
]

try:
    subprocess.run(cmd)

    files = os.listdir("edits")

    if files:
        print("تم تحميل الفيديو")
    else:
        print("لم يتم العثور على فيديو")

except Exception as e:
    print(e)
