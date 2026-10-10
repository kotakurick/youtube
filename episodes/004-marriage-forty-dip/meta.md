# メタデータ

## タイトル案

**決定（2026-10-07 オーナー）：夫婦の満足度と一緒に動いていたのは、家事の量ではなかった**
- この回の本筋は「満足度と一緒に動くファクターは何か」（時間の長さ・夫の家事の割合・末っ子の年齢・心の支え）。答えは伏せ、ファクターの分析だと分かる形。「決める」「原因」とは言わない（どちらが先かは分からない）。
- サムネイル「妻の不満が／増える時期」と分担：サムネイル＝不満が増える時期がある、タイトル＝その理由は家事の量ではない。
- 下の3案と「末っ子が小学生になるころ…」は、本筋（ファクター）より脇の話（時期）を言うので不採用。

（2026-10-07 検討中。前に書いた「…下がるのはなぜ」は、`docs/brand.md` のパッケージ（「なぜ〜」を使わない・数字は1つまで）に反するので取り下げた。「だけ」は使わない（オーナー）。）

1. 型A：家事と仕事を足すと夫婦の差は2分。それでも妻の満足度は下がっていく（数字は「2分」）
2. 型C：末っ子が小学生になるころ、夫婦の満足度にずれが出はじめる（数字なし。子育て中の人が自分に当てはめられる。「分かれはじめる」は離婚に読めるのでサムネイル役 r1 の案に替えた）
   - **推し：タイトル2**（サムネイルは A に決定）。「40代」は概要欄の1行目に入れる
3. 型A：夫婦の時間はつり合っていた。妻の満足度を分けていたのは家事ではなかった（数字なし）

## サムネイル案

**決定（2026-10-07 オーナー）：A「妻の不満が／増える時期」。心の声「うん」は入れない。** タイトルは上の決定のとおり。

`scenes/Thumb.tsx`（`004-marriage-forty-dip-thumb-a`・`-thumb-b`）。様式は 001 の Duo にそろえた：左右2色の地（夫＝青・妻＝赤）・白い人・明朝体。主題は本編の天秤（水平につり合っている）。人は仮のシルエットで、オーナーが画像生成AIで作った人形に差し替える。

- A：「妻の不満が／増える時期」（時期を伏せる。r1 で「妻が冷める」は言い切りすぎと指摘され、本編の数字の範囲の言い方に替えた）
- B：「差は2分／なのに冷める」（不採用）。主語を置かないので、2人とも冷める本編の判定と合う
- 2026-10-07 r1 の直し：人を大きく、夫は背すじを伸ばした正面・妻は肘を抱えて顔を外へ（`render/src/lib/Silhouette.tsx` の MAN_STAND・WOMAN_HUG）、梁を太く、文字に強弱
- 2026-10-07 r2：**B 7点（合格）・A 6点**。直し：人の高さ約340px（梁 y=330）、Aの黄色は「増える」だけ、心の声は110pxに大きくして「。」を外し、糸と重ならない位置へ。8点に近づけるのは人形への差し替え（下）

### 人形の画像（2026-10-10 決定版：案C「食卓」。Gemini の API）

オーナーの指摘（「男性がぼやけている」「単調。毎回同じようなフォーマットだとフックにならない。イラストの問題」）で、立ち姿の2人をやめて、場面のある絵にした。案は A 車の中・B ソファの両端・C 食卓で、オーナーが **C** を選んだ。様式（白い人形＋太いゴシック）はそのままで、**場面とポーズを回ごとに変える**。

夜の食卓で、夫はあごに手を当てて考え込み、妻はカップを持って別の方を見る。手前に子どもの空いた椅子。人形・食卓・椅子は同じ白の1枚の画像。2人とも同じ白・同じ光で、どちらも悪く見せない。

作り方：

