// 年齢で相手を選ぶと、何歳の誰が相手不足になるか（人口の男女の数だけで見る単純なモデル）。
// males[i]・females[j] は年齢の区分ごとの人数（国勢調査の未婚者数など）。allowed(i, j) は「男性 i の区分が女性 j の区分を相手にするか」、
// order(i) は男性 i が相手を探す区分の順（例：自分と同じ年から下へ）。上の年齢の区分から順に、相手の残っている区分で組にしていく。
// 仮定（誰が先に選ぶか・好みの順）で結果は変わるので、仮定は画面に出す。
export type AgeMatch = { pairs: number[][]; maleLeft: number[]; femaleLeft: number[] };

export const ageMatch = (
  males: number[], females: number[], order: (i: number) => number[], allowed: (i: number, j: number) => boolean = () => true,
): AgeMatch => {
  const fl = [...females], ml = [...males];
  const pairs = males.map(() => females.map(() => 0));
  for (let i = males.length - 1; i >= 0; i--) {
    for (const j of order(i)) {
      if (!allowed(i, j) || j < 0 || j >= fl.length) continue;
      const n = Math.min(ml[i], fl[j]);
      pairs[i][j] += n; ml[i] -= n; fl[j] -= n;
      if (!ml[i]) break;
    }
  }
  return { pairs, maleLeft: ml, femaleLeft: fl };
};
