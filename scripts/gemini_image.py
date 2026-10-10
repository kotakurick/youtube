"""Gemini の API で画像を1枚作る（サムネイルの人形用。docs/decisions.md 2026-10-10）。

鍵は環境変数 GEMINI_API_KEY から読む（Git にもチャットにも入れない）。有料。
緑の背景（#00B140）で作り、scripts/chroma_key.py で抜いて使う。

python scripts/gemini_image.py "指示文" out.png [--model gemini-2.5-flash-image] [--aspect 2:3]
"""
import argparse
import base64
import json
import os
import sys
import urllib.error
import urllib.request


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("prompt")
    ap.add_argument("out")
    ap.add_argument("--model", default="gemini-2.5-flash-image")
    ap.add_argument("--aspect", default="2:3")
    a = ap.parse_args()

    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        sys.exit("GEMINI_API_KEY がありません（クラウドの環境の設定か、PC の環境変数に置く）")

    body = {
        "contents": [{"parts": [{"text": a.prompt}]}],
        "generationConfig": {
            "responseModalities": ["IMAGE"],
            "imageConfig": {"aspectRatio": a.aspect},
        },
    }
    req = urllib.request.Request(
        f"https://generativelanguage.googleapis.com/v1beta/models/{a.model}:generateContent",
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "x-goog-api-key": key},
    )
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            res = json.load(r)
    except urllib.error.HTTPError as e:
        sys.exit(f"エラー {e.code}: {e.read().decode(errors='replace')[:500]}")

    for cand in res.get("candidates", []):
        for part in cand.get("content", {}).get("parts", []):
            data = part.get("inlineData") or part.get("inline_data")
            if data:
                with open(a.out, "wb") as f:
                    f.write(base64.b64decode(data["data"]))
                print(a.out)
                return
    sys.exit("画像が返りませんでした：" + json.dumps(res, ensure_ascii=False)[:500])


if __name__ == "__main__":
    main()
