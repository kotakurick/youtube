# ベンチマーク

3チャンネルの全動画の構成を分析して、伸びるテーマ・タイトル・構成のパターンを探す。
**取得物は個人の分析専用。制作物に流用しない。** 保存先は `$YT_DATA_DIR/bench/`（Gitの外）。

## 必要なもの

`yt-dlp`、`ffmpeg`（5.1以上）、`python3`。Mac なら `brew install yt-dlp ffmpeg`。
yt-dlp は YouTube 側の変更ですぐ動かなくなるので、実行前に `brew upgrade yt-dlp` で最新にする。

## 手順

```bash
bench/bench.sh @lovebynumbers
bench/bench.sh @kangaesugiruashi
bench/bench.sh @DataStickFigure
python3 bench/analyze.py --out research/benchmark/summary.md
```

- 途中で止まっても、もう一度実行すれば取得済みの動画は飛ばす。失敗した動画は `failed.tsv` に残る。
- 並列数は既定2。アクセス制限（HTTP 429 など）が出たら `BENCH_JOBS=1` にして時間をおく。
- 場面転換はキーフレームだけで検出するので、`times.log` の秒数は1秒前後ずれることがある。

## 集計の中身（analyze.py）

チャンネルごとの本数・期間、再生数の中央値と最大、長さ、投稿間隔、場面転換の間隔、字幕の文字数（字/分）、長さと再生数の順位相関、再生数の上位10本。
動画ごとの表は `$YT_DATA_DIR/bench/videos.csv`。
