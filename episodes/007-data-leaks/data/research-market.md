# 第2章の資料集め：漏れた情報はいくらで、どこで実害になるのか（値段と分業）

調べた日：2026-10-06（クラウドのセッション。★オーナーの照合はまだ）
推移の表：`jca_card_fraud_by_year.csv`、`phishing_reports_by_year.csv`、`darkweb_prices.csv`（すべて BOM 付き UTF-8）

書き方：値｜単位｜資料名｜発行元｜年版｜ページ｜URL｜原文の短い引用｜一次か二次か
「一次」＝発行元の原文（PDF・公式ページ・公開データ表）を開いて値を確かめた。「二次」＝報道や転載でしか確かめられなかった。
闇市場の場所・買い方・手口は集めていない（値段と規模だけ）。

---

## 1. 闇市場での値段

### 1-1. NordVPN（NordStellar）盗まれたカードの値段 ― 最新（2025年）

| 項目 | 値 | 資料・ページ | 引用 | 区分 |
|---|---|---|---|---|
| 調べ方 | 闇市場の出品 **50,705件**（2025年5月に収集）。カード情報そのものは買わず、出品の付随情報（メタデータ）だけを分析 | NordVPN「Up for grabs: The cost of stolen payment card data」2025-10-29公開（2026-09-14更新）、Method 節 | "The dataset, collected in May 2025, included a total of 50,705 card records." | 一次 |
| **日本のカード1枚** | **22.8 ドル**（調べた国で最も高い） | 同ページ本文 | "Japanese cards are the most expensive ($22.8)" | 一次 |
| 日本のカードの件数 | **121件**（全体の0.24%） | 公開データ表「Countries」シート | （表の値）JP 121 | 一次（データ表） |
| 日本のカード1枚（2023年） | 11.07 ドル → 2025年は約2.1倍 | 公開データ表「True prices」シートの "Year 2023" 列 | （表の値）Japan 22.80 / 11.07 | 一次（データ表） |
| 米国のカード1枚 | 11.51 ドル（2023年 6.85ドル）。米国は30,540件で全体の約6割 | 同ページ本文・データ表 | "A card from the US costs $11.51" | 一次 |
| 最も安い国 | コンゴ民主共和国 0.94 ドル | 同ページ本文 | "Democratic Republic of Congo ($0.94)" | 一次 |
| 値段の動き | 2023→2025年で多くの国が2倍、最大444%の値上がり | 同ページ本文 | "Between 2023 and 2025, prices increased by as much as 444%." | 一次 |
| 値段の理由（誰が言ったか） | NordVPN のサイバーセキュリティ顧問 Adrianus Warmenhoven：供給と需要。供給が少ない国のカードは高い | 同ページ本文 | "Criminals pay more for cards from countries where the supply is low." | 一次 |
| 世界平均「約8ドル」 | **原文では確認できず**。公開ページは「映画のチケットくらい」とだけ書く。報道（Crowdfund Insider 2025-10-31）が "the global average still sits around $8" と書く | 二次 | — | 二次 |
| 参考：自分で計算した平均 | 全50,705件の単純平均 11.48ドル（中央値 11.70ドル）。国ごとの平均（132か国）の平均は 8.82ドル。「約8ドル」はこちらに近いが、NordVPN の計算方法は未確認 | データ表から計算 | — | 一次データから計算 |

- URL：https://nordvpn.com/research-lab/stolen-payment-cards/
- 公開データ表（CC BY-NC 4.0）：https://docs.google.com/spreadsheets/d/1mnFQu3r8g-wfsGxR32GY1OmkmDVxVZAT/
- 注意：日本は121件しかない。「日本のカードがいちばん高い」は小さい標本の値。

### 1-2. NordVPN の過去の調査

