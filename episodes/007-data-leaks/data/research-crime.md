# 第3章の資料：犯罪者から見た損得と、ハッカー像の答え合わせ

調べた日：2026-10-06（クラウドのセッション）。値はすべて原文（PDF・Excel・論文・公式ブログ）を開いて確かめた。開けなかったものは「未確認」または「二次」と書く。
攻撃の手口・道具の説明は集めていない。統計と研究の結論だけ。

推移の CSV（同じフォルダ、BOM 付き UTF-8）：

| ファイル | 中身 |
|---|---|
| `npa_ransomware_by_year.csv` | ランサムウェア被害の報告件数（2020下半期〜2025） |
| `npa_ransomware_by_half.csv` | 同・半期ごと（2020下〜2026上） |
| `npa_ransomware_2025_profile.csv` | 2025年の規模別・復旧期間・費用・業務への影響・バックアップ |
| `npa_cybercrime_arrests_by_year.csv` | サイバー犯罪の検挙件数（2016〜2025） |
| `npa_unauthorized_access_by_year.csv` | 不正アクセスの認知件数・検挙件数・検挙人員の年齢（2016〜2025） |
| `ransom_payments_by_year.csv` | 身代金の支払い総額（Chainalysis）と支払い率（Coveware）2019〜2025 |
| `coveware_quarterly.csv` | Coveware の四半期の支払い率・平均・中央値 |

略号：
- **NPA-R7** ＝ 警察庁「令和7年におけるサイバー空間をめぐる脅威の情勢等について」（2026年3月公表）。本文 PDF https://www.npa.go.jp/publications/statistics/cybersecurity/data/R7/R07_cyber_jousei.pdf ／図表データ Excel https://www.npa.go.jp/publications/statistics/cybersecurity/data/R7/R07_jousei_data.xlsx 。ページは冊子に印刷された番号（PDF のページ番号は＋9）。
- **不正アクセス-R7** ＝ 国家公安委員会・総務大臣・経済産業大臣「不正アクセス行為の発生状況及びアクセス制御機能に関する技術の研究開発の状況」（2026年3月12日）。https://www.soumu.go.jp/main_content/001059979.pdf

---

## 1. 警察庁の統計（日本）

### 1-1 ランサムウェア被害の報告件数（推移）

| 年 | 件数 | 備考 |
|---|---|---|
| 2020 | 21 | **下半期だけ**（統計は令和2年下半期から。通年の値はない） |
| 2021 | 146 | |
| 2022 | 230 | |
| 2023 | 197 | ほかにノーウェアランサム 30 |
| 2024 | 222 | ほかにノーウェアランサム 22 |
| 2025 | **226** | ほかにノーウェアランサム 17 |
| 2026上半期 | 123 | 半期で過去最多 |

- 単位：件（警察への被害報告の数。実際の被害の数ではない）
- 資料：NPA-R7、本文13頁（2025年）・統計編120頁（推移）。一次。
- 引用：「令和７年におけるランサムウェアの被害報告件数は 226 件であり、依然として高水準で推移」（本文13頁）
- 2026上半期：警察庁「令和8年上半期における…情勢等について」本文9頁。https://www.npa.go.jp/publications/statistics/cybersecurity/data/R8kami/R08_kami_cyber_jousei.pdf 引用「半期の件数としては、統計を取り始めた令和２年下半期以降、最多」。一次。
- 「226件」は**確認済み**。

### 1-2 組織の規模別（2025年）

| 規模 | 件数 | 割合 |
|---|---|---|
| 大企業 | 64 | 28% |
| 中小企業 | 143 | **63%** |
| 団体等 | 19 | 8% |
| 計 | 226 | |

- 資料：NPA-R7、本文14頁 図表7・統計編122頁。一次。
- 引用：「組織の規模別で見ると、前年と同様に中小企業が約６割を占めている」（本文14頁）

### 1-3 復旧にかかった期間・費用（2025年、被害組織へのアンケート）

期間（回答107）：即時〜1週間未満 29／1週間〜1か月未満 31／1か月〜2か月未満 15／2か月以上 7／復旧中 25。
→ 1か月未満で戻ったのは 60/107＝**56%**。

