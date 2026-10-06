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
npm run render -- parts out/parts.mp4            # 部品の見本帳
npm run render -- demo-short out/short.mp4       # 縦型ショートの見本（1080×1920）
npm run still -- demo-thumb out/thumb.png        # サムネイル（紙色の地）。-thumb-ink は墨の地（テスト用）
npm run still -- gosa-sheet out/gosa.png         # ゴサの表情一覧（確認用）
npm run still -- pose-sheet out/pose.png         # 姿勢と小道具の一覧
npm run still -- backdrop-sheet out/bg.png       # 背景の一覧
npm run master -- out/001.mp4                    # 音量を -14 LUFS にそろえる → out/001.master.mp4
npm run storyboard -- 002-r-greater-than-g       # 絵コンテ：場面を1枚ずつ書き出してチェックし、4列の一覧に → out/<回>-storyboard.png
npm run check -- demo                            # 画面のチェック（重なり・小さい文字・はみ出し）→ out/qa/demo/
npm run storyboard -- 001-where-couples-meet-v2  # 静止画の絵コンテ（場面ごとに2〜3枚＋画面のチェック）→ out/storyboard/<id>/index.html
npm run typecheck                                # 書き間違いの確認
```

`npm run sync` が、書き出しの前に素材を `public/` にそろえる（ゴサの SVG、フォント、各回の音声、BGM、効果音）。
BGM は YouTube オーディオライブラリから落とした曲を `$YT_DATA_DIR/bgm/` に置く。置いたら `npm run bgm` で測る（長さ・音量・ピーク・途中の無音・終わりのフェード・テンポの目安・声の帯域の強さ）。結果は `research/bgm.md`、曲ごとの音量の直しは `bgm/levels.json` に書かれ、`Episode` が自動で使う（どの曲も声の下で約19dB小さく聞こえるようにそろう）。曲を替えたら測り直す。効果音はコードで作る（`scripts/make-sfx.mjs`）。`public/` は作り直せるので Git に入れない。
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
    Camera.tsx      カメラ（寄り・引き・横移動、ゆっくり寄る drift）
    Counter.tsx     人数カウンター
    Quiz.tsx        予想タイム・クイズ（選択肢4つまで、3秒の輪、答えが光る）
    TownsSim.tsx    紹介の町とアプリの町（Town：1か月ずつ動かす／HeartRows：いいねの山／PairPanel：100人のうちペアの人だけ色）。計算は sim/towns.ts
    NormalRange.tsx ふつうの幅（自分に当てはめる。幅は誤差棒、指が動いて「あなた」で止まる）
    LookupTable.tsx 自分に当てはめる表（3×3まで、指が行→列→マスとたどる）
    Slider.tsx      もしもの条件のつまみ
    DayReplay.tsx   日ごとの再現（日めくり＋時計）
    LineChart.tsx   推移の折れ線（端に直接ラベル、時代の札）
    TileMap.tsx     日本地図（47都道府県のタイル、墨の5段階）
    BothSides.tsx   もう一方の側（男女を左右対称に比べる）
    EndScreen.tsx   終了画面（20秒、YouTube の要素を置く枠）
    Figure.tsx の pose  姿勢（立つ・座る・スマホ・うつむく・歩く、facing で向き合う）。Crowd の Person.pose で時刻ごとに変えられる
    Props.tsx       小道具（スマホ〈一覧・いいね・メッセージ〉、テーブル、椅子、机、時計、カレンダー、カップ）。家具は人物と同じ単位
    Backdrop.tsx    物語の背景（部屋・駅のホーム・夜の街・職場）。墨2と紙色2の線画、variant で構図が変わる
    sim/matching.ts 婚活のマッチングの計算（安定マッチングを基本に、条件で変えられる。純粋な関数、種で同じ結果）
    MatchingSim.tsx マッチングの描画（1回ずつペアが並び直し、残りを数える）、MatchingCompare（現実ともしもを左右に）
    StackedTrend.tsx 構成比の推移（100%積み上げの横帯、注目の区分だけ色、帯の間を線でつなぐ）
    Narration.tsx   読み上げとのつなぎ：fromTiming（timing.json から場面・字幕・音声）、useNarration（動きを読み上げに合わせる）、draft（仮通し）
    sim/spread.ts + SimSpread.tsx  シミュレーションのばらつき（100回やり直し、9割の幅を誤差棒で）
    sim/filter.ts + FilterSteps.tsx 条件を1つずつ重ねて100人が減る（独立か相関かを仮定として出す）
    sim/cohort.ts + CohortRace.tsx  年齢ごとの割合で1年ずつ進める（25歳で始めた100人と35歳で始めた100人など）
    sim/ageMatch.ts + Pyramid.tsx   年齢で相手を選ぶと誰が余るか、人口ピラミッド
    PairedBars.tsx  男女2本ずつの縦棒
    Waterfall.tsx   要因を分ける滝グラフ
    Matrix.tsx      組み合わせの表（5×5まで、濃さで表す、対角を強調）
    Dumbbell.tsx    理想と実際を線でつなぐ
    Cards.tsx の MidCheck・SubscribeNudge  ここまでの答え合わせ（1行）、登録のお願い（画面の文字で1行）
    Figure の age   子ども・高齢（杖）。Backdrop に和室・結婚式場
    Episode.tsx     1本＝場面の並び（場面ごとに長さと音声、BGM の層）
  src/demo/       見本（demo.tsx：標準構成を短く通す／parts.tsx・parts2.tsx：部品の見本帳／short.tsx：縦型ショート／
                  demo-narrated/：台本 → narrate.py → 動画の流れ／GosaSheet.tsx：ゴサの表情一覧）。数字はすべて仮
  src/Root.tsx    動画の一覧（episodes/<回>/scenes/Episode.tsx を自動で登録。thumb があればサムネイルも）
  scripts/        sync-assets.mjs（素材をそろえる）、make-sfx.mjs（効果音）、master.mjs（音量の仕上げ）
```

