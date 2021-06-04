//初期化
const canvas = document.getElementById("lifegame");
canvas.width = 3841;
canvas.height = 2161;
const gpu = new GPU({canvas: canvas , mode: 'gpu'});

//処理
const start1 = performance.now();
const life = gpu.createKernel(function(board) {
//10pixel　= 1meterにする為10で割る 
//真ん中に電荷を置く事を想定
  const x = (this.thread.x - 1920)/10;
  const y = (this.thread.y - 1080)/10;
  let sum = 0;
  const r = x*x + y*y;
  const ri = 1/r;
  const k = 9 * Math.pow(10, 9);
//電荷1Cの時の各点での大きさを出力
  return ri*k;
}, {
//(s/10)*(s/10)meter^2の枠で出力
//sizeって定数があったけどlifegameではなくて使わないので削除
  output: [3841,2161]
}); 
const time1 = performance.now() - start1;
//
//
//
//
//
//
//
//
//描画用
const start2 = performance.now();
const render = gpu.createKernel(function(board) {
  const k = 9 * Math.pow(10, 9);
//上で求めた電界をそのまま出力すると全てが1以上となり真っ白になるので適当な数で割って見えやすくした。
  this.color(
    board[this.thread.y][this.thread.x]*50/k,
    board[this.thread.y][this.thread.x]*50/k,
    board[this.thread.y][this.thread.x]*50/k,
    1
    );
}, {
  output: [3841,2161],
  graphical:true
});
const time2 = performance.now() - start2;

//盤面を作る
const start3 = performance.now();
let board = [0];
board = life(board);
render(board);
const time3 = performance.now() - start3

document.write("<p>GPU</br>関数作成 処理 : " + time1 + " ms</br>関数作成 描画 : " + time2 + " ms</br>関数利用 表示 : " + time3 + " ms</p>");