# データ×疑問

身近な疑問を公的統計と査読付き研究で解き明かす、日本向けYouTubeチャンネルの制作リポジトリ。

- 概要と決定事項：[`docs/PROJECT_BRIEF.md`](docs/PROJECT_BRIEF.md)
- 決定ログと未決定事項：[`docs/decisions.md`](docs/decisions.md)
- 作業ルールとフォルダ構成：[`CLAUDE.md`](CLAUDE.md)
- テーマ候補：[`themes/themes.csv`](themes/themes.csv)

## 準備

大きいファイルの保存先を環境変数で指定する（未設定ならリポジトリ内の `_local/`。Gitには入らない）。

```powershell
# Windows（PowerShell で1回だけ実行。ターミナルを開き直すと有効になる）
setx YT_DATA_DIR "G:\マイドライブ\youtube-data"
```

スクリプトは Git Bash で動く（Windows 版 Claude Code が使うシェルと同じ）。