調査・復旧費用の総額（回答89）：100万円未満 16／100万〜500万 18／500万〜1,000万 9／1,000万〜5,000万 32／5,000万〜1億 9／1億円以上 5。
→ 1,000万円以上は 46/89＝**52%**。

業務への影響（回答117）：全業務停止 9／一部の業務に影響 97／影響なし 11。
バックアップからの復元（回答99）：復元できた 20／**できなかった 79**（理由の最多は「バックアップも暗号化」48）。

- 資料：NPA-R7、本文14頁（図表9は15頁）、統計編125・126・129・130・131頁。一次。
- 引用：「復旧に総額 1,000 万円以上を要した組織の割合は全体の５割を超えている」（本文14頁）
- 注意：回答した組織だけの集計（226件のうち約半分）。

### 1-4 サイバー犯罪の検挙件数（推移）

| 年 | 2016 | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|---|---|---|---|---|---|
| 検挙件数 | 8,324 | 9,014 | 9,040 | 9,519 | 9,875 | 12,209 | 12,369 | 12,479 | 13,164 | **15,108** |

- 単位：件。資料：NPA-R7、本文45頁 図表38・統計編145頁。一次。
- 引用：「令和７年におけるサイバー犯罪の検挙件数は1万5,108件に達し過去最高」（概要5頁）／本文45頁「1万5,108件に達している」
- 「15,108件・過去最多」は**確認済み**（原文の言葉は「過去最高」）。
- 内訳（2025）：不正アクセス禁止法違反 431／コンピュータ・電磁的記録対象犯罪 1,253／その他 13,424（その他の最多は詐欺 3,406、次に犯罪収益移転防止法 2,868）。→ 検挙の**約9割は「ネットを使った普通の犯罪」**で、いわゆるハッキング（不正アクセス）は 3%。
- 2026上半期：7,607件（前年同期比15%増）。令和8年上半期版 本文37頁。一次。

### 1-5 不正アクセス：認知件数と検挙

| 年 | 認知件数 | 検挙件数 | 検挙人員 |
|---|---|---|---|
| 2021 | 1,516 | 429 | 235 |
| 2022 | 2,200 | 522 | 257 |
| 2023 | 6,312 | 521 | 259 |
| 2024 | 5,358 | 563 | 259 |
| 2025 | **7,190** | **431** | **248** |

- 資料：不正アクセス-R7、1頁（認知）・3頁（検挙）。一次。2020年以前の認知件数は今回は集めていない（未確認）。
- 引用：「令和７年における不正アクセス行為の認知件数は 7,190 件であり、前年…と比べ、1,832 件（約 34.2％）増加」（1頁）
- 引用：「検挙件数・検挙人員は 431 件・248 人であり、前年…と比べ、132 件減少」（3頁）
- 認知の内訳（2025）：ネットバンキングでの不正送金等 4,747／証券口座での不正取引等 1,484／ネット通販での不正購入 228。
- 参考の計算（Claude）：検挙件数÷認知件数＝431/7,190≒**6%**。ただし同じ年の認知と検挙は同じ事件とは限らず、認知されない被害もあるので「捕まる確率」そのものではない。画面に出すなら「目安」と書く。

### 1-6 不正アクセスで検挙された人の年齢（2025年、248人）

| 年齢 | 人数 | 割合 |
|---|---|---|
| 14〜19歳 | 81 | **32.7%** |
| 20〜29歳 | 91 | **36.7%** |
| 30〜39歳 | 41 | 16.5% |
| 40〜49歳 | 23 | 9.3% |
| 50〜59歳 | 10 | 4.0% |
| 60歳以上 | 2 | 0.8% |