1. `python scripts/gemini_image.py "指示文" table-raw.png --aspect 4:3`（鍵は環境変数 `GEMINI_API_KEY`）。3枚作って、2人の目が合っていないものを選ぶ
2. `uv run -q --no-project --python 3.12 --with pillow --with numpy python -I scripts/chroma_key.py table-raw.png table.png`（抜いた大きさ 682×581。Thumb.tsx の aspect）
3. `_local/episodes/004-marriage-forty-dip/thumb/table.png` に置く（`npm run sync` が `render/public/` に写す）
4. `cd render && npx remotion still src/index.ts 004-marriage-forty-dip-thumb out/004-thumb.png`

指示文（3枚のうち1枚目を採用）：
```
Minimalist sculpture scene, everything made of the same bright pure white matte material, brightly lit. Three-quarter view from slightly above, of a small dining table in the center. A man sits on a chair at the left end of the table and a woman sits on a chair at the right end. Their chairs are turned outward, away from the table: the man's body and head face toward the left edge of the image, the woman's body and head face toward the right edge of the image, so they sit almost back to back with the table between them and never look at each other. The man rests his chin on his hand, thinking. The woman holds a cup with both hands, looking into the distance. Both calm and quiet, same posture weight, no anger, no sadness. Both are faceless abstract mannequin figures with smooth egg-shaped heads: no eyes, no nose, no mouth. The man (40s) has short neatly styled sculpted white hair, white long-sleeve shirt and white trousers. The woman (40s) has shoulder-length sculpted white bob hair, white long-sleeve blouse and white trousers. At the far side of the table stands one small empty child's chair. Sharp focus, crisp clean edges. Background is a single solid flat bright pure green color, evenly lit, no gradient, no floor shadow. No text, no letters, no watermark.
```

うまくいかなかった指示：「顔をそらす」だけだと2人が見つめ合う（面接に見える）。体ごと外へ向ける、と書く。横長の長い食卓で椅子を離すと、2人とも正面を向いて並ぶ絵になった。

抜き方の直し（`scripts/chroma_key.py`）：Gemini の緑はくすみ、白い服の影に緑が映り込む。最初は脚の影が透けた（オーナー「男性の足が消えているように見える」「女性も」）。いまは明るさで割った緑の割合で測り、背景の75%までは人物とみなし、いちばん大きいかたまりだけを残す。

レビュー（`review/thumbnail-table.md`）：r1 6.0 → r2 6.8（脚・ぼやけは解消）→ **r3 7.0（合格）**。残り（任意）：手前の椅子が妻の脚と重なり、縮めると家具に見えるかもしれない。直すなら画像の作り直し（妻を窓へ向け、椅子を食卓から離す）。

### 人形の画像（旧：立ち姿の2人。使わない）

オーナーの指示で2人とも髪をつけた（上の「髪は描かない」は Canva 版のときの決まりで、これで置き換える）。服は白の長袖シャツとズボン（裸の指定は安全フィルターに止められる）。2人とも同じ白・同じ光で、どちらも悪く見せない。

作り方（クラウドでもローカルでも同じ）：

1. `python scripts/gemini_image.py "指示文" husband-raw.png`（妻も同じ。鍵は環境変数 `GEMINI_API_KEY`、モデルは gemini-2.5-flash-image、縦 2:3）
2. `uv run -q --no-project --python 3.12 --with pillow --with numpy python -I scripts/chroma_key.py husband-raw.png husband.png`（Gemini の緑はくすむので、閾値は画像ごとに外周の背景から決まる）
3. `_local/episodes/004-marriage-forty-dip/thumb/` に `husband.png`・`wife.png` を置く（`npm run sync` が `render/public/` に写す）。抜いた大きさは夫 492×1205・妻 387×1189（Thumb.tsx の aspect）
4. `cd render && npx remotion still src/index.ts 004-marriage-forty-dip-thumb out/004-thumb.png`

