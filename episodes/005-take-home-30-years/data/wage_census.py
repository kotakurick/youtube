"""賃金構造基本統計調査（厚生労働省）から、年齢階級別の賃金表を作る。

使い方:
    python episodes/005-take-home-30-years/data/wage_census.py [--raw <元ファイルの置き場>]

- 元ファイル（Excel・CSV）をダウンロードして --raw に置く（既定は $YT_DATA_DIR/wage_census、
  未設定なら _local/wage_census）。すでにあれば取り直さない。
- 結果を同じフォルダの wage_by_age.csv（BOM付きUTF-8）に書く。
- .xls（2019年以前と2020年のe-Statファイル）は LibreOffice（soffice）で .xlsx に変換して読む。
  soffice が無いときは xlrd があれば pandas で読む。どちらも無ければその年を飛ばして警告を出す。

元ファイル（取得日 2026-10-06）:
  e-Stat 賃金構造基本統計調査（政府統計コード 00450091）一般労働者 産業大分類 第1表
  「（学歴、）年齢階級別きまって支給する現金給与額、所定内給与額及び年間賞与その他特別給与額」産業計（民営事業所・企業規模計10人以上）
  URL は https://www.e-stat.go.jp/stat-search/file-download?statInfId=<ID>&fileKind=<K>
  1995年は e-Stat にファイルが無い（e-Stat は平成11年=1999年から）ため、
  労働政策研究・研修機構（JILPT）「労働統計データ検索システムで提供していたデータ」
  賃金構造基本統計調査 産業別（一般労働者）大分類 0101w.zip（厚労省の公表値を転載したCSV、2016年5月最終更新）を使う。
  https://www.jil.go.jp/kokunai/statistics/dbdata/wage/zip/0101w.zip
"""
import argparse, csv, io, os, re, shutil, ssl, subprocess, sys, unicodedata, urllib.request, zipfile
from pathlib import Path

ESTAT = "https://www.e-stat.go.jp/stat-search/file-download?statInfId={id}&fileKind={k}"
# (年, 系列, statInfId, fileKind, 拡張子, 表の名前)
FILES = [
    (2000, "旧推計", "000001256993", 0, "xls", "平成12年 第1表 産業計"),
    (2005, "旧推計", "000001256328", 0, "xls", "平成17年 第1表 産業計"),
    (2010, "旧推計", "000008278863", 0, "xls", "平成22年 第1表（産業計・産業別）"),
    (2010, "新推計(R2方式の遡及)", "000032111802", 4, "xlsx", "【参考掲載】令和2年と同じ推計方法による集計 平成22年 表番号1"),
    (2015, "旧推計", "000028996409", 0, "xls", "平成27年 第1表（産業計・産業別）"),
    (2015, "新推計(R2方式の遡及)", "000032110750", 4, "xlsx", "【参考掲載】令和2年と同じ推計方法による集計 平成27年 表番号1"),
    (2019, "旧推計", "000031919751", 0, "xls", "令和元年 第1表（産業計・産業別）"),
    (2019, "新推計(R2方式の遡及)", "000032110590", 4, "xlsx", "【参考掲載】令和2年と同じ推計方法による集計 令和元年 表番号1"),
    (2020, "新推計", "000032069350", 0, "xls", "令和2年 表番号1（産業計・産業別）"),
    (2024, "新推計", "000040247773", 4, "xlsx", "令和6年 表番号1（産業計・産業別）"),
    (2025, "新推計", "000040420843", 4, "xlsx", "令和7年 表番号1（産業計・産業別）"),
]
JILPT_ZIP = "https://www.jil.go.jp/kokunai/statistics/dbdata/wage/zip/0101w.zip"
JILPT_YEARS = [1995]  # e-Statに無い年だけ使う（2000〜2015はe-Statの値と一致することを確認済み）

AGES = ["20-24", "25-29", "30-34", "35-39", "40-44", "45-49", "50-54", "55-59"]
EDU = {"中卒": "中学", "中学卒": "中学", "中学": "中学", "高卒": "高校", "高校卒": "高校", "高校": "高校",
       "専門学校": "専門学校", "高専・短大卒": "高専・短大", "高専・短大": "高専・短大",
       "大卒": "大学・大学院", "大学・大学院卒": "大学・大学院", "大学": "大学", "大学院": "大学院", "不明": "不明", "学歴計": "学歴計"}


def norm(s):
    return re.sub(r"\s+", "", unicodedata.normalize("NFKC", str(s)))


def fetch(url, dest):
    if dest.exists() and dest.stat().st_size > 0:
        return
    ctx = ssl.create_default_context(cafile=os.environ.get("SSL_CERT_FILE") or os.environ.get("REQUESTS_CA_BUNDLE"))
    with urllib.request.urlopen(url, context=ctx, timeout=120) as r, open(dest, "wb") as f:
        shutil.copyfileobj(r, f)


def to_xlsx(path):
    if path.suffix == ".xlsx":
        return path
    out = path.with_suffix(".xlsx")
    if out.exists():
        return out
    soffice = shutil.which("soffice") or shutil.which("libreoffice")
    if soffice:
        subprocess.run([soffice, "--headless", "--convert-to", "xlsx", "--outdir", str(path.parent), str(path)],
                       check=True, capture_output=True, timeout=300)
        return out
    try:
        import pandas as pd
        with pd.ExcelWriter(out) as w:
            pd.read_excel(path, sheet_name=0, header=None).to_excel(w, header=False, index=False)
        return out
    except Exception as e:  # noqa
        print(f"警告: {path.name} を読めません（LibreOffice か xlrd が必要）: {e}", file=sys.stderr)
        return None


