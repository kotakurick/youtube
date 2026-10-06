# 音声合成（TTS）

**本番の声は `eleven-yui`（ElevenLabs「Yui」・eleven_v4_turbo。2026-10-04 決定、経緯は `docs/decisions.md`）。**
台本に〔間〕〔thoughtful〕などの指示を書ける（`docs/script-style.md` の7章）。

### ElevenLabs で分かったこと（2026-10-04）

- v4／v4 Turbo で効く設定は安定度（stability）と似せる強さ（similarity_boost）だけ。style・speed は効かない（公式）。速さと語り方はタグ（`[calm storytelling, brisk pace]`）で指示する。タグは効かせたい言葉の前に置き、次のタグまで続く。
- Voice Library の声は無料プランでは API で使えない（Starter 以上）。
- 声を試すときは、声の作者が保存した設定と、どのモデルで学習された声か（`high_quality_base_model_ids`）を先に API で確かめる。ただし学習されていないモデルでも良いことがある（Yui は v4 向けに学習されていないが v4 Turbo が一番良かった）。結局は聞いて決める。
- seed を固定すると長さ・間はほぼ同じになる（ファイルは完全には一致しない）。
- 画面（API の試し場）とスクリプトで質が違うときは、声 ID・モデル・設定・原稿の4つを突き合わせる。

台本から読み上げ音声を作る。声（エンジン）は `engines.json` の設定で切り替える。Claude がスクリプトから自動で呼ぶ前提で、人の手作業は要らない。

## いまの段階：候補の聞き比べ（2026-10-04〜）

課金する前提で、**質と料金のバランス**で声を決める。候補は次のとおり（料金は `engines.json`、1本7,000字で試算）。

| 候補 | 1本あたり | 月10本 | 動き方 |
|---|---:|---:|---|
| Fish Audio（s2.1-pro） | 約45円 | 約2,100円（うちプラン月11ドル） | クラウドAPI |
| ElevenLabs（eleven_v3） | 約85円 | 約850円 | クラウドAPI |
| Google Chirp 3: HD | 約30円 | **0円**（毎月100万字まで無料） | クラウドAPI |
| AivisSpeech | 0円 | 0円 | パソコン内のアプリ |
| VOICEVOX | 0円 | 0円（クレジット表記が必要） | パソコン内のアプリ |

### 手順

1. **オーナーの準備**（使う候補だけでよい）
   - Fish Audio：API キーを発行し、**API クレジットをチャージする**（アプリのプランとは別会計。残高0だと 402 エラー）。https://fish.audio/app/developers
   - ElevenLabs：API キーを発行し、**有料プランにする**（無料プランは Voice Library の声を API で使えない。収益化する動画での利用も有料プランから）。
   - Google Cloud：プロジェクトで **Text-to-Speech API を有効にする**（キーだけでは 403 エラー）。請求先の登録が必要。無料枠の範囲なら0円。
   - 声は Claude が API の一覧から選ぶ（2026-10-04 選定済み：Fish Audio は licensed のナレーション向け2つ、ElevenLabs は日本語ネイティブの解説・ナレーション向け2つ。`engines.json` の memo）。
   - AivisSpeech / VOICEVOX：インストールして起動しておく。
   - API キーは Windows のユーザー環境変数に入れる（チャットには貼らない）。
     ```powershell
     setx FISH_API_KEY "..."
     setx ELEVENLABS_API_KEY "..."
     setx GOOGLE_TTS_API_KEY "..."
     ```
2. **Claude**：`python tts/tts.py trial` を実行する。
   同じ原稿（`samples/sample01.txt`、数字と読み間違えやすい語を多めに入れた約50秒）で全候補の音声を作り、料金を `research/benchmark/compare/tts_trial.tsv` に出す。
   試すときは `yomi.tsv` の読み替えを使わず、素の読みの強さを見る。
3. **Claude**：`python bench/voice.py measure` と `python bench/voice.py listen` で、競合の声と一緒に、名前を伏せたクリップを作る。
   2026-10-04：AivisSpeech の2つ（まお・コハク、速さは1分395字に合わせた）で作成済み。クラウドの候補は、APIキーが入ったら `python tts/tts.py trial --only fish-1,fish-2,eleven-1,eleven-2,google-1,google-2` のあと `python bench/voice.py listen --add` で足す（採点済みの行は消えない）。
   ローカルの声は `engines.json` の `speed`（速さの倍率）で、ルールの1分390〜400字に合わせる。
4. **オーナー**：クリップを聞いて `listening.csv` を採点する（自然さ、聞き続けたいか、不気味さ、読み間違い）。
5. **Claude**：採点と料金をまとめて、どの声にするかの案を出す。決めるのはオーナー。

## 台本から動画へ（tts/narrate.py）

```bash
python tts/narrate.py episodes/001-xxx --voice silent    # 仮の無音で尺と字幕だけ決める（声が決まる前の仮通し）
python tts/narrate.py episodes/001-xxx --voice aivis-1   # 本番の声で作る
python tts/readaloud.py episodes/001-xxx                  # 無料の読み上げページ（スマホの声。文に「いらない」の印を付けられる）
python tts/preview.py episodes/001-xxx                    # 作った音声を、スマホで聞く mp3（通し・章ごと）と1文ずつの早見表にまとめる → _local/episodes/<回>/preview/
```

- 台本の「## 見出し」が場面。細かく分けるときは `<!-- 場面: ch1-crowd -->`、声のない場面は `<!-- 場面: ch2-card 2.8秒 -->`。
- 文ごとに音声を作ってつなぐ。同じ声・同じ文は作り直さない（`$YT_DATA_DIR/episodes/<回>/tts_cache/`）ので、台本を1文直しても払い直すのはその1文だけ。
- 字幕は1行（横長24字・縦長16字）。長い文は読点や助詞のあとで自動で区切る。「」の中では切らない。
- 書き出すもの：場面ごとの音声（`$YT_DATA_DIR/episodes/<回>/audio/`）、`episodes/<回>/timing.json`（render が読む）、`episodes/<回>/subtitles.srt`（YouTube に上げる字幕）。
- ショートは `short.md` を書いて `--vertical`（`timing-short.json`）。

## 1つの文だけ作るとき

```bash
python tts/tts.py say --voice google-1 --in 原稿.txt --out 音声.wav
```

- 送る前に `yomi.tsv` の「表記 → 読み」を置き換える。読み間違いを見つけたら、ここに1行足せば次から直る。
- 小数は送る前にひらがなに直す（28.3 → にじゅうはってんさん）。台本の決まりでは小数を読み上げないが、残っていても正しく読む。
- 読みは合っていてもイントネーションがおかしい語（複合語に多い。例：婚活市場、50歳時未婚率）は、ひらがな・カタカナ・区切りを入れた形・言い換えの数通りを短い文で作り、オーナーが聞いて選ぶ。選んだ形を `yomi.tsv` に登録する。ひらがなとカタカナでもイントネーションが変わる。
- 長い原稿は文の切れ目で分けて送り、つなぎ直す。
- 作った音声は `$YT_DATA_DIR` に置く（Gitに入れない）。作り直すと料金がかかるので消さない。

## 注意

- 実在の人の声をまねた声（声のクローン）は使わない。Fish Audio・ElevenLabs のユーザー投稿の声は、利用条件と元の声の権利を確認してから使う。
- 人間に近い声ほど「AIの人物が助言している」と見られやすい。お金・健康の回は助言しない方針を特に守る。
