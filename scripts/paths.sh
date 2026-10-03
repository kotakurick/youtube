# 共通の保存先設定。各スクリプトから `source` して使う。
#
# 大きいファイル（ベンチマーク取得物・音声・完成動画）は Git の外に置く。
# 保存先は環境変数 YT_DATA_DIR で指定する（例：Googleドライブの同期フォルダ）。
#   export YT_DATA_DIR="$HOME/Library/CloudStorage/GoogleDrive-xxx/マイドライブ/youtube-data"
# 未設定ならリポジトリ内の _local/（.gitignore で除外済み）を使う。

YT_REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
YT_DATA_DIR="${YT_DATA_DIR:-$YT_REPO_DIR/_local}"
export YT_REPO_DIR YT_DATA_DIR