| 版 | 調べ方 | 平均 | 日本 | 資料 | 区分 |
|---|---|---|---|---|---|
| 2023年（報道では2023年5月。ページの日付は2024-11-29） | 8つの闇市場、約600万件 | **7.01 ドル**（"$6.86 as opposed to the $7.01 average"） | 約11ドル（デンマーク11.54ドルに次ぐ。ポルトガル・ウクライナと並ぶ） | https://nordvpn.com/research-lab/6-million-stolen-credit-cards-analyzed/ | 平均は一次。**日本の値は二次**（ページ本文に日本の記述なし。報道 brokernews.com.au 等）。データ表の 2023年列 11.07ドル とは整合 |
| 2021年（ページの日付は2024-10-25） | 第三者研究者のデータベース 4,478,908件 | **約10 ドル**（"about $10 USD per card"） | 未確認 | https://nordvpn.com/research-lab/payment-card-details-theft/ | 一次 |

### 1-3. Privacy Affairs「Dark Web Price Index」

**原文サイト（privacyaffairs.com）にこの環境から接続できなかった（接続拒否）。以下はすべて二次資料。** オーナーのPCで原文を開いて照合が要る。

| 版 | 値 | 資料 | 引用（報道の中の原文引用） | 区分 |
|---|---|---|---|---|
| 2020年版（2020-06-19報道） | カード情報＋付随情報 12〜20 ドル | Help Net Security https://www.helpnetsecurity.com/2020/06/19/dark-web-prices/ | "Full credit card details including associated data costs: $12-20" | 二次 |
| 2021年版（2021-06-04報道） | 残高1,000ドル未満 150ドル／5,000ドル未満 240ドル。複製Mastercard（暗証番号付き）25ドル | Security Affairs https://securityaffairs.com/?p=118574 | "Trading volumes are higher, and product variety is wider, too." | 二次 |
| 2022年版（データ：2021年2月〜2022年6月。2022-07-05報道） | 残高1,000ドル：120→**80ドル**、残高5,000ドル：240→**120ドル**。米・加・豪のカードは1枚**1ドル**。2021年12月に約**450万枚**が売りに出た | ITWeb https://itweb.co.za/article/dark-web-prices-plummet-as-supply-soars/WnxpEv4Yaww7V8XL | "approximately 4.5 million credit cards went up for sale" | 二次 |
| 2022年版（2022-06-22報道） | カード情報＋付随情報 17〜120ドル。複製VISA 20ドル | Help Net Security https://www.helpnetsecurity.com/2022/06/22/stolen-info-sale-dark-web/ | "as supply grew, most prices plummeted." | 二次 |
| 2023年版（2023-05-01発表） | カード情報＋付随情報 **10〜100 ドル**。複製Mastercard（暗証番号付き）約20ドル。「3年追っている品目の多くが大きく値下がり」 | PR Newswire（発行元のプレスリリース）https://prnewswire.co.uk/news-releases/peoples-personal-data-is-worth-1-000-on-the-dark-web-new-study-by-privacy-affairs-finds-301811813.html ／ BU-CERT 2023-07-04 https://cert.bournemouth.ac.uk/dark-web-price-index-2023/ | "Most items and services we track for 3 years saw a significant decrease in pricing" | 二次 |

- **調べ方（件数）は未確認**。報道は「闇市場・フォーラム・サイトを調べた」とだけ書き、出品の件数を書いていない。
- **「供給が多くて安くなった」と言っているのは誰か**：Privacy Affairs の CEO **Miklos Zoltan**（2022年版について）。引用 "In the past year, the dark web data market grew larger in total volume and product variety, so as supply grew, most prices plummeted."（Help Net Security 2022-06-22。二次）
- 食い違い：2021年版の報道は「残高1,000ドル未満150ドル」、2022年版の報道は「前年120ドル→80ドル」。どちらかの報道の誤りか品目の違い。原文で要確認。
- 2024年版・2025年版は出ていないとする二次資料あり（未確認）。2023年版が最新とみなす。

### 1-4. Comparitech

| 項目 | 値 | 引用 | 区分 |
|---|---|---|---|
| 調べ方 | 13の闇市場、カード約400件・PayPal 200件超 | "about 400 listings for credit cards" | 一次 |
| カード情報1件の平均 | **17.36 ドル**（0.11〜986ドル） | "US$17.36 is the average price of one stolen credit card's information" | 一次 |
| 複製した物理カード | 171 ドル | "US$171 is the average price of a physical, cloned credit card" | 一次 |
| 日本 | 日本・UAE・欧州のフルセット個人情報（fullz）は平均 **25ドル**（米国 8ドル） | "Japan, the UAE, and Europe have the most expensive identities at an average of $25" | 一次 |
| 推移 | カードは前年比27%下落（何年と何年の比較かは未確認） | "prices for credit cards fell this year by 27%" | 一次（比較年は未確認） |

