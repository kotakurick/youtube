# 部品の一覧（資産）

絵はすべて `render/src/lib/` の部品で描く。回ごとの場面（`episodes/<回>/scenes/Episode*.tsx`）は部品を並べるだけにして、部品を回の中に作らない。

## 決まり（2026-10-05 オーナー「表現に必要な部品がなければ、どんどん部品として貯めて資産化したい」）

- 場面を作っていて、ここにない表現が要るときは、**回の中ではなく `render/src/lib/` に部品として作る**。回の中に書いた便利な部品も、次の回で使えそうなら lib に移す。
- 部品を作ったら：
  1. ファイルの頭に「何の部品か・決まり」をコメントで書く（ほかの部品と同じ形）
  2. 描いたものに `data-qa` の印を付ける（`render/src/lib/qa.ts`）
  3. この一覧に1行足す
  4. 見た目を確かめる見本が要るものは `render/src/demo/` に静止画を作り、`Root.tsx` に登録する
- オーナーの指摘で部品を直したときは、部品のコメントに日付と指摘を書く（同じ失敗を次の回で繰り返さないため）。

## 人と猫

| 部品 | ファイル | 使う所 |
|---|---|---|
| Figure | Figure.tsx | 群衆の1人（人型）。男女は色と胴の形。姿勢5つ。名札は文字40px固定、1人の寄りでは `ring={false}`（2026-10-05）。顔は描かない（2026-10-05 オーナー「目玉はいらない」） |
| Crowd | Crowd.tsx | 群衆（100人＝1人1%）。出発点→到着点へばねで移る |
| Cat | Cat.tsx | 物語の場面の登場人物（猫・トラ柄）。ポーズ5つ・表情5つ。見本 `cat-poses` |
| Gosa | Gosa.tsx | 案内役ゴサ。右下に固定、表情11種 |

## 文字の札

| 部品 | ファイル | 使う所 |
|---|---|---|
| Chip | Labels.tsx | 墨の札（見出し・条件・町の名前）。1行 |
| Facts | Labels.tsx | 箇条の札。**1つ1つが独立した事実・条件のときだけ**。1つの文を札に分けない（2026-10-05 オーナー） |
| Note | Labels.tsx | ひとつながりの文（説明・問い）を1枚の札に。`question` で問いの形 |
| Choices | Labels.tsx | 予想の選択肢を横1列（A〜D）。`answer` と `reveal` で答えを塗る |
| BigCount | Labels.tsx | 大きな数字＋単位（数えながら出る） |
| HeroNumber | HeroNumber.tsx | 主役の数字（200px） |
| Question | Question.tsx | 問いの見出し（冒頭など） |
| SourceNote | SourceNote.tsx | 出典。シミュレーションは `sim` |
| Bubble | StoryAnim.tsx | 吹き出し（物語の場面のせりふ） |

## グラフ

| 部品 | ファイル | 使う所 |
|---|---|---|
| BarChart | BarChart.tsx | 縦棒 |
| PairedBars | PairedBars.tsx | 男女2本ずつの縦棒 |
| BothSides | BothSides.tsx | 男女を左右対称に比べる（もう一方の側のデータ） |
| LineChart | LineChart.tsx | 推移の折れ線 |
| StackedTrend | StackedTrend.tsx | 構成比の推移（100%積み上げ） |
| Dumbbell | Dumbbell.tsx | 理想と実際の差 |
| Waterfall | Waterfall.tsx | 要因を分ける（滝グラフ） |
| Matrix | Matrix.tsx | 組み合わせの表 |
| Pyramid | Pyramid.tsx | 人口ピラミッド |
| TileMap | TileMap.tsx | 日本地図（タイル） |
| LookupTable | LookupTable.tsx | 自分に当てはめる表 |
| NormalRange | NormalRange.tsx | ふつうの幅（自分の値と見比べる） |

## シミュレーション

| 部品 | ファイル | 使う所 |
|---|---|---|
| Town / HeartRows / PairPanel | TownsSim.tsx | 紹介の町とアプリの町（1本目）。紹介の町は見出しに「知り合いの輪」の凡例、`ringsIn` で輪を描き入れる。引き合わせの線は成立した組だけ |
| MatchingSim / MatchingCompare | MatchingSim.tsx | マッチングのシミュレーション |
| CohortRace | CohortRace.tsx | 年齢ごとの割合で進める100人の競争 |
| FilterSteps | FilterSteps.tsx | 条件を重ねて100人が減る |
| SimSpread | SimSpread.tsx | シミュレーションのばらつき |
| Slider | Slider.tsx | 「もしも」の条件のつまみ |
| SimBackground | SimBackground.tsx | シミュレーションの場面の方眼 |

## 物語の場面

| 部品 | ファイル | 使う所 |
|---|---|---|
| Backdrop | Backdrop.tsx | 背景（部屋・駅・夜の街・職場）。`night` で夜 |
| Props | Props.tsx | 小道具（Phone・Table・Chair・Desk・Clock・Calendar・Cup） |
| SwipeDeck | StoryAnim.tsx | スマホのカードが左右へ飛ぶ |
| NotifStack | StoryAnim.tsx | いいねの通知が積もる |
| OfficeYears | StoryAnim.tsx | 職場の机が年ごとに空いていく |
| DayReplay | DayReplay.tsx | 日ごとの再現（日めくり） |
| Bedroom | Bedroom.tsx | 夜のワンルーム（ベッド・時計1時10分・月の窓）。窓に雪・雲・床の光を出せる。冒頭と締めで同じ部屋に（2本目） |

## お金の比喩（2本目 r > g で作った）

| 部品 | ファイル | 使う所 |
|---|---|---|
| Snowball / ballR | Snowball.tsx | 雪玉＝資産。内から外へ 芯（灰）→ 利息（黒）→ 降った雪（白）。面積＝金額（半径＝k×√万円）。扇形にしない |
| Snow / Flake / Cloud | Snowball.tsx | 降る雪（6本線の雪片）と雲（給料）。`Cloud dashed` で比べる用の点線の雲 |
| VillageIcon | Village.tsx | 暮らし方の目印（預金・積立・稼ぐ力・起業・不動産・両方）。分かれ道の札と村の札に同じ絵 |
| DebtBall | Money.tsx | 借金（鎖の玉）。人に付けてよい（`data-qa-allow="figure"`） |
| EquityBox | Money.tsx | 持ち分の箱（借金で買ったときのてこ）。値段が借金より安いと点線の箱＝売っても返せない借金 |

## 型と演出

| 部品 | ファイル | 使う所 |
|---|---|---|
| ChapterCard / ChapterDots | Chapter.tsx | 章の扉と位置の点 |
| Quiz | Quiz.tsx | 予想タイム（問いと選択肢を全面で） |
| Verdict | Verdict.tsx | 答え合わせ（〇△×） |
| Cards | Cards.tsx | チャンネル名・今日の答え合わせ・中間の確認・登録の一言 |
| Camera | Camera.tsx | 寄り・引き・横移動 |
| Counter / Bracket | Counter.tsx・Bracket.tsx | 人数の数え上げ・まとまりの括弧 |
| SignOff | SignOff.tsx | 毎回の締めのひと言のアニメーション（丘の猫2匹・100個の点が星になる）。教訓のあと、終了画面の前 |
| EndScreen | EndScreen.tsx | 終了画面 |
| Thumbnail | Thumbnail.tsx | サムネイル |
