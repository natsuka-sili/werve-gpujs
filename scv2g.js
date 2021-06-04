//canvasの定義
const canvas = document.getElementById("verve");
//gpuJSの定義
  //canvasエレメントなし
const gpu = new GPU();
  //canvasエレメントあり
const gpuCanvas = new GPU({canvas: canvas});

const fhdWidth = 1920;
const fhdHeight = 1080;

//k=1/(4*pi*epsilon0)=8.98755179*10^9[m/F]->9*10^9[m/F]
const electricConstant = 9 * Math.pow(10, 9);


//1[C]の電荷による電界テンプレートの作成 : 入力なし
const makeElectricFieldTemplate = gpu.createKernel(function() {
  //4FHDの中心に電荷を配置するために(-1920,-1080)を足す
  //10[px]=1[meter]にする為10で割る
  const x = (this.thread.x - 1920)/10;
  const y = (this.thread.y - 1080)/10;
  //電荷からの距離の-2乗
  const ri = 1/(x*x + y*y);
  //1[C]の電荷による電界値
  return ri*this.constants.k;
}, {
  //定数の受け渡し
  constants: { k: electricConstant },
  //1[C]の電荷による電界値を4FHDの各点で計算
  output: [2*fhdWidth+1,2*fhdHeight+1]
});


//(x,y)に電界テンプレートの中心を設定して(1920,1080)の配列を作成
const makeElectricField = gpu.createKernel(function(template,x,y) {
});


//makeElectricFieldで作った(1920,1080)の配列を複数個足す
/*このままだと複数個の配列を入力できないので三重配列にするなり考える必要がある*/
const overlapElectricField = gpu.createKernel(function(electric_field) {
});


//canvasへ配列を表示
const render = gpuCanvas.createKernel(function(board) {
  //値の変化がわかる範囲(0->255)に落とす
  let color = board[this.thread.y][this.thread.x]*this.constants.k;
  this.color(
    //Red値
    color,
    //Green値
    color,
    //Blue値
    color,
    //Alpha値
    1
    );
}, {
  //定数の受け渡し
  constants: { k: 1000/electricConstant },
  //設定したいcanvasサイズに出力
  output: [fhdWidth,fhdHeight],
  //表示させる関数として認識
  graphical:true
});


//実行
const template = makeElectricFieldTemplate();
render(template);