- 資料：不正アクセス-R7、5頁 図3-1・表3-1。NPA-R7 統計編150・153頁にも同じ値。一次。
- 引用：「「20～29 歳」が最も多く（91 人）、次いで「14～19 歳」（81 人）」（5頁）
- 引用：「最年少の者は 10 歳…最年長の者は 65 歳」（5頁。10歳は14歳未満のため検挙人員には入っていない。ほかに14歳未満の補導7人）
- 「10代約3割・20代約4割」の確認：10代 32.7% は「約3割」で正しい。**20代 36.7% は「約4割」と言うには少し多め**。読み上げは「10代と20代で約7割」（69.4%）か「3人に1人ずつ」が正確。
- 10代81人の内訳：高校生42・中学生16・無職9・大学生5ほか（NPA-R7 統計編154頁）。
- 10年の推移（CSV）：10代の割合は 2016年 31%、2025年 33% で、ずっと3割前後。
- 検挙された手口の上位（2025、識別符号窃用型399件）：「パスワードの設定・管理の甘さにつけ込んで入手」84／「フィッシングサイトから入手」77／「他人から入手」75／「知り得る立場（元従業員・知人等）」61（6頁）。高度な技術を使う型（セキュリティ・ホール攻撃型）は 8件（2%）。※手口の中身は扱わず、分類の件数だけ。

### 1-7 RaaS（分業）についての警察庁の記述

- 引用：「身代金の一部を受け取る RaaS…高度な技術的専門知識を有していない者であっても、ランサムウェア攻撃の実行が可能になる」（NPA-R7 本文15頁）。一次。取り分の割合は書かれていない。

---

## 2. 身代金の支払い

### 2-1 Chainalysis：ランサムウェアへの支払い総額（暗号資産、ブロックチェーン上で追えた分）

| 年 | 総額（百万ドル） | どの版の値か |
|---|---|---|
| 2020 | 692 | 2022年版（改訂値） |
| 2021 | 765.6 | 2023年版（改訂値。2022年版では602） |
| 2022 | 567 | 2024年版（改訂値。2023年版では456.8） |
| 2023 | 1,250 | 2025年版（過去最高） |
| 2024 | 892 | 2026年版（改訂値。2025年版では813.55） |
| 2025 | **820** | 2026年版（速報。900前後まで増える見込み） |

- 発行元：Chainalysis（民間のブロックチェーン分析会社）。各年の Crypto Crime Report のブログ。一次（会社の自社推計）。
- URL：2026年版 https://www.chainalysis.com/blog/crypto-ransomware-2026/ ／2025年版 https://www.chainalysis.com/blog/crypto-crime-ransomware-victim-extortion-2025/ ／2024年版 https://www.chainalysis.com/blog/ransomware-2024/ ／2023年版 https://www.chainalysis.com/blog/crypto-ransomware-revenue-down-as-victims-refuse-to-pay/ ／2022年版 https://www.chainalysis.com/blog/2022-crypto-crime-report-preview-ransomware/
- 引用（2026年版）：「Total on-chain ransomware payments fell by approximately 8% to $820 million in 2025」
- 引用（2025年版）：「a 35% decrease from 2023's record-setting year of $1.25 billion」
- 2025年の中央値：「The median payment increased 368%, from $12,738 in 2024 to $59,556 in 2025」（2026年版）
- 2025年の攻撃の数：リークサイトで主張された件数が前年比 **+50%**（過去最多）（2026年版）。→ 攻撃は増えたのに受け取り総額は減った。
- **注意**：後から上方修正されるのが常（2022年は 457→567、+24%）。グラフに出すときは「その時点の推計」と書き、版をそろえる。

### 2-2 支払い率（身代金を払った被害者の割合）

| 時点 | 支払い率 | 資料 | 一次／二次 |
|---|---|---|---|
| 2019年Q1 | 85% | Coveware Q4 2022報告 | 一次 |
| 2019年 | 76% | Coveware Q4 2022報告 | 一次 |
| 2020年 | 70% | Chainalysis 2023年版が引く Coveware の値 | **二次** |
| 2021年 | 50% | 同上 | **二次** |
| 2022年 | 41% | Coveware Q4 2022報告 | 一次 |
| 2023年Q4 | 29% | Coveware | 一次 |
| 2024年Q4 | 25% | Coveware | 一次 |
| 2025年Q2 | 26% | Coveware | 一次 |
| 2025年Q3 | 23% | Coveware | 一次 |
| 2025年Q4 | **20%** | Coveware | 一次 |

