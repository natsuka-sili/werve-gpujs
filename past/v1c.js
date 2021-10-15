//初期化
const canvas = document.getElementById("lifegame");
const gpu = new GPU({canvas: canvas ,  mode: 'cpu'});

//s=200
//処理
const life = gpu.createKernel(function(board) {
//10pixel　= 1meterにする為10で割る 
//真ん中に電荷を置く事を想定しているので-200して原点を移している
  const x = (this.thread.x - 200)/10;
  const y = (this.thread.y - 200)/10;
  const r = x*x + y*y;
  const ri = 1/r;
  const k = 9 * Math.pow(10, 9);
//電荷1Cの時の各点での大きさを出力
  return ri*k;
}, {
//(s/10)*(s/10)meter^2の枠で出力
//sizeって定数があったけどlifegameではなくて使わないので削除
  output: [400,400]
}); 

//
//
//
//
//
//
//
//
//描画用
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
  output: [400,400],
  graphical:true
});

//盤面を作る
let board = [0];


board = life(board);
render(board);