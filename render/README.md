# 描画・合成（Remotion）

動画は Remotion（React＋SVG）で作る（2026-10-04 決定、`docs/decisions.md`）。
群衆は100人が標準（1人＝1%）。決まりは `CLAUDE.md` の「作り方の基準」と `docs/brand.md`（色・大きさ・動きの数字は `src/lib/theme.ts`）。

## 使い方

初回だけ（オーナーのパソコン）：Node.js（LTS版）を入れてから、

```bash
cd render
npm install
```

毎回：

```bash
npm run studio                                   # ブラウザで確認（コマ送り・場面ごとの確認）
npm run render -- demo out/demo.mp4              # 書き出し（demo は部品の見本）
npm run render -- 001-where-couples-meet out/001.mp4
npm run still -- demo-thumb out/thumb.png        # サムネイル（紙色の地）。-thumb-ink は墨の地（テスト用）
npm run still -- gosa-sheet out/gosa.png         # ゴサの表情一覧（確認用）
npm run master -- out/001.mp4                    # 音量を -14 LUFS にそろえる → out/001.master.mp4
npm run typecheck                                # 書き間違いの確認
```

`npm run sync` が、書き出しの前に素材を `public/` にそろえる（ゴサの SVG、フォント、各回の音声、BGM、効果音）。
BGM は YouTube オーディオライブラリから落とした曲を `$YT_DATA_DIR/bgm/` に置く。効果音はコードで作る（`scripts/make-sfx.mjs`）。`public/` は作り直せるので Git に入れない。
フォントは Noto Sans JP（OFL）を初回に一度だけダウンロードする（約9.6MB）。

## 作り

```
render/
  src/lib/        部品（どの回でも使う）
    theme.ts        見た目の数字（色・区画 Z・文字 T・線・角・ばね SPRING・ゴサの大きさ）。sec(秒) でフレーム数
    Figure.tsx      群衆の1人（男女の面積をそろえた形、その他は丸い胴、追う1人は輪＋名札、対象外は薄い色）
    Crowd.tsx       群衆（出発点→到着点をばねで動かす。重なっていたら止める）
    layout.ts       並べ方（ばらまき・格子・100マス・重なりの確認）
    Gosa.tsx        ゴサ（gosa.json を読んで描く。表情の間をなめらかに、まばたき、吹き出し、効果音、ひげで指す）
    Cards.tsx       ChannelTag（冒頭のチャンネル名）、TodayCard（今日の答え合わせ）
    Chapter.tsx     章の扉（墨のワイプ）と章の位置の点
    Question.tsx    問いの見出し（冒頭とカードのときだけ）
    HeroNumber.tsx  主役の数字（数え上げ＋蛍光ペン）
    BarChart.tsx    棒グラフ（注目の1本、誤差棒、barGeometry で位置を取れる）
    Bracket.tsx     まとまりの括弧とラベル
    SimBackground.tsx シミュレーションの場面の方眼
    SourceNote.tsx  出典（グラフの左下）。sim でシミュレーションの札
    Subtitle.tsx    字幕（幅を固定した帯、48字まで）
    Verdict.tsx     答え合わせ（証拠｜印｜ゴサ の3列、刻み→無音→スタンプ）
    Sfx.tsx         効果音
    Thumbnail.tsx   サムネイル（1280×720）
    Episode.tsx     1本＝場面の並び（場面ごとに長さと音声、BGM の層）
  src/demo/       部品の見本（demo.tsx：標準構成を短く通す、数字は仮）とゴサの表情一覧
  src/Root.tsx    動画の一覧（episodes/<回>/scenes/Episode.tsx を自動で登録。thumb があればサムネイルも）
  scripts/        sync-assets.mjs（素材をそろえる）、make-sfx.mjs（効果音）、master.mjs（音量の仕上げ）
```

各回の場面のコードは `episodes/<回>/scenes/Episode.tsx` に書く（雛形は `episodes/_template/scenes/Episode.example.tsx`）。
部品は `@lib/...` で読み込める。

注意：
- Remotion は props を JSON にするので、場面（関数）は props で渡さない（`Root.tsx` が回ごとに部品を作っている）。
- 日本語フォントの読み込みに時間がかかるので、待ち時間の上限を120秒にしている（`remotion.config.ts`）。

## 試作での比較（2026-10-04）

同じ10秒の場面を両方で作った：問いのタイトル → 120人の群衆がペアになっていく（カウンター付き）→ 棒グラフが伸びる（出典付き）→ ゴサが考え中から驚きに変わる、字幕つき。
さらに「1000人が同時に動く5秒」で負荷を試した。コードは `prototypes/`。

| | Remotion（React＋SVG） | Manim（Python） |
|---|---|---|
| 10秒の場面（1080p・30fps） | 24秒（準備の約6秒を含む） | 21秒 |
| 1000人が動く5秒 | **18秒** | 40秒 |
| 20分の動画にすると（目安） | 群衆の場面が多くても30〜45分程度 | 群衆の場面が多いと1時間を超えうる |
| ゴサの SVG | そのまま使える（暗い背景用の縁取りも効く） | 読み込めるが、縁取りのフィルタは効かない |
| 日本語の文字・字幕 | ブラウザと同じ（折り返し・装飾が自由） | 1行ずつの配置が基本。細かい組版は手間 |
| 数字のカウンター | 普通の文字で書ける | 既定では LaTeX が要る（Windows に MiKTeX の導入が必要） |
| 音声に合わせる | 音声ファイルを置いて秒数で並べられる | 自分でタイミングを計算する |
| 確認のしやすさ | ブラウザの画面でコマ送りしながら確認できる（Remotion Studio） | 書き出して再生して確認 |
| Windows での導入 | Node.js だけ | Python ＋ ffmpeg（＋数式を使うなら LaTeX） |
| ライセンス | 個人は商用でも無料（社員4人以上の会社は有料） | 無料（MIT） |

時間はこのクラウド環境（4コア）での実測。オーナーのパソコンでは速さが変わる。

## 推奨：Remotion（→ 採用）

- 1000人の群衆を動かす場面で2倍以上速く、「1000人シミュレーション」の看板シリーズに向く。
- ゴサの SVG・字幕・音声・グラフを、ウェブの部品として組み立てられる。Claude が最も書き慣れている形。
- オーナーがブラウザで動画をコマ送りして確認・指摘できる。
- 注意：将来、社員4人以上の会社で運営する場合は有料ライセンスが必要になる。Remotion 5.0 でライセンスが少し変わる予定（公式の告知を確認する）。
