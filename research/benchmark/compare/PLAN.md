# 伸びた／伸びていないチャンネルの比較の手順

2026-10-03 オーナー依頼。パソコン上の Claude Code が、定額プランの中でこの手順どおりに進める。
目的は3つ。

1. 似た戦略なのに伸びていないチャンネルとの差を知る
2. 伸びる・伸びないを分ける大きな差がどこにあるかを知る
3. 読み上げ音声（TTS）の質の差を知る

取得物は分析専用。制作物に流用しない。

## 方針

- **比べ方をそろえる**：どちらの群も「各チャンネルの新しい順に6本」で比べる。伸びた側だけヒット作を選ぶと差が水増しされる。
- **伸びていないチャンネルも公平に探す**：関連度順の検索は伸びた動画ばかり出すので、「新しい順」の検索も混ぜる（`find_channels.py`）。
- **チャンネル単位で比べる**：まずチャンネルごとに中央値や割合を出し、それを群どうしで比べる（`compare.py`）。
- **声は Claude には聞けない**：コードで測れる数字（話す速さ、間、抑揚、音量の幅）と、オーナーの聞き比べ（チャンネル名を伏せて採点）を組み合わせる。
- **因果ではない**：チャンネル数が少ないので、「伸びたチャンネルにはこういう特徴が多い」までしか言えない。開始時期や本数の違いもあるので、レポートでは必ず添える。

## 手順

### 1. 似た戦略のチャンネルを集める

```bash
python bench/find_channels.py      # 検索語は research/benchmark/compare/queries.txt。30分〜1時間
```

→ `research/benchmark/compare/channels.tsv`（登録者、最新12本の再生数の中央値・最大値、仮の群）

### 2. 比べるチャンネルを選ぶ（Claude が案を作り、オーナーが確認）

`channels.tsv` から、**伸びた 5〜8、伸びていない 5〜8** を選び、`research/benchmark/compare/groups.tsv` に書く。

```
channel	group	type	memo
lovebynumbers	伸びた	恋愛×統計	ベンチマーク
UCxxxxxxxx	伸びていない	恋愛×統計	2025年開始、40本
```

- `channel` は `$YT_DATA_DIR/bench/` のフォルダ名（ハンドルの@なし、またはチャンネルID）。
- 選ぶ条件：データ・統計・学問で身近な疑問を解く型、顔出しなし、合成音声または声のみ、通常動画が中心。
- 外す：ジャンルが違う、顔出しや有名人、テレビ局・企業、本数が8本未満（まだ判断できない）。
- できれば同じ題材（恋愛、格差など）で「伸びた・伸びていない」が対になるように選ぶ。
- ベンチマークの4チャンネル（日本社会構造研究所を含む）は「伸びた」に入れる。

### 3. 取得と材料づくり

```bash
BENCH_MAX=6 bench/bench.sh @handle            # groups.tsv の各チャンネル（ベンチマーク取得済みのものは不要）
BENCH_MAX=6 bench/bench.sh channel/UCxxxxxxxx # ハンドルが無いとき
python bench/prep.py <channel>
```

### 4. 1本ずつの判定（サブエージェント）

各チャンネルの新しい順6本について、`bench-analyst` を1本ずつ呼ぶ（同時に3〜5本）。
既に JSON がある動画は飛ばす。2026-10-03 以前の JSON には `originality` などの項目がないので、比較に入る動画は作り直す。

### 5. 声

```bash
python bench/voice.py fetch <channel> --max 6   # 各チャンネル。30〜90秒目の音声だけ取る
python bench/voice.py measure                   # → research/benchmark/compare/voice.tsv
python bench/voice.py listen                    # 聞き比べ用クリップ（20秒）と採点表を作る
```

- 抑揚の幅（`pitch_range_st`）は numpy が要る。入っていなければ、オーナーの許可を取ってから `python -m pip install numpy`。無くても他の数字は測れる。
- **オーナーの作業（約15分）**：`$YT_DATA_DIR/bench/listening/clips/` のクリップを番号順に聞き、
  `research/benchmark/compare/listening.csv` に「自然さ」「聞き続けたいか」（1〜5）を付ける。
  採点が終わるまで `key.tsv`（答え）は開かない。

### 6. 差を出してレポートにする

```bash
python bench/compare.py --out research/benchmark/compare/differences.md
```

`differences.md` を読み、`research/benchmark/compare/report.md` を書く。

- 差の大きい項目トップ5〜10と、その読み方。差の大きさと「チャンネル数」を必ず添える。
- **自分たちで変えられる差**（構成、絵、声、タイトル）と、**変えられない差**（開始時期、本数、運）を分ける。
- 声の結論：どの種類の声が、どの数字（速さ・間・抑揚）で、聞き比べで何点だったか。自分たちの声の選び方への提案。
- 自分たちの「質の最低ライン」（`episodes/_template/README.md`）に足すべき項目の提案。
