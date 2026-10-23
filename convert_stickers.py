import os
import subprocess

=========================

المجلدات

=========================

folder = "stickers"
out_folder = os.path.join(folder, "webp")

os.makedirs(folder, exist_ok=True)
os.makedirs(out_folder, exist_ok=True)

count = 0
max_stickers = 20

=========================

قراءة الصور

=========================

files = sorted(
os.listdir(folder),
key=lambda x: x.lower()
)

for file in files:

if count >= max_stickers:
    break

if not file.lower().endswith(
    (".jpg", ".jpeg", ".png", ".webp")
):
    continue

inp = os.path.join(
    folder,
    file
)

# تجاهل مجلد webp
if os.path.isdir(inp):
    continue

out = os.path.join(
    out_folder,
    f"sticker_{count}.webp"
)

try:

    print(
        f"⬇️ تحويل {count + 1}/{max_stickers}: {file}"
    )

    result = subprocess.run(
        [
            "ffmpeg",
            "-y",

            "-i",
            inp,

            # تصغير الصورة مع الحفاظ على النسبة
            # ثم وضعها داخل مربع 512x512
            "-vf",
            "scale=512:512:force_original_aspect_ratio=decrease,"
            "pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white@0",

            "-vcodec",
            "libwebp",

            "-q:v",
            "75",

            out
        ],

        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE
    )

    # التأكد أن FFmpeg نجح
    if (
        result.returncode == 0
        and os.path.exists(out)
        and os.path.getsize(out) > 1000
    ):

        count += 1

        print(
            f"✅ تم تحويل: {file}"
        )

    else:

        print(
            f"⚠️ فشل تحويل: {file}"
        )

except Exception as e:

    print(
        f"⚠️ خطأ: {file} - {e}"
    )

print()
print("━━━━━━━━━━━━━━━━━━━━")
print(f"🎉 تم تحويل {count} ملصق")
print(f"📁 المجلد: {out_folder}")
print("━━━━━━━━━━━━━━━━━━━━")