def parse_table1(path):
    """第1表の先頭シート（産業計）から、企業規模計の8列を（性, 学歴, 年齢）ごとに返す。"""
    import openpyxl
    ws = openpyxl.load_workbook(path, data_only=True, read_only=True).worksheets[0]
    rows = [list(r) for r in ws.iter_rows(values_only=True)]
    dc = next(j for r in rows for j, c in enumerate(r) if c is not None and norm(c) == "歳")  # 企業規模計の「年齢」列
    out, sex, edu = {}, None, "学歴計"
    for r in rows:
        labs = [norm(c) for c in r[:dc] if isinstance(c, str) and norm(c)]
        if not labs:
            continue
        lab = labs[-1]
        m = re.match(r"^(男女計|男性労働者|女性労働者|男|女|全労働者)(.*)$", lab)  # 「男学歴計」「男大学」のように性と学歴が1つのセルのこともある
        if m and (m.group(2) == "" or m.group(2) in EDU):
            sex = {"全労働者": "男女計", "男性労働者": "男", "女性労働者": "女"}.get(m.group(1), m.group(1))
            edu, age = EDU.get(m.group(2), "学歴計"), "計"
        elif lab in EDU:
            edu, age = EDU[lab], "計"
        elif re.search(r"\d", lab) and "~" in lab:
            a = re.findall(r"\d+", lab)
            age = "-".join(a) if len(a) == 2 else (a[0] + "-" if lab.index(a[0]) < lab.index("~") else "-" + a[0])
        else:
            continue
        v = r[dc:dc + 8]
        if sex is None or not isinstance(v[4], (int, float)):
            continue
        out.setdefault((sex, edu, age), dict(kimatte=v[4], shoteinai=v[5], bonus=v[6], n10=v[7]))
    return out


def parse_jilpt(zpath, years):
    z = zipfile.ZipFile(zpath)
    f = io.TextIOWrapper(z.open("0101w.csv"), encoding="cp932", errors="replace")
    rd = csv.reader(f)
    h = next(rd)
    item = {"きまって支給する現金給与額": "kimatte", "所定内給与額": "shoteinai",
            "年間賞与その他特別給与額": "bonus", "労働者数": "n10"}
    res = {y: {} for y in years}
    for row in rd:
        if row[4] != "産業計" or row[5] != "企業規模計" or row[3] not in item or any(row[9:17]):
            continue
        a = re.findall(r"\d+", unicodedata.normalize("NFKC", row[7]))
        age = "計" if row[7] == "年齢階級計" else ("-".join(a) if len(a) == 2 else None)
        if age is None:
            continue
        edu = EDU.get(row[8], row[8])
        for y in years:
            s = row[h.index(f"{y}年")]
            if s:
                res[y].setdefault((row[6], edu, age), {})[item[row[3]]] = float(s)
    return res


def main():
    ap = argparse.ArgumentParser()
    base = os.environ.get("YT_DATA_DIR") or "_local"
    ap.add_argument("--raw", default=str(Path(base) / "wage_census"))
    args = ap.parse_args()
    raw = Path(args.raw); raw.mkdir(parents=True, exist_ok=True)
    rows = []

    def add(year, series, src, d):
        for (sex, edu, age), v in sorted(d.items()):
            if age not in AGES + ["計"] or sex not in ("男", "女", "男女計"):
                continue
            if edu not in ("学歴計", "大学・大学院", "大学", "大学院"):
                continue
            if not all(isinstance(v.get(k), (int, float)) for k in ("kimatte", "shoteinai", "bonus")):
                continue
            rows.append(dict(year=year, series=series, sex=sex, education=edu, age=age,
                             kimatte=v["kimatte"], shoteinai=v["shoteinai"], bonus=v["bonus"],
                             annual_est=round(v["kimatte"] * 12 + v["bonus"], 1), workers_10=v.get("n10"), source=src))

    zp = raw / "jilpt_0101w.zip"; fetch(JILPT_ZIP, zp)
    for y, d in parse_jilpt(zp, JILPT_YEARS).items():
        add(y, "旧推計", "JILPT 0101w.csv（厚労省 賃金構造基本統計調査 公表値の転載） " + JILPT_ZIP, d)

    for y, series, sid, k, ext, name in FILES:
        url = ESTAT.format(id=sid, k=k)
        p = raw / f"estat_{sid}.{ext}"; fetch(url, p)
        x = to_xlsx(p)
        if x is None:
            continue
        d = parse_table1(x)
        # 令和2年以降は「大学」と「大学院」が別。過去と比べるため労働者数で重み付けして「大学・大学院」を作る
        for sex in ("男", "女", "男女計"):
            for age in AGES + ["計"]:
                a, b = d.get((sex, "大学", age)), d.get((sex, "大学院", age))
                if a and b and (sex, "大学・大学院", age) not in d and all(isinstance(t["n10"], (int, float)) for t in (a, b)):
                    n = a["n10"] + b["n10"]
                    d[(sex, "大学・大学院", age)] = {kk: round((a[kk] * a["n10"] + b[kk] * b["n10"]) / n, 1)
                                                for kk in ("kimatte", "shoteinai", "bonus")} | {"n10": n}
        add(y, series, f"e-Stat {name} statInfId={sid} {url}", d)

    out = Path(__file__).with_name("wage_by_age.csv")
    cols = ["year", "series", "sex", "education", "age", "kimatte", "shoteinai", "bonus", "annual_est", "workers_10", "source"]
    with open(out, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols); w.writeheader(); w.writerows(rows)
    print(f"{len(rows)} 行を書きました: {out}")


if __name__ == "__main__":
    main()
