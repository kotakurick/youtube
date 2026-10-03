// webpack の require.context（エピソードのフォルダを自動で読み込むのに使う）
declare const require: {
  context: (dir: string, sub: boolean, re: RegExp) => { keys(): string[]; (key: string): any };
};
