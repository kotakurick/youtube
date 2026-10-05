# 003 論文の原文での読み直し（S1〜S5、S10〜S13）

読み直した日：2026-10-05（クラウドのセッション。ネットワークが通るようになったので、PDF を scratchpad に落として `pdftotext -layout` で読んだ。PDF はリポジトリに入れていない）

- 数字は原文から書き写した。ページは「原文の PDF に印刷されているページ番号」で書く。
- **読めなかったものは「読めず」と書いた。** 推測で埋めていない。
- この作業ではほかのファイル（sources.csv など）は書き換えていない。下の「直した値の案」を、照合（★）のあとで sources.csv に写す。
- 「照合（オーナー）」の列は空のまま。ここに書いたのはクラウドの読み直しで、★の代わりにはならない。

## まとめ（大きな違いだけ）

| S | 一番大きい違い |
|---|---|
| S1 | 底の深さが分かった：20歳→40歳で **6.00点＝約0.90標準偏差**（著者の言い方は "large"）。年数の最初の10年は 6.14点＝約0.95標準偏差。ただし65歳以上は標本が5つ（50〜65歳は3つ）しかない。標本の95%が欧米、アジアは3%（中国・台湾）で**日本の標本はない**。 |
| S2 | 題が違う。正しくは "How Relationship Satisfaction Changes Within and Across Romantic Relationships: Evidence From a Large Longitudinal Study"。「2つ目の関係でも下がる」は 2,268人全体ではなく、**別れて新しい相手と付き合った 167人** の分析。 |
| S3 | 要旨の原文を読めた。17年・5回の全国パネル。1回目の横断データでは U字が出るが、同じ人を追うとどの年数でも下がる。著者は「U字は横断研究の産物」と書く。 |
| S4 | **日本の底は50歳**（統制あり。掲載版の注）。 |
| S5 | 著者は Oshio & Shimizutani。日本の人数は **23,494**（訂正版の表3）。本文は有料で読めず、**データ名と「58歳」がどのモデルから出たかは未確認**。 |
| S10 | 著者は3人（Floyd, van Raalte, **Hesse**）。原文・要旨は出版社がブロックで読めず。大学の発表（WSU）は読めた。PsyPost によると「愛」と「献身」ではつり合いより総量が強い、とは言えなかった。 |
| S11 | **「公平感」の論文ではない。** 題は "Division of Housework, Communication, and Couples' Relationship Satisfaction"。要旨は「家事の分担と満足度のあいだを、会話の質がつなぐ」という話。487組。台本の「家事は量より公平感」の出典には使えない。 |
| S12 | Twenge 2003 の要旨は sources.csv と一致。Mitnick 2009 の要旨も一致（効果量の数字は要旨になし）。 |
| S13 | 質問は「幸せ」ではなく **「夫婦仲が円満か」**。休日の会話は、円満と答えた人で平均 **266分**（文章では「4時間30分」）、円満でないと答えた人で **50分**。1,620人のネット調査。「円満でない」は全体の約7%と少ない。 |

---

## S1 Bühler, Krauss, Orth 2021（Psychological Bulletin）

読んだもの：著者の公開版 PDF（https://janina-buehler.com/wp-content/uploads/2021/12/Buhler-Krauss-Orth-2021.pdf）。**オンライン先行版（Online First, 2021-12-20）の組版で、ページは1〜42。** 紙の号は 147(10), 1012–1053（Crossref で確認）。下のページはオンライン先行版の番号で、紙の号のページとの対応は確かめていない。

### 原文の値