資料：Comparitech（Paul Bischoff）「Dark web prices」2023-08-12更新 https://www.comparitech.com/blog/vpn-privacy/dark-web-prices/
注：検索結果の要約では「40以上の市場」とする版もある。ページ上の記述は13。版の違いの可能性。

### 1-5. Kaspersky

| 項目 | 値 | 引用 | 区分 |
|---|---|---|---|
| 調べ方 | 10の闇フォーラム・市場の出品 | "analyzed active offers on 10 international darknet forums and marketplaces" | 一次 |
| カード情報 | **6ドルから** | （原文要約）credit card details start around $6 | 一次 |
| 推移 | カード・銀行の値段はここ数年変わらない | "Credit card data, banking and e-payment service access have seen their respective prices unchanged in recent years" | 一次 |

資料：Kaspersky プレスリリース 2020-12-01 https://usa.kaspersky.com/about/press-releases/kaspersky-research-finds-out-how-much-your-personal-data-costs-online

---

## 2. 日本クレジット協会：クレジットカード不正利用被害額（暦年）

資料：日本クレジット協会「クレジットカード不正利用被害の発生状況」（2026年9月7日公表の別紙）p.2〈参考3〉1997年〜2025年
URL：https://www.j-credit.or.jp/information/statistics/download/toukei_03_g.pdf
発生率：同「クレジットカード不正利用発生率」（2026年3月）https://www.j-credit.or.jp/information/statistics/download/toukei_03_4_i.pdf
区分：すべて一次

| 年 | 被害額（億円） | 偽造 | 番号盗用 | その他 | 番号盗用の割合 | 発生率 |
|---|---|---|---|---|---|---|
| 2014 | 114.5 | 19.5 | 67.3 | 27.7 | 58.8% | — |
| 2015 | 120.9 | 23.1 | 72.2 | 25.6 | 59.7% | — |
| 2016 | 142.0 | 30.6 | 88.9 | 22.5 | 62.6% | — |
| 2017 | 236.4 | 31.7 | 176.7 | 28.0 | 74.8% | — |
| 2018 | 235.4 | 16.0 | 187.6 | 31.8 | 79.7% | — |
| 2019 | 274.1 | 17.8 | 222.9 | 33.4 | 81.3% | 0.037% |
| 2020 | 253.0 | 8.0 | 223.6 | 21.4 | 88.4% | 0.034% |
| 2021 | 330.1 | 1.5 | 311.7 | 16.9 | 94.4% | 0.041% |
| 2022 | 436.7 | 1.7 | 411.7 | 23.3 | 94.3% | 0.047% |
| 2023 | 540.9 | 3.1 | 504.7 | 33.1 | 93.3% | 0.051% |
| 2024 | 555.0 | 5.9 | 513.5 | 35.6 | 92.5% | 0.047% |
| **2025** | **510.5** | 7.2 | **475.4** | 27.9 | 93.1% | **0.038%** |

- 2025年：言われている値（約510億円・番号盗用約475億円・0.038%）は原文と一致。発生率の分母（ショッピング信用供与額）は134兆5,861億円。
- 引用（発生率の発表 2026-03-31）：「２０２５年の…「不正利用発生率」は、０．０３８％となり、前年（２０２４年）から０．００９ポイントの減少」
- 2013年以前（1997年〜）も CSV に入れた。ただし**原文に「2013年以前と2014年以降の数値の連続性はない」**とある（調査方法の見直し）。2013年以前は番号盗用の内訳なし。
- 発生率の年値が公表されているのは2019年から（それ以前は未確認）。
- **2026年から調査方法が変わった**（主要事業者48社ベース）。2026年1〜6月は221.3億円（番号盗用206.1億円、発生率0.031%）。2025年以前と並べて比べない。
- 海外発行カードの被害は含まない。2026年上半期の番号盗用のうち国内68.3%・海外31.7%（被害が起きた場所の内訳）。

