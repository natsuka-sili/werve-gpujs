// canvasの定義
const canvas = document.getElementById('verve')
// gpuJSの定義
// canvasエレメントなし
const gpu = new GPU()
// canvasエレメントあり
const gpuCanvas = new GPU({ canvas: canvas })

const fhdWidth = 1920
const fhdHeight = 1080

const electricConstant = 9 * Math.pow(10, 9)

// 1[C]の電荷による電界テンプレートの作成 : 入力なし
const makeElectricFieldTemplate = gpu.createKernel(function () {
  // 4FHDの中心に電荷を配置するために(-1920,-1080)を足す
  // 10[px]=1[meter]にする為10で割る
  const x = (this.thread.x - this.constants.w) / 10
  const y = (this.thread.y - this.constants.h) / 10
  // 電荷からの距離の-2乗
  const ri = 1 / (x * x + y * y)
  // 1[C]の電荷による電界値
  const k = this.constants.k * Math.sqrt(ri * ri * ri)
  // const k = this.constants.k*Math.pow(ri , 3/2);
  return [k * y, k * x]
}, {
  // 定数の受け渡し
  constants: { k: electricConstant, w: fhdWidth, h: fhdHeight },
  // 1[C]の電荷による電界値を4FHDの各点で計算
  output: [2 * fhdWidth + 1, 2 * fhdHeight + 1]
})

// (x,y)に電界テンプレートの中心を設定して(1920,1080)の配列を作成
const makeElectricField = gpu.createKernel(function (template, x, y) {
  const h = this.constants.h
  const w = this.constants.w
  const xa = this.thread.x
  const ya = this.thread.y
  return [template[h - y + ya][w - x + xa][0], template[h - y + ya][w - x + xa][1]]
}, {
  constants: { w: fhdWidth, h: fhdHeight },
  output: [fhdWidth, fhdHeight]
})

// makeElectricFieldで作った(1920,1080)の配列を複数個足す このままだと複数個の配列を入力できないので三重配列にするなり考える必要がある
const overlapElectricField = gpu.createKernel(function (electricField1, electricField2) {
  const xa = this.thread.x
  const ya = this.thread.y
  return [electricField1[ya][xa][0] + electricField2[ya][xa][0], electricField1[ya][xa][1] + electricField2[ya][xa][1]]
}, {
  output: [fhdWidth, fhdHeight]
})

// canvasへ配列を表示
const render = gpuCanvas.createKernel(function (board) {
  const xa = this.thread.x
  const ya = this.thread.y
  const b0 = board[ya][xa][0]
  const b1 = board[ya][xa][1]
  // 値の変化がわかる範囲(0->255)に落とす
  const color = Math.sqrt(b0 * b0 + b1 * b1) * this.constants.k
  this.color(
    // Red値
    color,
    // Green値
    color,
    // Blue値
    color,
    // Alpha値
    1
  )
}, {
  // 定数の受け渡し
  constants: { k: 1000 / electricConstant },
  // 設定したいcanvasサイズに出力
  output: [fhdWidth, fhdHeight],
  // 表示させる関数として認識
  graphical: true
})

const eTemplate = makeElectricFieldTemplate()
const e1 = makeElectricField(eTemplate, 500, 800)
const e2 = makeElectricField(eTemplate, 1600, 300)
const E = overlapElectricField(e1, e2)

render(E)