- **規模**：「Data came from 165 independent samples including 165,039 participants.」（要旨 p.1）。「Data were drawn from 89 journal articles and six dissertations.」（p.12）→ 論文95本。標本の大きさは32〜84,711人（中央値183）。
- **国**：「Almost all of the samples came from Western countries (95%)」、米国54%、カナダ9%ほか。「Only 3% were from Asian countries (i.e., China and Taiwan).」（p.12）→ **日本の標本はない。**
- **年齢による底**：「relationship satisfaction decreased from age 20 to 40, reached a low point at age 40, then increased until age 65, and plateaued in late adulthood」（要旨 p.1）。
  - 表3（p.19）の年齢層ごとの平均 POMP：20–30歳 83.61（k=60, N=97,478）、30–40歳 79.31（k=56）、**40–50歳 77.61**（k=37, N=29,183）、50–65歳 79.32（**k=3**, N=1,710）、65–76歳 80.47（**k=5**, N=2,301）。
  - 著者の注意：「Due to a smaller number of samples above age 50 years, the findings for middle and late adulthood should be interpreted with more caution.」（p.26）
- **年数による底**：「relationship satisfaction decreased during the first 10 years of the relationship, reached a low point at 10 years, increased until 20 years, and then decreased again」（要旨 p.1）。
  - 表3（p.19）：0–5年 83.16、5–10年 81.13、**10–20年 77.02**、20–30年 82.99（k=7）、30–46年 79.32（k=4）。
- **年齢と年数を同時に入れた結果**（p.22）：「When age and relationship duration were examined simultaneously, the metaregression models suggested that age is the dominant time metric in the prediction of mean levels of relationship satisfaction ... More precisely, relationship duration did not show any linear or quadratic effect on relationship satisfaction, over and above the effects of age.」（表5、p.23。メタ回帰は k=117）
  - 2つ目の分け方（p.23、表6・表7）：年齢をそろえると年数の群のあいだに有意な差なし（「when age is constrained, relationship satisfaction did not differ depending on people's relationship duration」）。年数をそろえた年齢の比較では、10年未満と25年超で有意、10〜25年では有意でない。
  - 結論の言い方：「age, rather than relationship duration, is the more dominant time metric」（p.23）。
  - 注意（脚注10、p.24）：年齢と満足度の相関（r = −.19）と、年数と満足度の相関（r = −.14）の差は有意ではない（p = .054）。
- **効果の大きさ**（p.21）：「The difference between age 20 and 40 corresponded to 6.00 points. ... the mean standard deviation of the POMP scores at Time 1, which was 6.44. Thus, a change of about 6.5 points on the POMP scale roughly corresponds to a change by 1 SD ... the decrease from age 20 to 40 years corresponded to about 0.90 SDs, suggesting a large magnitude of difference.」
  - 年数（p.22）：「The decrease during the first 10 years of a relationship corresponded to 6.14 points. The increase during the next 10 years corresponded to 5.97 points. ... the decrease during the first decade was about 0.95 SDs and the increase during the second decade was about 0.90 SDs, suggesting large magnitudes of change.」
- **横断と縦断の違い**：
  - 縦断（同じ標本の1年あたりの変化、表4 p.20）：年齢 20–30歳 −2.942、30–40歳 −1.585、40–50歳 −0.133（95%CI [−0.326, 0.059]）、50–65歳 −1.531、65–76歳 −0.603。年数 0–5年 −2.600、5–10年 −1.581、10–20年 −0.930、20–30年 −0.129（CI に0を含む）、30–46年 −0.858。全体の平均は ΔPOMPyear = −1.688（p.18）。→ **点推定はすべてマイナスだが、40–50歳・50–65歳・65–76歳・20–30年・30–46年は信頼区間が0をまたぐ。**
  - 形の違い（p.21）：「the longitudinal information ... suggested much stronger declines compared with the cross-sectional information.」縦断では回復は出ない。
  - 著者は年齢については横断の方が妥当と考える（p.21〜22）：縦断は同じ関係の中の変化で、別れて新しい関係を始める人を含まないため「the longitudinal information likely provides a too negative picture」。
  - 年数の「10〜20年で上がる」について（p.27）：「the observed increase from 10 to 20 years of relationship duration might partially, or even fully, result from selective break-ups of couples over time.」
