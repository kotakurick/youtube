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
| Cat | Cat.tsx | 物語の場面の登場人物（猫・トラ柄）。ポーズ5つ・表情7つ（2026-10-06 眠る `sleep`・少し笑う `smile` を足した）。顔を横へ向ける `turn`（−1〜1。大きな猫の向きを見せる。0 なら前と同じ絵）。`think` は人に向けるとジト目に見えるので、男女の回では人に向けない。見本 `cat-poses` |
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
| Bubble | StoryAnim.tsx | 吹き出し（物語の場面のせりふ）。`w` で幅をそろえる（2つの言い分を同じ大きさに） |
| Thought | StoryAnim.tsx | 考え中の吹き出し（思っていること・言えていないこと）。しっぽの代わりに小さな丸3つ、`dashed` で点線（4本目） |

## グラフ

| 部品 | ファイル | 使う所 |
|---|---|---|
| BarChart | BarChart.tsx | 縦棒 |
| PairedBars | PairedBars.tsx | 男女2本ずつの縦棒（`names` で「夫」「妻」） |
| PairedRows | PairedRows.tsx | 男女2本ずつの横棒（項目が10〜13個と多いとき）。focus で項目名を墨の太字＋下線（6本目） |
| LogRuler | LogRuler.tsx | 対数のものさし。「2組に1組」〜「10万組に1組」のように桁の違う確率をピンで並べ、括弧で何倍かを見せる（6本目） |
| GenderLines | GenderLines.tsx | 夫と妻（男女）の割合の線。縦軸0〜100%固定（平均点は `domain` で尺度の端から端）。別の調査を白抜きの点で重ねる（つながない）・帯（見出しは中の下にも）・途中まで描く・重なる点を輪で見せる `ring`・比べ用の細い線 `thin`（4本目） |
| PercentColumns | PercentColumns.tsx | 100%の柱（満足＝淡い・満足でない＝濃い など）。括り・別の年の値（柱の左右の短い線）。値の置き場所 `valuePos`（柱の中／下の段のすぐ上／柱の上）（4本目） |
| DayStack | DayStack.tsx | 一日の時間の中身の積み上げ柱（高さ＝分）。前→後を帯でつなぎ、中身の入れ替わりを見せる。内訳はその人の色1つで塗り・水玉・斜線（`fill`。濃い・淡いを使わない）（4本目） |
| FillDefs / fillOf / FillSwatch | Fills.tsx | 塗りの種類（塗り／斜線／水玉）と凡例の見本。同じ人の内訳を濃淡でなく模様で分ける。模様の上の文字は `textHalo`（4本目） |
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
| CohortRace | CohortRace.tsx | 年齢ごとの割合で進める100人の競争。`mode="leave"` で起きた人（別れた夫婦など）が列から抜けて点線の跡が残り、上に「残った○人のうち、○○ ○人（○%）」（`focus`・`focusName`。並べ方は `cols`・`dx`・`dy`）。人ごとに割合を変えるのは `sim/cohort.ts` の `cohortBy`（4本目） |
| FilterSteps | FilterSteps.tsx | 条件を重ねて100人が減る |
| ConditionGrid | ConditionGrid.tsx | 条件の盤（2×2）。仮定を2つ動かした4つの町で、どちらが勝つかを横棒で比べる（条件で答えが変わる回） |
| SimSpread | SimSpread.tsx | シミュレーションのばらつき |
| Slider | Slider.tsx | 「もしも」の条件のつまみ |
| SimBackground | SimBackground.tsx | シミュレーションの場面の方眼 |

## 物語の場面

