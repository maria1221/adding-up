'use strict';
// Node.jsに用意されたモジュールを呼び出す
const fs = require('fs');
const readline = require('readline');
// popu-pref.csvファイルからファイルの読み込みを行うStreamを生成、さらにそれをreadlineオブジェクトのinputとして設定し、rlオブジェクトを作成する
const rs = fs.createReadStream('./popu-pref.csv');
const rl = readline.createInterface({ input: rs, output: {} });
// 集計されたデータを格納する連想配列
const prefectureDataMap = new Map(); // key: 都道府県 value: 集計データのオブジェクト

// rlオブジェクトでlineというイベントが発生したら、この無名関数を呼んでください、という意味
rl.on('line', lineString => {
//   console.log(lineString);
// 2010 年と 2015 年の際の集計年、都道府県、15〜19 歳の人口をコンソール上に出力する
//  引数lineStringで与えられた文字列をカンマで分割して、それをcolumnsという名前の配列にする
// ["集計年","都道府県名","10〜14歳の人口","15〜19歳の人口"] といった配列になる
const columns = lineString.split(',');
// 配列columnsの要素へ並び順の番号でアクセスし、集計年(0番目)、都道府県(1番目)、15～19歳の人口(3番目)をそれぞれ変数に保存
// parseInt()　文字列を整数値に変換する関数
//  lineString.split() は、文字列を対象とした関数のため、結果も文字列の配列になっている。元々集計年や人口は数値のため文字列から数値へ変換して比較した時に不都合が生じないようにする
const year = parseInt(columns[0]);
const prefecture = columns[1];
const popu = parseInt(columns[3]);
if (year === 2010 || year === 2015) {
//   console.log(year);
//   console.log(prefecture);
//   console.log(popu);

// 連想配列prefectureDataMapからデータを取得。valueの値がFalsyの場合valueに初期値となるオブジェクトを代入する
let value = prefectureDataMap.get(prefecture);
if (!value) {
  value = {
    popu10: 0, // 2010年の人口
    popu15: 0, // 2015年の人口
    change: null //人口の変化率
  };
}
// 人口のデータを連想配列に保存。連想配列に格納したため次から同じ県のデータが来たときは、let value = ...の所では保存したオブジェクトが取得される
if (year === 2010) {
  value.popu10 = popu;
}
if (year === 2015) {
  value.popu15 = popu;
}
prefectureDataMap.set(prefecture, value);
}
});
// closeイベント　全ての行が読み込み終わった際に呼び出される
rl.on('close', () => {
    // for-of構文　Map や Array の中身を of の前で与えられた変数に代入することで、for ループと同じ処理をする
    for (const [key, value] of prefectureDataMap) {
        value.change = value.popu15 / value.popu10;
      }
    //Array.from(prefectureDataMap) 連想配列を普通の配列に変換する処理
    // 比較関数　sort関数に渡す関数のこと。これにより並び替えをするルールを決められる
    const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
        return pair2[1].change - pair1[1].change;
    });
    //   console.log(rankingArray);
    // console.log(prefectureDataMap);

    // map巻数　連想配列のMapとは別物。Arrayの要素それぞれを、与えられた関数を適用した内容に変換する。配列.map(関数);の形で使う配列の組み込み関数(メソッド)
    // Map の キーと値が要素になった配列を要素 [key, value] として受け取り、それを文字列に変換する処理
    const rankingStrings = rankingArray.map(([key, value]) => {
        return (
          key +
          ': ' +
          value.popu10 +
          '=>' +
          value.popu15 +
          ' 変化率:' +
          value.change
        );
      });
      console.log(rankingStrings);
  });