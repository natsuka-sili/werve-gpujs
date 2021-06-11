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
  const x = (this.thread.x - this.constants.w)/10;
  const y = (this.thread.y - this.constants.h)/10;
  //電荷からの距離の-2乗
  const ri = 1/(x*x + y*y);
  //1[C]の電荷による電界値
  const k = this.constants.k;
  return [Math.pow(ri , 3/2)*y*k,Math.pow(ri , 3/2)*x*k];
}, {
  //定数の受け渡し
  constants: { k: electricConstant , w: fhdWidth , h: fhdHeight },
  //1[C]の電荷による電界値を4FHDの各点で計算
  output: [2*fhdWidth+1,2*fhdHeight+1]
});

/*
//(x,y)に電界テンプレートの中心を設定して(1920,1080)の配列を作成
const makeElectricField = gpu.createKernel(function(template,x,y) {
  const h = this.constants.h;
  const w = this.constants.w;
  const xa = this.thread.x;
  const ya = this.thread.y;
  return [template[h-y+ya][w-x+xa][0],template[h-y+ya][w-x+xa][1]];
}, {
  constants: { w: fhdWidth , h: fhdHeight },
  output: [fhdWidth,fhdHeight]
});
*/

//makeElectricFieldで作った(1920,1080)の配列を複数個足す
/*このままだと複数個の配列を入力できないので三重配列にするなり考える必要がある
const overlapElectricField = gpu.createKernel(function(electric_field1,electric_field2) {
  const xa = this.thread.x;
  const ya = this.thread.y;
  return [electric_field1[ya][xa][0]+electric_field2[ya][xa][0],electric_field1[ya][xa][1]+electric_field2[ya][xa][1]];
}, {
  output: [fhdWidth,fhdHeight]
});
*/

//canvasへ配列を表示
const render = gpuCanvas.createKernel(function(board) {
  const xa = this.thread.x;
  const ya = this.thread.y;
  //値の変化がわかる範囲(0->255)に落とす
  let color = Math.sqrt(board[ya][xa][0]*board[ya][xa][0]+board[ya][xa][1]*board[ya][xa][1])*this.constants.k;
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

//const x1 = 0;
//const y1 = 1080;
//const x2 = 1920/2;
//const y2 = 1080/2;
//const x3 = 1920;
//const y3 = 0;

//実行
//const template = makeElectricField(makeElectricFieldTemplate(),x1,y1);
//render(template);

//配列を作ってpushしていく事でn個の配列の重ね合わせに対応させる。下とかの例。
//const ef = [];
//ef.push(e1);

const e1 = makeElectricFieldTemplate();
//const e2 = makeElectricField(makeElectricFieldTemplate(),x2,y2);
//const e3 = makeElectricField(makeElectricFieldTemplate(),x3,y3);
//const E1 = overlapElectricField(e1,e2);
//const E2 = overlapElectricField(E1,e3);

render(e1);

//document.write("(x,y)=(",x1,",",y1,"),(",x2,",",y2,"),(",x3,",",y3,")")
