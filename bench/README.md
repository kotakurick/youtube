# ベンチマーク

3チャンネルの全動画の構成を分析して、伸びるテーマ・タイトル・構成のパターンを探す。
**取得物は個人の分析専用。制作物に流用しない。** 保存先は `$YT_DATA_DIR/bench/`（Gitの外）。

## 必要なもの

`yt-dlp`、`ffmpeg`（5.1以上）、Python 3.10以上。スクリプトは Git Bash で実行する（Claude Code が使うのと同じ）。

Windows では PowerShell で次を実行する（インストール後はターミナルを開き直す）。

```powershell
winget install yt-dlp.yt-dlp
winget install Gyan.FFmpeg
winget install Python.Python.3.12
```

yt-dlp は YouTube 側の変更ですぐ動かなくなるので、実行前に `winget upgrade yt-dlp.yt-dlp` で最新にする。

## 手順

```bash
bench/bench.sh @lovebynumbers
bench/bench.sh @kangaesugiruashi
bench/bench.sh @DataStickFigure
python bench/analyze.py --out research/benchmark/summary.md
bench/thumbs.sh @lovebynumbers   # サムネイルを3x3にまとめる（3チャンネル分）
```

- 途中で止まっても、もう一度実行すれば取得済みの動画は飛ばす。失敗した動画は `failed.tsv` に残る。
- 並列数は既定2。アクセス制限（HTTP 429 など）が出たら `BENCH_JOBS=1` にして時間をおく。
- 場面転換はキーフレームだけで検出する（速さのため）。秒数は数秒ずれることがあり、数秒以内に続く転換は1回に数えられる。
- キャプチャは3×3のタイル（`sheet_*.jpg`）だけを残し、1コマずつの画像は消す。どのコマが何秒目かは `times.tsv` を見る。
- 容量の目安は1本あたり数MB、3チャンネル全体で数百MB・数千ファイル。取得物は分析専用で取り直せるので、同期フォルダではなくパソコン内（既定の `_local/`）に置いてよい。

## 集計の中身（analyze.py）

チャンネルごとの本数・期間、再生数の中央値と最大、長さ、投稿間隔、場面転換の間隔、字幕の文字数（字/分）、長さと再生数の順位相関、再生数の上位10本。
動画ごとの表は `$YT_DATA_DIR/bench/videos.csv`。

字幕とタイルを読む分析の手順は [`research/benchmark/ANALYSIS_PLAN.md`](../research/benchmark/ANALYSIS_PLAN.md)。
