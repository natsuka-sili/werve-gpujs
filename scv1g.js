//canvasの定義
const canvas = document.getElementById("verve");
//gpuJSの定義
  //canvasエレメントなし
const gpu = new GPU();
  //canvasエレメントあり
const gpuCanvas = new GPU({canvas: canvas});


//1[C]の電荷による電界テンプレートの作成
const makeTemplate = gpu.createKernel(function(board) {
  //4FHDの中心に電荷を配置するために(-1920,-1080)を足す
  //10[px]=1[meter]にする為10で割る
  const x = (this.thread.x - 1920)/10;
  const y = (this.thread.y - 1080)/10;
  //電荷からの距離の-2乗
  const ri = 1/(x*x + y*y);
  //k=1/(4*pi*epsilon0)=8.98755179*10^9[m/F]->9*10^9[m/F]
  const k = 9 * Math.pow(10, 9);
  //1[C]の電荷による電界値
  return ri*k;
}, {
  //1[C]の電荷による電界値を4FHDの各点で計算
  output: [3841,2161]
});


//canvasへ配列を表示
const render = gpuCanvas.createKernel(function(board) {
  //k=1/(4*pi*epsilon0)=8.98755179*10^9[m/F]->9*10^9[m/F]
  const k = 9 * Math.pow(10, 9);
  //値の変化がわかる範囲(0->255)に落とす
  this.color(
    //Red値
    board[this.thread.y][this.thread.x]*50/k,
    //Green値
    board[this.thread.y][this.thread.x]*50/k,
    //Blue値
    board[this.thread.y][this.thread.x]*50/k,
    //Alpha値
    1
    );
}, {
  //設定したいcanvasサイズに出力
  output: [1920,1080],
  //表示させる関数として認識
  graphical:true
});


//盤面の定義と初期化
let board = [0];


//実行
render(makeTemplate(board));