- **「底でも満点の77%」の根拠**：表3の最も低い群の値（年齢 40–50歳 77.61、年数 10–20年 77.02）。本文 p.21「the mean score was 77.61, indicating that the absolute level of satisfaction was still relatively high」、p.22「the mean score was 77.02」。POMP は「(観測値−最小値)/(最大値−最小値)×100」（式1、p.11）で、**尺度の最小〜最大の幅に対する位置**。「満点の77%」は近いが、厳密には「尺度の幅の77%の位置」。群の平均であって、個人がみな77%以上という意味ではない。同じ著者が S2 の p.31 で「average values of relationship satisfaction do not go below 77% of the maximum possible」と書いている。
- **調整役**（p.24、表8 p.25）：子どもがいる割合（B = −6.340, p < .001）と、測り方（global な満足度の尺度 B = 3.678, p < .001）だけが有意（Bonferroni で p < .003）。

### sources.csv の今の値との違い

- 「年齢と年数を同時に入れると年齢が主」は原文どおり（"age is the dominant time metric"）。ただし「年数の効果は年齢に上乗せされない」が正確な言い方。
- 「65歳まで上がる」は原文どおりだが、50歳以上は標本が8つしかない（k=3と5）という注意が抜けている。
- 「底でも満点の77%を下回らない」は群の平均の話。POMP（尺度の幅に対する割合）。
- 表・ページが「要確認」→ 埋められる。効果量（約0.9標準偏差）が抜けている。日本の標本がないことが抜けている。

### 直した値の案

- 値：`165標本・165,039人（論文95本）。年齢：20歳から下がり40歳で底（40〜50歳の群 POMP 77.61）、65歳まで上がり、その後横ばい。20→40歳の差は6.00点≒0.90標準偏差。年数：10年目で底（10〜20年 77.02）、20年目まで上がり、その後また下がる。最初の10年の下がりは6.14点≒0.95標準偏差。年齢と年数を同時に入れると年齢が主で、年数は年齢に上乗せする効果なし`
- 単位：`POMP（尺度の幅に対する%）`
- 表・ページ：`要旨p.1、表3 p.19、表4 p.20、効果量 p.21〜22、表5・本文 p.22〜23（オンライン先行版の頁）`
- メモ：`原文で確認（2026-10-05、クラウド）。標本の95%は欧米、アジアは3%（中国・台湾）で日本なし。50歳以上は標本8つ（k=3と5）で著者も注意。縦断（同じ人を追う）では全群で平均マイナス、回復は出ない。10〜20年の上昇は不満な夫婦が別れて抜けた効果かもしれない（p.27）。doi:10.1037/bul0000342、紙は147(10)1012–1053`

---

## S2 Bühler & Orth 2024（JPSP）

読んだもの：著者の公開版 PDF（https://uorth.wordpress.com/wp-content/uploads/2024/01/buhler-and-orth-2024-jpsp.pdf）。**受理稿（in press の原稿、全61ページ）で、最終版ではない**と冒頭に書かれている。巻・ページは Crossref で 126(5), 930–945 と確認。下のページは原稿のページ番号。

### 原文の値

- **正しい題**：「How Relationship Satisfaction Changes Within and Across Romantic Relationships: Evidence From a Large Longitudinal Study」（p.1）
- **データ**：「Data came from a large longitudinal study (the Longitudinal Study of Generations), including 2,268 participants aged 16 to 90 years, who were assessed at up to seven waves across 20 years.」（要旨 p.2）
  - 南カリフォルニアの健康保険組合の加入者から1971年に選んだ3世代の家族（p.9）。「primarily White working class and middle-class families」（p.9）。著者は米国の代表標本ではないと書く（p.37）。