---

## 3. フィッシング対策協議会：フィッシング報告件数（年）

区分：すべて一次（各年の「フィッシングレポート」PDF。ページはPDFのページ番号）

| 年 | 報告件数 | 前年比（原文） | 資料・ページ | 引用 |
|---|---|---|---|---|
| 2018 | 19,960 | 約2倍 | フィッシングレポート2019 p.8 https://www.antiphishing.jp/report/pdf/phishing_report_2019.pdf | 「フィッシング報告件数は19,960件で、2017年に比べ約2倍」 |
| 2019 | 55,787 | 約2.8倍 | 同2020 p.14 https://www.antiphishing.jp/report/phishing_report_2020.pdf | 「報告件数は55,787件で、2018年と比較して約2.8倍」（正誤表で47,579件から訂正済み） |
| 2020 | 224,676 | 約4倍 | 同2021 p.8 https://www.antiphishing.jp/report/phishing_report_2021.pdf | 「報告件数は224,676件で、2019年と比較して約4倍」 |
| 2021 | 526,504 | 約2.3倍 | 同2022 p.8 https://www.antiphishing.jp/report/phishing_report_2022.pdf | 「報告件数は526,504件で、2020年と比較して約2.3倍」 |
| 2022 | 968,832 | 約1.8倍 | 同2023 p.8 https://www.antiphishing.jp/report/phishing_report_2023.pdf | 「報告件数は968,832件で、2021年と比較して約1.8倍」 |
| 2023 | 1,196,390 | 約1.23倍 | 同2024 p.9 https://www.antiphishing.jp/report/phishing_report_2024.pdf | 「過去最高の100万件を超えて1,196,390件」 |
| 2024 | 1,718,036 | 約1.44倍 | 同2025 p.9 https://www.antiphishing.jp/report/phishing_report_2025.pdf | 「過去最多の1,718,036件となり」 |
| **2025** | **2,454,297** | 約1.43倍 | 同2026 p.9 https://www.antiphishing.jp/report/phishing_report_2026.pdf | 「過去最多の2,454,297件となり、2024年と比較して約1.43倍」 |

- 2018→2025年で**約123倍**（2,454,297÷19,960）。
- 「報告件数」は協議会に届いた報告の数で、フィッシングの実数ではない（届け出が増えた影響も含む）。
- 同レポート2026は、証券口座の乗っ取りの被害額を報じた記事によって「約7,393億円」「約739億円」と食い違う。第2章で使うなら金融庁の原資料で確かめる（未確認）。

---

## 4. 漏えいの被害者に払われた金額・企業の費用

### 4-1. おわびの金券

| 事例 | 値 | 資料 | 引用 | 区分 |
|---|---|---|---|---|
| ベネッセ（2014年） | **500円**の金券（電子マネーギフトか図書カード。財団への寄付も選べる）。補償の原資200億円 | ITmedia 2014-09-10 https://www.itmedia.co.jp/news/article/1409/10/1140910143/ | 「お詫びとして500円の金券を用意する」 | 二次（ベネッセ自身の発表文は未確認） |
| ベネッセ 特別損失 | 260億円（補償200億円＋調査・対策など60億円） | ScanNetSecurity 2014-08-01 https://scan.netsecurity.ne.jp/article/2014/08/01/34611.html | — | 二次 |
| ベネッセ 漏えい人数 | 約4,858万人（件数では約3,504万件） | ベネッセ 個人情報漏えい事故調査委員会 報告（2014-09-25）https://www.benesse.co.jp/customer/dl/incident_20140925_release.pdf | 「個人情報が漏えいした者の人数は、約4,858万人」 | 一次 |
| Yahoo!BB（2004年） | **500円**相当の金券を全会員（解約者等も）に。費用は約40億円。流出は451万7,039件 | ＠IT 2004-02-28 https://atmarkit.itmedia.co.jp/news/200402/28/softbank.html | 「全会員に対して500円相当の金券を送付する」「40億円程度の費用」 | 二次 |