**夫**（3回目を採用。1回目は鼻と口が出て、背景の色の「#00B140」を文字として描いた。色番号は書かず、文字を入れないと書く）
```
Faceless abstract matte-white mannequin figure with a smooth egg-shaped head: no eyes, no nose, no mouth, no ears, completely blank face. Adult man in his 40s with short neatly styled sculpted hair in the same matte white. Plain white long-sleeve shirt and plain white trousers. Standing upright facing the camera, calm, arms relaxed at his sides, framed from the knees up. Soft studio light. Background is a single solid flat bright pure green color, evenly lit, no gradient, no vignette, no shadow. No text, no letters, no watermark anywhere in the image.
```

**妻**（1回目を採用）
```
Faceless matte-white mannequin figure, smooth featureless face, adult woman in her 40s with shoulder-length sculpted hair in the same matte white, plain white long-sleeve blouse and plain white trousers, body turned three-quarters, head turned away looking into the distance, one hand holding the other elbow, framed from the knees up, soft studio light, solid flat chroma-key green background (#00B140), no shadow on the background.
```

サムネイルのレビュー（`review/thumbnail-gemini.md`）：r1 6.5点 → 妻を主役に（大きく・夫と約70px離す）、右上に妻の視線の先の灯、ふちの光をそろえる → **r2 7.0点（合格）**。そのあと任意の直し（灯を少なく明るく、字 118px）。

### 人物の画像（旧：Canva 版の指示文。使わない）

顔の目鼻のない白い人形・全身・透明の背景は 001 と同じ。r2 の指摘で、**髪・服・スカートは描かず、性別は肩幅と腰の線だけで分ける**（髪型やスカートで性別を示すと、性別全体の決めつけに寄るため）。2枚は同じ素材・同じ光・同じ高さ・同じ頭の大きさで別々に作り、片方だけをみじめにも悪者にも見せない。差し替えたら夫 x=300・妻 x=980・足元 y=690 に置き、`npm run check` で糸と重ならないか確かめる。

**夫（husband.png）**
```
つるっとした白い樹脂のマネキン人形（顔の目鼻・髪・服・靴はない。関節のある木製人形ではない）。リアルな人間の体のつり合いの、40代の男性の体つき（肩幅が広く、腰はまっすぐ）。
正面を向いて立ち、背すじを伸ばし、頭を上げている。両腕は体の横に自然に下ろす。うつむかない、腕を組まない。首はつながっていて、頭と体が離れて見えないこと。
全身、足の裏まで入れる。体が画面の端で切れない。カメラは胸の高さ。
色は純白に近い明るい白（#F5F5F5）。左上からのやわらかい光で、体の縁に細い明るい線（リムライト）。影は足元だけ。
背景は透明。床・文字・ほかの物は入れない。縦長、高さ1500px以上。
```

**妻（wife.png）**
```
つるっとした白い樹脂のマネキン人形（顔の目鼻・髪・服・靴はない。関節のある木製人形ではない）。リアルな人間の体のつり合いの、40代の女性の体つき（肩幅はやや狭く、腰の線にくびれ）。
体は斜め後ろ向き（4分の3）に立ち、頭は体の向きよりさらに外側（画面の右）へ、約60度そらして、遠くの窓の外を見ている。うつむかない、肩を落とさない。泣く・怒るなどの感情は入れない、静かな姿勢。
片手でもう一方の肘を抱え、腕を組む形に近づけて手の指は隠す。
全身、足の裏まで入れる。体が画面の端で切れない。カメラは胸の高さ。
色は純白に近い明るい白（#F5F5F5）。左上からのやわらかい光で、体の縁に細い明るい線（リムライト）。影は足元だけ。
背景は透明。床・文字・ほかの物は入れない。縦長、高さ1500px以上。
夫の画像と同じ素材・同じ光・同じ頭の大きさにする。
```

## 概要欄

（出典一覧を含める）

## Shorts 案

| 開始 | 終了 | 内容 |
|---|---|---|