- **群の人数**（p.13）：続いた関係 N = 2,104、別れた関係 N = 294、**別れて新しい関係に入った人（repartnered）N = 167**。
- **「2つ目の関係でも下がる」の原文**：
  - 要旨（p.2）：「Individuals who began a new relationship after separation were more satisfied at the beginning of the new relationship compared to the beginning of the previous relationship. However, satisfaction declined within both relationships (i.e., the previous and the new relationship).」
  - 結果（p.24、表6 p.25）：関係の年数の効果 B = −0.015（p = .003）、2つ目の関係 B = 0.477（p < .001）、交互作用 B = −0.011（p = .084、有意でない）→「The negative effect of relationship duration ... did not differ between the first and second relationship.」
  - 前の関係で大きく下がった人は、新しい関係でも大きく下がる（表7 p.25、傾きどうしの相関 .18）。
- 別れた人は、別れのころ 5段階で 3.50〜3.60（d = 0.60〜0.70 低い）、POMP で約65%（p.31）。

### sources.csv の今の値との違い

- 題が違う（「Rise and fall of ...」は誤り）。
- 「2,268人。1つ目でも2つ目でも下がる」→ 2つ目の関係の分析は 167人。
- 表・ページが「要確認」。

### 直した値の案

- 調査・論文名：`How Relationship Satisfaction Changes Within and Across Romantic Relationships: Evidence From a Large Longitudinal Study`
- 発行元・著者：`Bühler & Orth（Journal of Personality and Social Psychology 126(5)）`
- 値：`米国のLongitudinal Study of Generations、2,268人（16〜90歳、最大7回・20年）。別れて新しい相手と付き合った167人では、新しい関係の始まりは前の関係の始まりより満足度が高いが、どちらの関係の中でも年数とともに下がり、下がり方に差はなかった`
- 表・ページ：`要旨p.2、群の人数p.13、表6 p.25（受理稿の頁）`
- メモ：`原文（著者公開の受理稿）で確認（2026-10-05、クラウド）。南カリフォルニアの家族が元の標本で、白人の労働者・中流が中心。代表標本ではない。年数で下がる証拠で、年齢の証拠ではない。doi:10.1037/pspp0000492`

---

## S3 VanLaningham, Johnson, Amato 2001（Social Forces）

読んだもの：**本文は読めず**（OUP・JSTOR・Project MUSE はブロックか認証の画面）。要旨の全文は SciSpace のページ（https://scispace.com/papers/marital-happiness-marital-duration-and-the-u-shaped-curve-nj6pka1h29）にあったものを書き写した。巻・号・ページは Crossref で 79(4), 1313–1341、doi:10.1353/sof.2001.0055 と確認。

### 原文の値（要旨）

> Previous research suggests a U-shaped pattern of marital happiness over the life course, with happiness declining in the early years of marriage and rising in the later years. Most prior studies have been limited by the use of cross-sectional data or nonprobability samples. In contrast, the present study is based on data from a national, 17-year, 5-wave panel sample. Using cross-sectional data from the first wave, we replicate the U-shaped relationship between marital happiness and marital duration. In an analysis based on a fixed-effects pooled time-series model with multiple-wave panel data, we find declines in marital happiness at all marital durations and no support for an upturn in marital happiness in the later years. The relationship between marital happiness and marital duration is slightly curvilinear, with the steepest declines in marital happiness occurring during the earliest and latest years of marriage. When other life-course variables are controlled, a significant negative effect of marital duration on marital happiness remains. For most marriage cohorts, marital happiness declined more in the 1980s than in the 1990s, suggesting a period effect. This study provides evidence that the U-shaped pattern of marital happiness over the life course is an artifact of cross-sectional research and is not typical of U.S. marriages.

（SciSpace の抽出では "Mostprior" "1 7-year" "5wave" "Ushaped" "supportfor" と字が詰まっていたので、空白だけ直した）

- 人数は要旨になし（本文が読めず未確認）。Crossref では、使ったデータは「Marital Instability Over the Life Course: A Five-Wave Panel Study, 1980, 1983, 1988, 1992-1994, 1997」（ICPSR 2163）と思われるが、本文で確かめていない。

### sources.csv の今の値との違い