### 4-2. 裁判で認められた慰謝料（1人あたり）

| 事件 | 裁判所・日付 | 1人あたり | 資料 | 区分 |
|---|---|---|---|---|
| Yahoo!BB | 大阪地裁 2006-05-19 | 6,000円（原告5人） | INTERNET Watch 2006-05-22 https://internet.watch.impress.co.jp/cda/news/2006/05/22/12036.html | 二次 |
| Yahoo!BB | 大阪高裁 2007年6月（最高裁 2007-12-14 上告退け確定） | 5,500円 | INTERNET Watch 2007-12-17 https://internet.watch.impress.co.jp/cda/news/2007/12/17/17899.html | 二次 |
| ベネッセ | 最高裁第二小法廷 2017-10-23 | 金額なし（大阪高裁へ差し戻し） | モノリス法律事務所 https://monolith.law/corporate/risk-of-company-personal-information-leak-compensation-for-damages | 二次 |
| ベネッセ | 東京高裁 2019-06-27 | **2,000円**（原告2人。ベネッセ本体に初の賠償命令） | 日本経済新聞 2019-06-28 https://www.nikkei.com/article/DGXMZO46692510Y9A620C1CR0000/ | 二次 |
| ベネッセ | 大阪高裁 2019-11-20（差戻し審） | **1,000円**（請求10万円） | モノリス法律事務所（同上） | 二次 |
| ベネッセ | 東京地裁 2023-02-27 | **3,300円**（漏えいを認めた4,027人、計約1,300万円。請求は1人5万5千円、原告約5,700人） | 沖縄タイムス（共同）2023-02-28 https://www.okinawatimes.co.jp/articles/-/1110694 | 二次 |
| ベネッセ | 東京地裁（日付は未確認） | 3,300円（3,338人、計約1,100万円） | rocket-boys.co.jp（記事内の日付が食い違う） | 二次・**未確認**（上の2023-02-27判決と同じ事件の別の報道の可能性） |

- 判決文そのもの（裁判所の判例集）は見つけられなかった。**判決はすべて二次資料**。「1人あたり数千円」は 1,000〜6,000円の範囲で確か（二次）。
- 「1人数千円」の判決の理由として、東京地裁は氏名・生年月日などは「秘匿性が高いと言えない」とした（rocket-boys.co.jp の報道。二次）。

### 4-3. 企業が負う費用

| 項目 | 値 | 資料 | 引用 | 区分 |
|---|---|---|---|---|
| JNSA 想定損害賠償額（1人あたり平均、2018年） | **2万9,768円**（2017年 2万3,601円、2005〜2017年平均 3万9,178円） | JNSA「2018年 情報セキュリティインシデントに関する調査結果〜個人情報漏えい編〜（速報版）」スライド2〜3/23 https://www.jnsa.org/result/incident/2019/2019-005.pdf | 「一人当たり平均想定損害賠償額 2万9,768円」 | 一次 |
| JNSA 1件あたり平均想定損害賠償額（2018年） | 6億3,767万円（443件・561万3,797人。総額2,684億5,743万円） | 同上 | 「一件当たり平均想定損害賠償額 6億3,767万円」 | 一次 |
| JNSA の算定方法 | JO モデル（JNSA Damage Operation Model for Individual Information Leak）で算出した「想定」の額。払われた額ではない。報道・公表記事から集計。式の中身（情報の種類の重み・社会的責任度・事後対応の係数）はこの速報版には書かれておらず**未確認** | 同 2017年版（速報）p.1 https://www.jnsa.org/result/incident/2018/2018-002.pdf | 「JO モデル（…）を用いた想定損害賠償額の算出」 | 一次 |
| JNSA の新しい版 | 2018年版より後の個人情報漏えい編は**未確認**（見つからなかった） | — | — | — |
| IBM「Cost of a Data Breach 2025」日本 | 1件あたり平均総コスト **5億5,000万円**（前年比約13%減。8年ぶりの減少）。16か国・地域600社、2024年3月〜2025年2月 | クラウド Watch 2025-09-03 https://cloud.watch.impress.co.jp/docs/news/2044188.html ／ ＠IT 2025-09-02 | 「日本における平均総コストは…5億5000万円」 | 二次（日本IBMの発表文は開けず） |
| IBM 2026年版 | 世界平均 499万ドル（2026-07-30報道）。**日本の値は未確認**（検索要約に「453万ドル」とあるが裏付けなし） | eSecurity Planet https://www.esecurityplanet.com/cybersecurity/ibm-2026-cost-of-a-data-breach-report-key-findings/ | "the global average cost of a data breach reached a record $4.99 million in 2026" | 二次 |