- 発行元：Coveware（米国の身代金交渉・事故対応会社。自社の顧客の事案だけの集計＝標本に偏りがある）。
- 引用（Q4 2025）：「Ransom payment rates have continued their long-term decline, reaching approximately 20%」 https://coveware.com/2026/02/why-zero-day-downstream-mass-data-extortion-campaigns-are-losing-their-bite/
- 引用（Q3 2025）：「fell to a historical low of 23% in Q3 2025」 https://coveware.com/2025/10/insider-threats-loom-while-ransom-payment-rates-plummet/
- 引用（2019/2022）：Q4 2022報告 https://coveware.com/2023/01/improved-security-and-backups-result-in-record-low-number-of-ransomware-payments/
- **「2025年は28%で過去最低」の確認**：28% は **Chainalysis** の推定（「The share of ransoms paid potentially reached an all-time low this year at 28%」2026年版）。**Coveware の値ではない**。Coveware の2025年は四半期ごとに 26%→23%→20%。どちらを使うか決めて出典を合わせる必要あり。
- 2026年Q2：Coveware は「new record low」とだけ書き、数字は出していない（未確認）。データ持ち出しだけの事案は 15%。

### 2-3 支払い額（Coveware、四半期）

| 四半期 | 平均（ドル） | 中央値（ドル） |
|---|---|---|
| 2020Q4 | 154,108 | 49,450 |
| 2021Q4 | 322,168 | 117,116 |
| 2022Q4 | 408,644 | 185,972 |
| 2023Q4 | 568,705 | 200,000 |
| 2024Q4 | 553,959 | 110,890 |
| 2025Q1 | 552,777 | 200,000 |
| 2025Q2 | 1,130,070 | 400,000 |
| 2025Q3 | 376,941 | 140,000 |
| 2025Q4 | 591,988 | 325,000 |
| 2026Q2 | 1,880,612 | 150,000 |

- 資料：各四半期報告（URL は `coveware_quarterly.csv`）。一次。四半期ごとの振れが大きく、少数の大型支払いで平均が動く。中央値で語るほうが安全。
- 被害組織の規模の中央値：2025Q3 362人、2025Q4 200人、2026Q2 約750人。

---

## 3. 犯罪の経済学

### 3-1 Becker (1968)

- Gary S. Becker, "Crime and Punishment: An Economic Approach", *Journal of Political Economy* 76(2), 169–217, 1968。確認は NBER の再録版（Becker & Landes 編 *Essays in the Economics of Crime and Punishment*, 1974, pp.1–54）https://www.nber.org/system/files/chapters/c3625/c3625.pdf 。一次。理論論文（標本なし）。
- 要点：人は「罪を犯したときに期待できる得」が「時間と資源をほかに使ったときの得」より大きいときに罪を犯す。犯罪の数は、**捕まって有罪になる確率 p** と **罰の重さ f** の両方が上がると減る。
- 引用：「a person commits an offense if the expected utility to him exceeds the utility he could get by using his time…at other activities」
- 引用：「Some persons become "criminals," therefore, not because their basic motivation differs…but because their benefits and costs differ」
- もう一つの要点：犯罪が「捕まる確率」と「罰の重さ」のどちらにより強く反応するかは、犯罪者が危険を好むかどうかで決まる（引用「more responsive to the former than the latter if, and only if, offenders on balance have risk preference」）。経験則として「確率の変化の方が罰の変化より効く」と言われてきた、とも書いている。

### 3-2 サイバー犯罪で捕まる確率の推定

- Third Way（米国のシンクタンク）Eoyang, Peters, Mehta, Gaskew「To Catch a Hacker」2018年10月29日。https://www.thirdway.org/report/to-catch-a-hacker-toward-a-comprehensive-strategy-to-identify-pursue-and-punish-malicious-cyber-actors
- 値：FBI の IC3 への2016年の届出 298,728件に対し、逮捕は連邦・州・地方合わせて1,000件未満 → **約0.3%**。届け出るのは被害者の6人に1人とすると **約0.05%**。比較：財産犯の検挙率 約18%、暴力犯 約46%（2016年、米国）。
- 引用：「the enforcement rate for reported incidents of the IC3 database is 0.3%」／「the effective enforcement rate estimate may be closer to 0.05%」
- 一次（ただし査読論文ではなく政策提言の報告書。推計が粗い）。
- 日本の目安は 1-5 の「認知に対する検挙 約6%」（Claude の計算、条件つき）。
- サイバー犯罪に Becker の枠組みを当てて**捕まる確率を推定した査読論文**は今回は見つけられなかった（未確認）。