- 「5回のパネル。後半に上がるU字は支持されない」は要旨どおり。足りないのは「17年」「全国」「1回目の横断ではU字が出る」「下がりがいちばん急なのは結婚の最初と最後の年」。
- 表・ページ「p.1313〜」は論文の始まりのページで、要旨の位置としては正しい。

### 直した値の案

- 値：`全国17年・5回のパネル（米国）。1回目の横断データではU字が出るが、同じ人を追う固定効果モデルではどの年数でも幸福度が下がり、後半の上昇は支持されない。下がりが急なのは結婚の最初と最後の年。著者は「U字は横断研究の産物」とする`
- 表・ページ：`p.1313（要旨）`
- URL：`https://doi.org/10.1353/sof.2001.0055`
- メモ：`要旨の全文で確認（2026-10-05、SciSpaceに載った要旨）。本文は未読で人数は未確認。米国`

---

## S4 Blanchflower 2021（Journal of Population Economics）

読んだもの：Springer の記事ページ（https://link.springer.com/article/10.1007/s00148-020-00797-z）。**本文は有料で読めず**、要旨と「Notes（注）」と参考文献が公開されていた。巻・号・ページは Crossref で 34(2), 575–624。

### 原文の値

- 要旨：「This paper re-examines the relationship between various measures of well-being and age in 145 countries, including 109 developing countries, controlling for education and marital and labor force status, among others, on samples of individuals under the age of 70. The U-shape of the curve is forcefully confirmed, with an age minimum, or nadir, in midlife around age 50 in separate analyses for developing and advanced countries as well as for the continent of Africa.」「I find the age of the minima has risen over time in Europe and the USA.」
- **日本の値**（記事ページの Notes、最初の注）：「The age minima in the 36 advanced countries with controls are as follows: ... **Japan 50** ... USA 45.」（統制あり。同じ注で韓国49、台湾41）
- 同じ注：「This is an update of Blanchflower (2020a), which found the U-shape in 132 countries.」
- 別の注に「a U-shape was found in twenty-two advanced countries (... Japan ...)」とある（先行研究の紹介の文脈。どの研究の話かは本文が読めず未確認）。
- 掲載版の先進国・途上国の平均の底の年齢（作業論文版の 47.2歳・48.2歳に当たるもの）は**本文が読めず未確認**。

### sources.csv の今の値との違い

- 「日本の値は未確認」→ **日本50歳（統制あり）**。
- 145か国・底は50歳前後は要旨どおり。

### 直した値の案

- 値：`145か国（うち途上国109）、70歳未満。学歴・婚姻・就業などを統制してU字、底は中年の50歳前後。日本の底は50歳（統制あり。米国45歳）`
- 表・ページ：`要旨、記事の注（Notes の最初の注。36の先進国の底の年齢の一覧）`
- メモ：`記事ページで確認（2026-10-05、クラウド）。本文は有料で未読。作業論文版（132か国）の平均 47.2歳・48.2歳は掲載版で未確認。データ名は本文で要確認。反論 Galambos ほか 2020（doi:10.1177/1745691620902428）も出す`

---

## S5 Oshio & Shimizutani 2024（The Japanese Economic Review）

読んだもの：Springer の記事ページ（要旨のみ。**本文は有料で読めず**）と、無料で公開されている訂正（Correction, 75:1041–1042, doi:10.1007/s42973-024-00183-4。誤った表3を差し替えたもの）。著者は Takashi Oshio（一橋大学経済研究所）、Satoshi Shimizutani（名古屋大学）。巻・号・ページは Crossref で 75(4), 547–562。

### 原文の値

