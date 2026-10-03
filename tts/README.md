# 音声合成（TTS）

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
   - Fish Audio：アカウントを作り、API キーを発行。「licensed」の声から日本語の声を男女1つずつ選び、ID を控える。
   - ElevenLabs：アカウントを作り、API キーを発行。Voice Library から日本語の声を男女1つずつ選び、voice_id を控える。
   - Google Cloud：プロジェクトを作って Text-to-Speech API を有効にし、API キーを発行（請求先の登録が必要。無料枠の範囲なら0円）。
   - AivisSpeech / VOICEVOX：インストールして起動しておく。
   - API キーは Windows のユーザー環境変数に入れる（チャットには貼らない）。
     ```powershell
     setx FISH_API_KEY "..."
     setx ELEVENLABS_API_KEY "..."
     setx GOOGLE_TTS_API_KEY "..."
     ```
2. **Claude**：控えた声の ID を `engines.json` の `voice` に入れ、`python tts/tts.py trial` を実行する。
   同じ原稿（`samples/sample01.txt`、数字と読み間違えやすい語を多めに入れた約50秒）で全候補の音声を作り、料金を `research/benchmark/compare/tts_trial.tsv` に出す。
   試すときは `yomi.tsv` の読み替えを使わず、素の読みの強さを見る。
3. **Claude**：`python bench/voice.py measure` と `python bench/voice.py listen` で、競合の声と一緒に、名前を伏せたクリップを作る。
4. **オーナー**：クリップを聞いて `listening.csv` を採点する（自然さ、聞き続けたいか、不気味さ、読み間違い）。
5. **Claude**：採点と料金をまとめて、どの声にするかの案を出す。決めるのはオーナー。

## 本番での使い方（声が決まった後）

```bash
python tts/tts.py say --voice google-1 --in 原稿.txt --out 音声.wav
```

- 送る前に `yomi.tsv` の「表記 → 読み」を置き換える。読み間違いを見つけたら、ここに1行足せば次から直る。
- 長い原稿は文の切れ目で分けて送り、つなぎ直す。
- 作った音声は `$YT_DATA_DIR` に置く（Gitに入れない）。作り直すと料金がかかるので消さない。

## 注意

- 実在の人の声をまねた声（声のクローン）は使わない。Fish Audio・ElevenLabs のユーザー投稿の声は、利用条件と元の声の権利を確認してから使う。
- 人間に近い声ほど「AIの人物が助言している」と見られやすい。お金・健康の回は助言しない方針を特に守る。
