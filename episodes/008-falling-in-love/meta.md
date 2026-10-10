# メタデータ

## タイトル案

（2026-10-10 クラウド。`docs/brand.md` のパッケージ：型A・B・C、数字は1つまで、「？」なしから、「」と「なぜ〜なのか」は使わない）
本編で言えるのは「会う前の答えでは、この相手にだけ向ける好意（相性）がほぼ当たらない」まで。「恋は運」「条件は無意味」とは約束しない（好みは網として当たる。第3章）。

| 型 | タイトル | ねらい |
|---|---|---|
| A 答えをにおわせる | 好きになる相手は、会う前にはほとんど当てられない | 予想タイムの答え（D）をにおわせる断定 |
| B 研究の結果 | 100を超える質問に答えても、好きになる相手は当てられなかった | 本編の主役の研究（数字は100の1つ） |
| C 自分に当てはめる | 好きになった人が条件に届かないとき、変わるのは条件のほう | 第3章の山（763人の追跡）。自分の恋に当てはめられる |

**おすすめ**：B。冒頭の問い（表をどれだけ細かくすれば当てられるか）と同じ向きで、数字が1つあり、答えが本編の中心（第2章）と一致する。「当てられなかった」は言い切れる範囲（相性の部分。好かれやすさは少し当たる、は本編で言う）。

## サムネイル案

`scenes/Thumb.tsx`（2026-10-10。様式は `docs/brand.md` のサムネイル）。情景は夜：長い条件の表（ケプラーの表）を持ったまま、顔は表ではなく右上の暖かい光を見上げる人形。星は少しだけ（冒頭の天文学者）。
書き出し：`cd render && npx remotion still src/index.ts <id> out/thumb008/<名前>.png`

- A `008-falling-in-love-thumb-after`「好きな理由は／あとから付く」（締めの結晶）
- B `008-falling-in-love-thumb-rewrite`「好みのほうが／書き換わる」（第3章の山 S20）
- C `008-falling-in-love-thumb-type`「理想のタイプは／あとで変わる」（B を自分に当てはめる言い方）
- B' `008-falling-in-love-thumb-joken`「条件のほうが／書き換わる」（r1 の任意の案）
- **推し（2026-10-10 クラウド）：B**。レビュー r1 B 6点（A・C 5点：本編が仮説で言うことを断定する）→ r2 **B 7点（合格）**・B' 6点（「好み」はかなが混じって小さくても読め、視聴者の言葉。「条件」は重い）→ r2 の仕上げ（人形を上げて右下を空ける・字を中心へ・周りの暗さを軽く）を入れた。★オーナーの確認待ち。競合の間に並べた見本での確かめはまだ（`review/thumbnail-r2.md`）
- やめた案：「条件の表は／当たらない」（S20 で恋人は最初の好みにある程度近かった。言い過ぎ）

### 人形の画像（Gemini の API。2026-10-10 クラウド）

`python scripts/gemini_image.py "<下の指示文>" _local/episodes/008-falling-in-love/thumb/doll-src3.png --aspect 2:3` → `python scripts/chroma_key.py doll-src3.png doll.png 14 28`（Gemini の緑は淡いので境目を下げる）。日本語の指示文では画像が返らなかった（NO_IMAGE）。顔の目鼻を消すには「featureless」をはっきり書く（1回目は鼻と口が出た）。4枚作って3枚目を使った。

```
Full-body 3D render of a smooth matte-white resin mannequin of a young adult. The head is completely featureless: a smooth egg-shaped face with NO eyes, NO nose, NO mouth, NO ears details, like a store display mannequin. Short sculpted hair in the same white resin. Plain white shirt and trousers in the same white. The figure holds a long paper scroll checklist with both hands at chest height; the scroll hangs down and curls on the floor (ruled lines and small empty checkboxes, no readable text). The body faces slightly left, while the head tilts up and turns toward the upper right, gazing into the distance, quietly captivated. Entire body visible from head to feet, nothing cropped, figure fills 85% of the image height. Soft light from upper right, thin bright rim light. Background: flat, uniform, highly saturated chroma-key green screen, exact color #00B140, no gradient, no floor, no shadow on background, no text, no other objects. Portrait.
```

## 概要欄

（出典一覧を含める）

## Shorts 案

| 開始 | 終了 | 内容 |
|---|---|---|