- 要旨：「Using repeated cross-sectional survey data from Japan (2000–2018), China (2003–2021), and the US (2000–2022) and controlling for period and cohort effects, we compared the trajectory of happiness over age across the three countries. We observed U shaped age-happiness curves across the three countries, despite different troughs (at age 58 years in Japan somewhat later than at age 49 years in China and at age 42 years in the US) and curvatures (sharper in Japan and China than in the US).」「spousal loss was a dominant intervening factor in all countries. The slope of the U-shaped curve becomes steeper after controlling for these intervening variables in all three countries」
- **人数**（訂正の表3、p.1042）：日本 N = **23,494**（モデル1・2とも）、中国 99,483（モデル1）／84,145（モデル2）、米国 24,290。
- **モデル**（訂正の表3）：モデル1＝年齢（1〜3乗）、女性、大卒＋時代と世代（"Further controlled for period and cohort effects."）。モデル2＝さらに配偶者がいる、仕事がある、主観的健康がよい、を加える。
- **58歳がどちらのモデルから出たか**：要旨の書き方（時代・世代を統制して底を比べ、そのあと「介在する変数を入れると曲線がより急になる」）からはモデル1と読めるが、**本文が読めず未確認**。
- **データ名**：記事ページ・訂正のどちらにも書かれておらず**未確認**（日本 2000〜2018 の繰り返し横断調査なので JGSS の可能性が高いが、推測なので書かない）。

### sources.csv の今の値との違い

- 著者・題・雑誌は合っている。「データ名・人数・統制の有無は未確認」→ 人数は 23,494、統制は「時代・世代・性別・学歴」まで確認。データ名と、58歳がどちらのモデルからかは未確認のまま。
- 測っているのは「幸福度」（happiness）。人生満足度ではない。

### 直した値の案

- 値：`日本58歳・中国49歳・米国42歳（幸福度のU字の底。時代・世代を統制）。日本は2000〜2018年の繰り返し横断調査、23,494人`
- 表・ページ：`要旨（p.547）、表3（訂正 p.1042）`
- メモ：`要旨と訂正（表3）で確認（2026-10-05、クラウド）。本文は有料で未読：データ名と、58歳が性別・学歴だけを統制したモデル1か、配偶者・仕事・健康も入れたモデル2かは未確認。配偶者を失うことが主な介在要因。題の「40歳」とぶつかる`

---

## S10 Floyd, van Raalte, Hesse 2026（Communication Studies）

読んだもの：**論文の要旨・本文は読めず**（tandfonline.com はネットワークでブロック、Crossref にも登録なし）。WSU の発表（https://news.wsu.edu/press-release/2026/02/05/hug-your-boo-more-affection-not-equal-amounts-strengthens-romantic-ties/、2026-02-05）は読めた。著者3人は Semantic Scholar の書誌で確認。PsyPost の解説（https://www.psypost.org/for-romantic-satisfaction-quantity-of-affection-beats-similarity/）も読んだ（二次）。

### 原文の値（WSU の発表）

- 「The authors studied questionnaires completed by 282 adults in the U.S. The survey included 141 heterosexual couples who had been in their relationships between six months and 48 years.」
- 「They overwhelmingly found that more affection, even if one-sided, correlates to stronger relationships than similar levels of affection.」
- 測り方：「people who know me would describe me as affectionate」などに1〜5で答える、性格としての愛情表現（trait）。
- 第一著者の言葉として「It's not a good idea to demand more affection ... If you want more affection, model that behavior.」（助言なので台本には使わない）

### PsyPost（二次。原文で未確認）

- 「For these two specific variables [love and commitment], the total amount of affection was not more influential than the similarity between partners.」→ 7つの指標のうち「愛」と「献身」では総量の優位は出ていない。
- 相手への効果（partner effects）は、調べた指標の約半分で出た。

### sources.csv の今の値との違い

- 著者が2人になっている（正しくは Floyd, van Raalte, Hesse の3人）。
- 「141組、一時点の調査」は発表どおり（一時点かどうかは発表に明記がなく、性格の質問紙で測った横断と読める。原文で要確認）。
- 「つり合いの効果は小さい」は発表の言い方とずれる。発表は「総量の方がつり合いより強く関係の良さと結びつく」。愛・献身では総量の優位が出ていない（二次）。

### 直した値の案

