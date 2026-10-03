#!/usr/bin/env bash
# ベンチマークの取得（個人の分析専用。取得物を制作物に流用しない）
#
# 使い方:  bench/bench.sh @lovebynumbers
#   並列数を変える:  BENCH_JOBS=1 bench/bench.sh @lovebynumbers
#
# 出力先: $YT_DATA_DIR/bench/<チャンネル名>/
#   list.tsv            動画一覧（ID・秒数・再生数・タイトル）
#   <ID>/<ID>.info.json メタデータ
#   <ID>/<ID>.jpg       サムネイル
#   <ID>/<ID>.ja*.vtt   自動字幕
#   <ID>/sheet_001.jpg… 場面転換ごとのキャプチャを 3x3 にまとめたタイル（左上→右下の順）
#   <ID>/times.tsv      タイル番号・コマ番号・秒数の対応表
#   ※ 1コマずつの画像はタイル作成後に消す（ファイル数を約1/10にするため）
#   failed.tsv          失敗した動画（再実行すると未完了分だけやり直す）
set -uo pipefail

CH="${1:?チャンネルのハンドルを指定してください（例: @lovebynumbers）}"
source "$(dirname "$0")/../scripts/paths.sh"

for cmd in yt-dlp ffmpeg; do
  command -v "$cmd" >/dev/null || { echo "$cmd が見つかりません。インストールが必要です。" >&2; exit 1; }
done

export OUT="$YT_DATA_DIR/bench/${CH#@}"
mkdir -p "$OUT"
URL="https://www.youtube.com/$CH/videos"

# 1. 動画一覧
echo "[1/3] 動画一覧を取得: $CH"
yt-dlp --flat-playlist --encoding utf-8 --print "%(id)s	%(duration)s	%(view_count)s	%(title)s" "$URL" > "$OUT/list.tsv"
echo "  $(wc -l < "$OUT/list.tsv" | tr -d ' ') 本"

# 2. サムネイル・自動字幕・メタデータ（動画本体は落とさない）
echo "[2/3] サムネイル・字幕・メタデータを取得"
yt-dlp --skip-download --ignore-errors --no-write-playlist-metafiles \
  --write-thumbnail --convert-thumbnails jpg \
  --write-auto-subs --sub-langs "ja,ja-orig" \
  --write-info-json \
  --sleep-requests 1 --sleep-subtitles 2 \
  -o "$OUT/%(id)s/%(id)s.%(ext)s" "$URL"

# 3. 場面転換ごとのキャプチャ ＋ 3x3 タイル
cap() {
  local id="$1" d="$OUT/$1" v
  mkdir -p "$d"
  if [ -f "$d/times.tsv" ]; then return 0; fi  # 取得済みはスキップ（times.tsv は最後に作る）

  rm -f "$d"/v.* "$d"/f_*.jpg "$d"/sheet_*.jpg "$d/times.tsv"
  # HTTP 403 で落とせない動画があるので、失敗したら android クライアントで1回だけやり直す
  yt-dlp -q --no-warnings --sleep-requests 1 --sleep-interval 3 --max-sleep-interval 8 \
      -f "bv*[height<=360][vcodec^=avc1]/bv*[height<=360]/b[height<=360]" -o "$d/v.%(ext)s" \
      "https://www.youtube.com/watch?v=$id" ||
  yt-dlp -q --no-warnings --sleep-requests 1 --extractor-args "youtube:player_client=android,web" \
      -f "bv*[height<=360]/b[height<=360]/b" -o "$d/v.%(ext)s" \
      "https://www.youtube.com/watch?v=$id" || {
    printf '%s\tdownload\n' "$id" >> "$OUT/failed.tsv"; return 0; }
  v=$(ls "$d"/v.* 2>/dev/null | head -n 1)

  # 1秒ごとに1コマ取り出して場面転換を検出（キーフレーム方式は AV1 で効かず、検出も粗すぎた）
  # -strict unofficial は ffmpeg 9 で JPEG を書くのに必要
  ffmpeg -nostdin -loglevel info -i "$v" \
    -vf "fps=1,select='gt(scene,0.3)',scale=480:-1,showinfo" -fps_mode vfr -strict unofficial \
    "$d/f_%04d.jpg" 2> "$d/ffmpeg.log"
  # 転換が少ない（タイル2枚未満）動画は、30秒ごとの均等サンプリングに切り替える（画面の様子を読めるようにするため）
  if [ "$(ls "$d"/f_*.jpg 2>/dev/null | wc -l)" -lt 18 ]; then
    rm -f "$d"/f_*.jpg
    ffmpeg -nostdin -loglevel info -i "$v" \
      -vf "fps=1/30,scale=480:-1,showinfo" -fps_mode vfr -strict unofficial \
      "$d/f_%04d.jpg" 2> "$d/ffmpeg.log"
  fi
  rm -f "$d"/v.*

  if [ ! -f "$d/f_0001.jpg" ]; then
    printf '%s\tno_scene\n' "$id" >> "$OUT/failed.tsv"; return 0
  fi
  ffmpeg -nostdin -loglevel error -i "$d/f_%04d.jpg" -vf "tile=3x3" -strict unofficial "$d/sheet_%03d.jpg" || {
    printf '%s\ttile\n' "$id" >> "$OUT/failed.tsv"; return 0; }
  { printf 'sheet\tframe\tsec\n'
    grep -o 'pts_time:[0-9.]*' "$d/ffmpeg.log" | cut -d: -f2 |
      awk '{ printf "%d\t%d\t%s\n", int((NR-1)/9)+1, NR, $1 }'
  } > "$d/times.tsv.tmp" && mv "$d/times.tsv.tmp" "$d/times.tsv"
  rm -f "$d"/f_*.jpg "$d/ffmpeg.log"
  echo "  済: $id"
}
export -f cap

echo "[3/3] キャプチャとタイルを作成（並列 ${BENCH_JOBS:-2}）"
rm -f "$OUT/failed.tsv"
cut -f1 "$OUT/list.tsv" | xargs -n 1 -P "${BENCH_JOBS:-2}" bash -c 'cap "$1"' _

if [ -s "$OUT/failed.tsv" ]; then
  echo "失敗: $(wc -l < "$OUT/failed.tsv" | tr -d ' ') 本（$OUT/failed.tsv）。もう一度実行すると未完了分だけやり直します。"
fi
echo "完了: $OUT"
