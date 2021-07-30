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
