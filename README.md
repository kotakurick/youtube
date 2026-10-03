# データ×疑問

身近な疑問を公的統計と査読付き研究で解き明かす、日本向けYouTubeチャンネルの制作リポジトリ。

- 概要と決定事項：[`docs/PROJECT_BRIEF.md`](docs/PROJECT_BRIEF.md)
- 決定ログと未決定事項：[`docs/decisions.md`](docs/decisions.md)
- 作業ルールとフォルダ構成：[`CLAUDE.md`](CLAUDE.md)
- テーマ候補：[`themes/themes.csv`](themes/themes.csv)

## 準備

大きいファイルの保存先を環境変数で指定する（未設定ならリポジトリ内の `_local/`。Gitには入らない）。

```bash
# 例：~/.zshrc に追記
export YT_DATA_DIR="$HOME/（同期フォルダ）/youtube-data"
```
