#!/usr/bin/env bash
# チャンネル内のサムネイルを再生数の多い順に 3x3 のタイルにまとめる（AIに見せる画像を約1/9にするため）
# 使い方:  bench/thumbs.sh @lovebynumbers
# 出力:    $YT_DATA_DIR/bench/<チャンネル>/thumbs/thumbs_001.jpg… と thumbs.tsv（タイル番号・位置・ID・再生数・タイトル）
set -euo pipefail

CH="${1:?チャンネルのハンドルを指定してください（例: @lovebynumbers）}"
source "$(dirname "$0")/../scripts/paths.sh"
OUT="$YT_DATA_DIR/bench/${CH#@}"
[ -f "$OUT/list.tsv" ] || { echo "$OUT/list.tsv がありません。先に bench/bench.sh を実行してください。" >&2; exit 1; }

T="$OUT/thumbs"; rm -rf "$T"; mkdir -p "$T/tmp"
printf 'sheet\tpos\tid\tviews\ttitle\n' > "$T/thumbs.tsv"
n=0
# list.tsv: ID・秒数・再生数・タイトル → 再生数の多い順
while IFS=$'\t' read -r id dur views title; do
  title="${title%$'\r'}"  # Windows の改行（CRLF）対策
  [ -f "$OUT/$id/$id.jpg" ] || continue
  n=$((n + 1))
  cp "$OUT/$id/$id.jpg" "$T/tmp/t_$(printf '%04d' "$n").jpg"
  printf '%d\t%d\t%s\t%s\t%s\n' $(( (n - 1) / 9 + 1 )) $(( (n - 1) % 9 + 1 )) "$id" "$views" "$title" >> "$T/thumbs.tsv"
done < <(sort -t$'\t' -k3,3nr "$OUT/list.tsv")

[ "$n" -gt 0 ] || { echo "サムネイルが見つかりません" >&2; exit 1; }
ffmpeg -nostdin -loglevel error -i "$T/tmp/t_%04d.jpg" \
  -vf "scale=480:270:force_original_aspect_ratio=decrease,pad=480:270:(ow-iw)/2:(oh-ih)/2,tile=3x3" \
  "$T/thumbs_%03d.jpg"
rm -rf "$T/tmp"
echo "$n 枚を $(ls "$T"/thumbs_*.jpg | wc -l | tr -d ' ') 枚のタイルにまとめました: $T"