---

## 4. 犯罪者像

### 4-1 Collier, Clayton, Hutchings, Thomas「Cybercrime is (often) boring」

- 誌名：*The British Journal of Criminology* 61(5), 1407–1423, 2021。DOI 10.1093/bjc/azab026。https://academic.oup.com/bjc/article/61/5/1407/6155016 （2020年の WEIS で先に発表）。一次。
- 標本：booter（DDoS 代行）サービスの管理者への聞き取り **11件** と、Cambridge Cybercrime Centre の CrimeBB（地下掲示板25か所・7,000万件超の投稿）とチャット。質的研究。
- 要点：ハッカーは「腕の立つ若者の刺激的な世界」と描かれがちだが、不正な市場は「産業化」し、仕事の多くは**サービスを動かし続ける地味な管理作業**（客の対応・サーバーの保守）になった。退屈さが燃え尽きと離脱を生む。取り締まりで基盤をつぶすと、その退屈さが増して離脱を早める可能性。
- 引用（要旨）：「the illicit economy associated with these practices has become industrialized」
- 引用（聞き取り）：「after doing for almost a year, I lost all motivation」

### 4-2 英国 NCA「Pathways Into Cyber Crime」（2017）

- 発行：National Crime Agency, National Cyber Crime Unit / Prevent Team、Intelligence Assessment、2017年1月13日。https://www.nationalcrimeagency.gov.uk/who-we-are/publications/6-pathways-into-cyber-crime-1/file 。一次。
- 標本：元加害者への聞き取り（debrief）**8件**＋警告訪問（cease & desist）の回答（設問により23件）＋文献。報告書自身が「少数の聞き取りに限られる」と書いている（2頁）。
- 年齢：NCCU の捜査対象・逮捕者の**平均年齢17歳**（2015年）。NCA の薬物事件は37歳、経済犯罪は39歳（4頁）。引用「The average age of suspects and arrests in NCCU investigations in 2015 was 17 years old」
- 始めた年齢：「61% of hackers begin hacking before age 16」（4頁。出典は別の調査の引用＝二次）
- 動機：お金は必ずしも一番ではない。課題をやり遂げること・達成感・仲間に認められることが主な動機（2・9頁）。引用「Financial gain is not necessarily a priority for young offenders」「Completing the challenge, sense of accomplishment, proving oneself to peers is a key motivation」。NCA 自身の確信度は「medium」（4頁）。
- 入口：ゲームのチート・改造の掲示板から（警告訪問の回答で「技術に入ったきっかけ」は23人中14人がゲーム、7頁）。
- 捕まる見込み：「Offenders perceive the likelihood of encountering law enforcement as low」（2頁）
- 被害の感覚：「Many offenders see criminal hacking as a victimless crime」（5頁）← 中和の技術（4-3）とつながる。

### 4-3 中和の技術（Sykes & Matza 1957）と、サイバー犯罪での実証

- Gresham M. Sykes & David Matza, "Techniques of Neutralization: A Theory of Delinquency", *American Sociological Review* 22(6), 664–670, 1957。**原文は今回開けていない**（書誌と5つの技術は Hutchings & Clayton 2016 の本文と百科事典の記述で確認＝二次）。
- 5つの技術：責任の否定／**被害の否定**／**被害者の否定**／非難する者への非難／より高い忠誠への訴え。悪いと分かっている人が、罪悪感を一時的に消すための言い訳の型。
- サイバー犯罪での実証：
  - Hutchings & Clayton (2016) "Exploring the provision of online booter services", *Deviant Behavior*（2016年5月9日）。DOI 10.1080/01639625.2016.1169829。原稿 https://www.cl.cam.ac.uk/~ah793/papers/2016booter.pdf 。一次。標本：booter 運営者に招待51、回答13（回答率25%）。要点：運営者は「正当なネットワーク試験のサービスだ」と主張しつつ、攻撃に使われていることは認めていた（責任の否定にあたる、というのは Claude の解釈）。サイトの保守にかける時間は月1〜400時間（平均112時間、n=10）。引用「The operators claim they provide legitimate services for network testing」
  - 同論文が引く Hutchings (2013) の聞き取り：サイバー犯罪の加害者が使う言い訳は「被害の否定（個人の被害者に損はない）」と「被害者の否定（守りが甘い相手が悪い）」。引用「denial of injury (as there is no loss to individual victims) and denial of the victim」。※ Hutchings 2013 の原文は未確認（二次）。
  - Bossler (2021) "Neutralizing Cyber Attacks: Techniques of Neutralization and Willingness to Commit Cyber Attacks", *American Journal of Criminal Justice* 46(6), 911–934。DOI 10.1007/s12103-021-09654-5。大学生への調査（**標本の大きさは未確認**）。要点：中和の尺度が高い人ほど、仲間の行動・技術・性別をそろえても、サイバー攻撃を「やってもいい」と答えやすい。最も強く効いたのは「非難する者への非難」と「当然の権利の主張」。引用「The strongest support was found for the techniques of condemnation of the condemners and claim of entitlement」（要旨。一次の要旨、本文未確認）
  - 「会社は保険で払うから誰も困らない」という言い訳を**数字で測った研究は見つけられなかった（未確認）**。被害の否定の一つとして語るなら「仮説」とする。