- 発行元・著者：`Floyd, van Raalte, Hesse（Communication Studies）`
- 値：`米国の異性カップル141組（282人、交際6か月〜48年）の質問紙。愛情表現は2人のつり合いより総量の方が、満足度など関係の良さと強く結びつく（愛と献身では総量の優位は出ず：二次）`
- 表・ページ：`大学の発表（本文は未読）`
- メモ：`WSUの発表で確認（2026-10-05、クラウド）。論文の要旨・本文は出版社がブロックで未読。相関で、因果と言わない。doi:10.1080/10510974.2025.2610244`

---

## S11 Carlson, Miller, Rudd 2020（Socius）

読んだもの：要旨（Crossref と Semantic Scholar の書誌に載った要旨。両方同じ文）。**本文は読めず**（journals.sagepub.com はネットワークでブロック。オープンアクセスの論文だが落とせなかった）。

### 原文の値

- **題**：「Division of Housework, Communication, and Couples' Relationship Satisfaction」（Socius 6。2020）
- 要旨：「Using data on N = 487 couples from the 2006 Marital and Relationship Survey, the authors examine the association of heterosexual partners' communication quality with the division of housework and the role of partners' communication quality in the association between the division of housework and relationship satisfaction. Results from instrumental variable models and Actor-Partner Interdependence Models indicate that the quality of women's communication with their male partners predicts how couples divide housework. The quality of men's communication with their female partners, however, appears to be an outcome of domestic arrangements. Men's communication quality mediates the association between the division of housework and women' relationship satisfaction, while women's communication quality confounds the association for men.」
- **公平感（fairness）は要旨に出てこない。** 本文で公平感を測っているかは未確認。

### sources.csv の今の値との違い

- 題が「要確認」→ 上の題。
- 「家事の分担の公平感と関係の質」→ **要旨は公平感の話ではなく、会話の質の話。** 台本の「家事は量より公平感」の出典としては合わない。公平感を言うなら別の論文を探す（★またはオーナーの判断）。

### 直した値の案

- 調査・論文名：`Division of Housework, Communication, and Couples' Relationship Satisfaction`
- 発行元・著者：`Carlson, Miller, Rudd（Socius 6）`
- 値：`米国487組（2006 Marital and Relationship Survey）。家事の分担と妻の満足度の関係は、夫の会話の質を通して表れる（媒介）。妻の会話の質は家事の分け方を予測する`
- 表・ページ：`要旨（本文は未読）`
- メモ：`要旨で確認（2026-10-05、クラウド）。公平感は要旨になく、「家事は量より公平感」の出典には使えない。本文はsagepubがブロックで未読。doi:10.1177/2378023120924805`

---

## S12 Twenge, Campbell, Foster 2003（JMF）と Mitnick ほか 2009

読んだもの：要旨（Crossref の書誌に載った出版社の要旨。Mitnick は Semantic Scholar の書誌の要旨）。本文は読めず（Mitnick は PMC2812012 にあるが、取り出せなかった）。

### 原文の値

- Twenge 2003 要旨：「This meta-analysis finds that parents report lower marital satisfaction compared with nonparents (d=−.19, r=−.10). There is also a significant negative correlation between marital satisfaction and number of children (d=−.13, r=−.06). The difference in marital satisfaction is most pronounced among mothers of infants (38% of mothers of infants have high marital satisfaction, compared with 62% of childless women). For men, the effect remains similar across ages of children. The effect of parenthood on marital satisfaction is more negative among high socioeconomic groups, younger birth cohorts, and in more recent years.」
  - **47,692人は今回の要旨に出てこない**（Crossref の要旨は短い版）。人数は本文か別の版の要旨で要確認。
  - 巻・号・ページ：65(3), 574–583（Crossref）。
