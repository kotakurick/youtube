# 共通の保存先設定。各スクリプトから `source` して使う（Windows では Git Bash で実行）。
#
# 大きいファイル（ベンチマーク取得物・音声・完成動画）は Git の外に置く。
# 保存先は環境変数 YT_DATA_DIR で指定する（例：Googleドライブの同期フォルダ）。
# Windows では「ユーザー環境変数」に設定すると Git Bash と Python の両方から見える。
#   setx YT_DATA_DIR "G:\マイドライブ\youtube-data"
# 未設定ならリポジトリ内の _local/（.gitignore で除外済み）を使う。

YT_REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
YT_DATA_DIR="${YT_DATA_DIR:-$YT_REPO_DIR/_local}"
# Git Bash では G:\... 形式を /g/... 形式に直す（\ のままだとパス展開が崩れるため）
if command -v cygpath >/dev/null 2>&1; then
  YT_DATA_DIR="$(cygpath -u "$YT_DATA_DIR")"
fi
export YT_REPO_DIR YT_DATA_DIR
