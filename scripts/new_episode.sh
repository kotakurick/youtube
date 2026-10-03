#!/usr/bin/env bash
# 新しい回のフォルダを作る。
# 使い方:  scripts/new_episode.sh <英小文字の短い名前>
#   例:   scripts/new_episode.sh where-couples-meet   → episodes/001-where-couples-meet/
set -euo pipefail

SLUG="${1:?短い名前を指定してください（例: where-couples-meet）}"
case "$SLUG" in
  *[!a-z0-9-]*) echo "名前は英小文字・数字・ハイフンだけにしてください: $SLUG" >&2; exit 1 ;;
esac
source "$(dirname "$0")/paths.sh"

cd "$YT_REPO_DIR/episodes"
last=$(ls -d [0-9][0-9][0-9]-* 2>/dev/null | sort | tail -n 1 | cut -c1-3 || true)
num=$(printf '%03d' $((10#${last:-000} + 1)))
EP="$num-$SLUG"

cp -R _template "$EP"
sed -i.bak "s/{{EPISODE}}/$EP/g" "$EP/README.md" && rm "$EP/README.md.bak"
mkdir -p "$YT_DATA_DIR/episodes/$EP/audio" "$YT_DATA_DIR/episodes/$EP/render"

echo "作成しました: episodes/$EP/"
echo "大きいファイルの保存先: $YT_DATA_DIR/episodes/$EP/"