- Mitnick, Heyman, Smith Slep 2009 要旨：「This meta-analysis aggregates data from 37 studies that track couples from pregnancy to after the birth of the first child and 4 studies that track childless newlywed couples over time and compare couples who do and do not become parents. Results indicate significant, small declines in relationship satisfaction for both men and women from pregnancy to 11-months post-birth; five studies that followed couples for 12–14 months found moderate-sized declines. ... the four studies following newlyweds indicated that those who do not become parents experience a similar decrease in relationship satisfaction as parents do across a comparable span of time.」
  - 書誌：Journal of Family Psychology 23(6), 848–852、doi:10.1037/a0017004（Crossref で確認）。効果量の数値は要旨になし。

### sources.csv の今の値との違い

- d = −0.19 は一致。47,692人は今回読めた要旨では確かめられなかった。
- メモの「子のいない夫婦も同じ期間で下がる（Mitnick ほか 2009）」は要旨どおり（4研究）。

### 直した値の案

- 値：`親の方が結婚満足度が低いが差は小さい（d=−0.19）。乳児の母親で満足度が高いのは38%、子のいない女性は62%`
- 表・ページ：`p.574（要旨）`
- メモ：`要旨で確認（2026-10-05、クラウド）。47,692人は本文で要確認。子のいない新婚も同じ期間で同じくらい下がる（Mitnick ほか 2009、新婚の4研究。JFP 23(6) 848–852、doi:10.1037/a0017004）`

---

## S13 明治安田生命「いい夫婦の日」に関するアンケート調査 2025

読んだもの：発表の PDF（https://www.meijiyasuda.co.jp/profile/news/release/2025/pdf/20251119_02.pdf、全20ページ）。

### 原文の値

- 調査（p.5）：20〜79歳の既婚男女、全国、2025年10月8日〜10月20日、インターネット調査、**有効回答 1,620人**（男女×20〜70代 各135人の割り付け）。
- 円満かどうか（p.10）：「夫婦仲が円満」（「円満である」34.1%＋「まあ円満である」44.3%）＝ 78.4%。どちらともいえない 14.3%、あまり円満でない 3.5%、円満でない 3.8%。
- **会話時間**（p.11、「Ｑ．夫婦の会話時間を教えてください」の表。平均は0分を含む）：
  - 平日：全体 125分、円満である計 **141分**、円満でない計 **26分**
  - 休日：全体 232分、円満である計 **266分**、円満でない計 **50分**
  - 表の下：「平日で１１５分、休日で２１６分の差が！！」
- 本文の書き方（p.2・p.10）：「“夫婦仲が円満”な人の休日１日あたりの会話時間は、約４時間３０分だが、“夫婦仲が円満でない“人は約５０分と、５倍以上もの開きが」。→ 表の266分は4時間26分。
- 同じ発表の家事（p.2）：共働き世帯で、円満な夫婦の81.3%が「配偶者の家事に満足」、円満でない人は26.8%。

### sources.csv の今の値との違い

- 「幸せと答えた夫婦」→ 質問は **「夫婦仲が円満か」**。幸せは聞いていない。
- 「約4時間30分」は本文の丸めで、表の値は266分（4時間26分）。「約50分」は表の50分と一致。
- 「円満でない」は全体の7.3%（3.5%＋3.8%）。1,620人の7.3%は約118人（こちらでの計算）で、比べる片方の人数が少ない。
- 表・ページが「要確認」→ p.11 の表（要約は p.2、p.10）。

### 直した値の案

- 値：`休日の夫婦の会話（1日、平均）：夫婦仲が円満と答えた人266分（約4時間30分）、円満でないと答えた人50分。平日は141分と26分`
- 単位：`分／日`
- 表・ページ：`p.11（夫婦の会話時間の表）、要約p.2・p.10、調査概要p.5`
- メモ：`発表PDFで確認（2026-10-05、クラウド）。20〜79歳の既婚男女1,620人のネット調査（各年代・男女で同数の割り付け）。「幸せ」ではなく「円満」を聞いている。円満でないは全体の7.3%（約118人、こちらで計算）。どちらが原因かは分からない`