### 4-4 分業（RaaS）の規模の統計

- **開発者の取り分 20%**：米司法省ニュージャージー地区連邦検事の会見（2024年5月7日、LockBit 開発者の起訴）。https://www.justice.gov/usao-nj/media/1350946/dl 。一次。引用「is accused of receiving 20 percent of each LockBit ransom payment, totaling more than $100 million」。同じ会見で LockBit 全体の身代金は「approximately half a billion dollars」。→ 実行役（アフィリエイト）の側に残るのは**残り約8割**（Claude の推論。資料に「80%」の文字はない）。
- **実行役の多くは稼げていない**：英国 NCA「LockBit leader unmasked and sanctioned」（2024年5月7日）。https://www.nationalcrimeagency.gov.uk/news/lockbit-leader-unmasked-and-sanctioned 。一次。2024年2月までに LockBit を使った実行役 194 人のうち、攻撃を組んだのは148、交渉に入ったのは119、そのうち39は身代金を受け取った形跡なし。交渉しなかった75も受け取っていない。引用「up to 114 affiliates paid thousands to join the LockBit programme…but never made any money from their criminality」→ **最大114/194＝約6割が一銭も得ていない**。
- 取り締まりの後：Chainalysis 2025年版「LockBit…saw H2 payments decrease by approximately 79%」（2024年後半の LockBit への支払いが約79%減）。一次（自社推計）。

---

## 5. 抑止が効いた例（数字つき）

### 5-1 Collier, Thomas, Clayton, Hutchings (2019)「Booting the Booters」

