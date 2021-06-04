//初期化
const canvas = document.getElementById("lifegame");
//canvas.width = 1920;
//canvas.height = 1080;
canvas.setAttribute( "width" , 1920 );
canvas.setAttribute( "height" , 1080 );

const gpu = new GPU({canvas: canvas});
const gpu2 = new GPU();


//処理
const life = gpu2.createKernel(function(board) {
//10pixel　= 1meterにする為10で割る 
//左下のFHDの真ん中に電荷を置く事を想定
  const x = (this.thread.x - 2*960)/10;
                           //1920
  const y = (this.thread.y - 2*540)/10;
                           //1080
  let sum = 0;
  const r = x*x + y*y;
  const ri = 1/r;
  const k = 9 * Math.pow(10, 9);
//電荷1Cの時の各点での大きさを出力
  return ri*k;
}, {
  output: [3841,2161]
  //output: [1920,1080]
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
  //output: [3841,2161],
  output: [1920,1080],
  graphical:true
});

//盤面を作る
let board = [0];

render(life(board));