---

## 5. 漏れた情報が実害につながる割合

- **日本の調査は見つからない**（漏えいの通知を受けた人のうち、不正利用・なりすまし・詐欺の被害にあった人の割合）。
- 米国の参考（Javelin Strategy & Research）：
  - 2013年版「Identity Fraud Report」（2013-02-20）："1 in 4 consumers that received a data breach letter became a victim of identity fraud"（調査：米国の成人5,249人）https://javelinstrategy.com/coverage-area/2013-identity-fraud-report-data-breaches-becoming-treasure-trove-fraudsters ― 一次（Javelin の要約ページ）
  - 2014年版：2013年に通知を受けた人の**3人に1人**が何らかの詐欺被害（調査5,600人、2013年10月）。報道（CNBC 2014-02-06、bobsullivan.net ほか）― 二次
  - 注意：米国の、しかも約10年前の数字。日本にそのまま当てはめられない。社会保障番号の有無など条件が違う。

---

## 動画で使えそうな発見（5つ）

1. **日本のカードは闇市場でいちばん高い（1枚22.8ドル）。しかも2年で約2倍**（NordVPN 2025、一次）。NordVPN は「供給が少ない国のカードは高い」と説明。ただし日本のカードは50,705件中121件だけ。→「日本人の情報は安く売られている」という思い込みと逆。（理由の部分は NordVPN の説明＝仮説）
2. **値段と被害の桁の差**：カード1枚は数ドル〜20ドル台なのに、日本の不正利用被害は年510億円（2025年）、その93%が番号盗用（一次）。「売る側の取り分は小さく、お金になるのは使う側」という分業の絵になる。（分業の解釈は仮説）
3. **偽造カードから番号盗用へ**：番号盗用の割合は2014年59% → 2021年以降9割超、偽造は19.5億円→1〜7億円（一次）。被害の場所が「カードそのもの」から「番号」に移った。
4. **3つの値段が並ぶ**：おわびの金券500円 ／ 判決の慰謝料1,000〜6,000円（ベネッセは2,000円・1,000円・3,300円。二次） ／ JNSA の想定約3万円（一次）。闇市場での日本のカード1枚22.8ドル（約3,400円、1ドル＝150円で換算した場合）は、たまたまベネッセ東京地裁判決の3,300円とほぼ同じ。（比べ方は演出上の仮説。為替で変わる）
5. **「供給が増えて安くなった」と「品薄で高くなった」は両方ある**：Privacy Affairs の CEO は2022年に「供給が増え、多くの値段が急落した」（二次）。NordVPN は2023→2025年に多くの国で2倍と報告（一次）。調査ごとに品目・市場・件数が違うので、値段の推移は「調べ方によって逆の結論になる」として見せるのが安全。あわせてフィッシング報告は2018→2025年で約123倍（一次）、発生率は2023年0.051%→2025年0.038%に下がった（一次。下がった理由は未確認）。

## 未確認・残っていること

- Privacy Affairs の原文（接続できず）。調べ方の件数、各版のカード価格。
- NordVPN の「世界平均約8ドル」の計算方法（公開ページに数字なし）。
- ベネッセ・Yahoo!BB の判決文（一次）と、ベネッセ東京地裁3,300円の2つの報道の関係。
- ベネッセの500円金券の発表文（一次）。
- IBM 2025年版の日本の値の原文、2026年版の日本の値。
- JNSA 2019年以降の個人情報漏えい編の有無。
- 日本で「漏えい通知を受けた人の被害率」を示す調査。