- ACM Internet Measurement Conference (IMC '19), Amsterdam, 2019年10月。DOI 10.1145/3355369.3355592。原稿 https://strathprints.strath.ac.uk/70746/ 。一次。
- データ：5年分の反射型 DoS 攻撃の観測（ハニーポット）と、booter サイトが自分で公表する攻撃数（活動中の booter の75%以上をカバー）。負の二項回帰の時系列分析。
- 結果：
  - **FBI の2018年12月の一斉摘発**（運営者3人逮捕・15ドメイン差し押さえ）：攻撃が**約3分の1減り、少なくとも10週間続いた**（減少幅 27〜37%）。引用「reduced attacks by a third for at least 10 weeks」
  - HackForums が booter の売り場を閉じた（2016年10月）：世界で13週間減少。
  - 個々の booter の摘発：減るが短期間。
  - **話題になった判決には一貫した効果がない**。引用「there is no consistent effect of highly-publicised court cases」
  - **NCA の Google 検索広告**（2017年12月〜2018年6月、英国の16〜24歳が booter 関連の語を検索したときに「違法です」と警告）：米・仏・独などで増え続けた攻撃が、**英国だけ横ばい**になった。引用「In the UK, however, this upward trend flattened off entirely from December 2017 until June 2018」

### 5-2 Collier, Thomas, Clayton, Hutchings, Chua (2021) の続報

- "Influence, infrastructure, and recentering cybercrime policing…", *Policing and Society* 32(1), 103–124（オンライン公開2021年）。原稿 https://www.cl.cam.ac.uk/~bjc63/infrastructure_and_influence.pdf 。一次。
- 英国の攻撃の増え方（傾き）：広告の前（2016年7月〜2017年11月）**2.9** → 広告の間 **0.1**。同じ時期の米国は増え続けた。
- 費用：引用「by far the cheapest form of intervention we studied, costing only a few thousand pounds to achieve a significant reduction in attack numbers for six months」→ **数千ポンドで半年**。（「1万ポンド未満」という言い方はケンブリッジのブログにあるが、証明書の不具合で開けず未確認。使うなら論文の「数千ポンド」で。）
- 運営者を逮捕しても「見せしめ」の効果は見られない、利用者はすぐ海外の別の業者に移る、とも書いている。

### 5-3 その他（参考）

- Chainalysis 2024年版：FBI が Hive に潜入していた半年で、約1.3億ドルの支払いを防いだ（FBI の推計）。Chainalysis のモデルでは少なくとも2.104億ドル。一次（自社推計）。
- Coveware は支払い率が下がった理由として、企業の備え（バックアップ）、法執行機関が被害者支援に軸足を移したこと、身代金の収入が減って犯罪の運営コストが割に合わなくなったこと、を挙げる（Q4 2022報告）。

---

## 動画で使えそうな発見（5つ）

1. **「天才ハッカー」ではなく「10代・20代の若者」**：日本で不正アクセスで検挙された248人のうち、10代と20代で約7割（32.7%＋36.7%）。最年少は10歳。英国でもサイバー犯罪の容疑者の平均は17歳で、薬物事件（37歳）の半分以下。検挙された手口の上位は「パスワードの甘さ」「フィッシング」「他人から入手」で、システムの穴を突く型は2%。→ ハッカー像の答え合わせになる（確認済みの数字）。
2. **払う被害者が減り続けている**：支払い率は 2019年 76% → 2025年末 20%（Coveware）。Chainalysis でも、攻撃の主張件数は前年比+50%なのに受け取り総額は約8%減（2025年）。→ 「1回の攻撃あたりの稼ぎは下がっている」は割り算で言えるが、件数と金額の出所が違うので**仮説**として扱う。
3. **分業の下の層はほとんど儲からない**：LockBit の実行役194人のうち最大114人（約6割）は1円も得ていない（NCA）。開発者は毎回2割を取る（米司法省）。運営の仕事は「退屈な保守作業」（Collier ほか、聞き取り11件＝少数なので仮説の裏付け程度）。→ 損得を淡々と見せる材料。儲かる話として強調しない。
4. **捕まる確率は低く「見える」が、効くのは罰の重さより“確率と手間”**：米国の推計で届出に対する逮捕は約0.3%（Third Way）。一方、実測では、話題の判決には一貫した効果がなく、一斉摘発で攻撃が約3分の1減り（10週間）、数千ポンドの検索広告で英国だけ増加が止まった（半年）。Becker の「確率と罰」の枠組みで整理できる。※「確率の方が効く」と一般化するのは、この DDoS 市場1つの研究なので**仮説**。
5. **被害者の損は、犯人の取り分よりずっと大きいかもしれない**：日本の被害組織の52%が調査・復旧に1,000万円以上、44%が1か月以上（または復旧中）。中小企業が63%。払ったかどうかの数字は日本では公表されていない。→ 「犯人の得」と「社会の損」は釣り合っていない、という教訓につながる（**仮説**：日本の身代金額のデータがないので直接は比べられない）。

## 未確認・注意のまとめ

- 2020年のランサムウェア報告件数は下半期（21件）だけ。通年の値はない。
- 「2025年 支払い率28%・過去最低」は Chainalysis の推定。Coveware ではない（Coveware は 2025年Q4 で20%）。
- 「20代約4割」は 36.7%。「約4割」は言い過ぎ気味。
- Coveware の 2020年 70%・2021年 50% は Chainalysis 経由（二次）。
- Sykes & Matza 1957 の原文、Hutchings 2013、Bossler 2021 の標本の大きさは未確認。
- 「保険で払うから」という言い訳を数字で測った研究は見つけられなかった。
- NCA の広告の費用「1万ポンド未満」は未確認（論文の「数千ポンド」は確認済み）。
- 日本の不正アクセスの認知件数の2020年以前は集めていない。