縦型ショートは `episodes/<回>/scenes/Short.tsx` に書く（1080×1920 で自動登録。部品は縦長だと縦用の区画 `ZS` に自動で切り替わる）。
各回の場面のコードは `episodes/<回>/scenes/Episode.tsx` に書く（雛形は `episodes/_template/scenes/Episode.example.tsx`）。
部品は `@lib/...` で読み込める。

## 画面のチェック（npm run check）

図と図・図と文字の重なりを、人の目ではなく仕組みで見つける。

- 各場面の「真ん中」と「終わりの0.5秒前」を書き出し、実際の画面上の位置で、文字・人型・ゴサ・グラフ・小道具・字幕の帯の箱を測る。
- 見つけるもの：文字どうしの重なり、文字と人型・ゴサ・小道具の重なり、ゴサと図の重なり、字幕の帯にかかるもの、28px未満の文字、画面からはみ出した文字、再生バーの重なる下80pxの文字。
  文字とグラフの棒・線の重なり、人型とグラフの重なりは「確かめるもの」（直すとは限らない）。
- 結果は `out/qa/<id>/report.md` と、問題のあったコマの画像（赤＝直すもの、橙＝確かめるもの、番号は報告の番号）。直すものがあれば終了コード1。
- 部品の決まり：描いたものに `data-qa`（figure／gosa／mark／prop／sub／bg）を付ける。文字は自動で拾う。わざと重ねるところは `data-qa-allow`（例：人型の名札、ゴサがひげで数字を指すとき、寄りの画面の字幕）。親子の関係にあるもの（カードの中の文字など）は調べない。
- 文字の箱は、フォントの上下の余白を除いた字の高さで測る（行の箱で測ると、重なっていないものまで重なりに見えるため）。
- 動いている途中の重なり（人が移動中など）は調べない。止まった画面だけを調べる。

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