| 部品 | ファイル | 使う所 |
|---|---|---|
| Backdrop | Backdrop.tsx | 背景（部屋・駅・夜の街・職場）。`night` で夜 |
| Props | Props.tsx | 小道具（Phone・Table・Chair・Desk・Clock・Calendar・Cup・Bench） |
| Icons | Icons.tsx | 小さな目印の絵（64px）：Ball・Randoseru・Bottle・SchoolBag・Ear・Hanamaru・Bulb・House・Briefcase。文字だけの札・軸の区切りに添える（4本目） |
| SwipeDeck | StoryAnim.tsx | スマホのカードが左右へ飛ぶ |
| NotifStack | StoryAnim.tsx | いいねの通知が積もる |
| OfficeYears | StoryAnim.tsx | 職場の机が年ごとに空いていく |
| DayReplay | DayReplay.tsx | 日ごとの再現（日めくり） |
| CarFront / Navi / TrafficSignal | Car.tsx | 車の中を前から（右ハンドル：運転席は画面の左、後ろの席の子は前の席のあいだ）。信号（赤・青）、カーナビの大きな画面（地図の印は右上だけ）。夕方の進み `time`（0〜1）。猫は `CAR` の座標に置く（4本目の冒頭と教訓） |
| Balance / LooseWeight | Balance.tsx | 天秤。皿は三角のひもで吊り、分銅はつまみ付き・横幅一定・高さ＝量（面積＝量）。針と目盛りは支点の下。傾きは量の差から、`tilt`＋`moving`（前の角度の残像・下向きの矢印）で動いている途中。`veiled` で中身を隠す「？」の袋、`dashed` で量り忘れ。皿の外の点線の分銅は `LooseWeight`（4本目） |
| CouplePairs / PeopleRows | CouplePairs.tsx | 夫婦の組の並び（1組＝夫と妻が肩を接して立ち、床1枚。組と組のあいだは空ける。夫が左）と、組にする前の性別ごとの列。注目は濃い色、`mark` で床を墨のふち（4本目の引き算） |
| Tv・TvGlow・Sofa | Living.tsx | 居間のテレビ（画面にドラマの1場面）とソファ（6本目） |
| BorderMap | BorderMap.tsx | 地図と国境線の比喩（ひとりの線＝1枚の地図）。seed で線の形、2本重ねてずれを見せる（6本目） |
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
| Quiz | Quiz.tsx | 予想タイム（問いと選択肢を全面で）。読み上げに合わせる `choiceAt`・`ringAt`・`revealAt`、引っかけの揺れ `nudge`、ゴサの足元 `gosaFoot`（4本目） |
| Verdict | Verdict.tsx | 答え合わせ（〇△×）。証拠の文は `\n` で手で改行できる。読み上げに合わせる `chipAt`・`hitAt`（4本目） |
| Cards | Cards.tsx | チャンネル名・今日の答え合わせ・中間の確認・登録の一言 |
| Camera | Camera.tsx | 寄り・引き・横移動 |
| Beat / Enter / EnterG / Wipe / ramp / useCue | Motion.tsx | 場面の中の区切りと出し方：区切り（Beat）、ばねで出す（Enter は HTML、EnterG は SVG の中）、左→右・下→上にぬぐって見せる（Wipe）、0→1 の補間（ramp）、読み上げの語の時刻（useCue。見つからなければ予備の値）（4本目） |
| Counter / Bracket | Counter.tsx・Bracket.tsx | 人数の数え上げ・まとまりの括弧 |
| SignOff | SignOff.tsx | 毎回の締めのひと言のアニメーション（丘の上のゴサが100個の点を数え、点が星になる）。教訓のあとに `<SignOff />`、終了画面に `<SignOff end />`（同じ夜のまま右に次の1本・再生リストの枠） |
| EndScreen | EndScreen.tsx | 古い終了画面（紙の地）。新しい回は `<SignOff end />` を使う |
| Thumbnail | Thumbnail.tsx | サムネイル |

## 画面・小道具（3本目で追加）

| 部品 | ファイル | 使う所 |
|---|---|---|
| SearchScreen | SearchScreen.tsx | 相談所・婚活サービスの「会員を探す画面」。上に条件に合う人数、下にチェックの行（`mark` で枠、`dim` で話の外）。実在のサービスに似せない。人数の代わりに「？」も出せる（相手の画面）。3本目で作った（2026-10-06） |
| TwoRulers | TwoRulers.tsx | 二本の物差し：横（お金・金）と縦（身長・青緑）の間に100人を並べた模式図。同じ物差しの条件の切り線は平行（重ねても減らない）、別の物差しは直角（掛け算で減る）（3本目、2026-10-06） |
| Sieve | Sieve.tsx | ふるい（楕円の縁・網・取っ手）。dashed は相手の側の「数え忘れている」ふるい（3本目、2026-10-06） |
| TwoSieves | TwoSieves.tsx | （3本目の絵コンテ第2版では使わなかった。人型が小さい）両側のふるい：女性が男性を選ぶ100人・男性が女性を選ぶ100人・両方を通った100組を横に並べる。片側なら多く通るのに、両側は少ない（3本目、2026-10-06） |
