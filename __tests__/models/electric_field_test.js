// __test__/models/template_test.js
/* eslint-disable no-alert, no-console, no-undef */

import { GPU } from 'gpu.js'
import { ElectricField } from '../../src/models/electric_field.js'

describe('ElectricField', () => {
  let a
  let gpu
  let gpuCanvas
  beforeEach(() => {
    gpu = new GPU()
    gpuCanvas = new GPU()
    a = new ElectricField(3, 3)
  })

  test('オブジェクトが生成できること', () => {
    expect(a).not.toBe(null)
  })

  test('電荷の設置ができること', () => {
    a.setElectricCharge(1, 4, 7)
    expect(a.charge[0]).toEqual([1, 4, 7])
    a.setElectricCharge(7, -3, 0.5)
    expect(a.charge[1]).toEqual([7, -3, 0.5])
  })

  test('値が正しく計算されること', () => {
    const k = 9E+9
    const ansX = [-2.0, -1.0, 0.0, 1.0, 2.0].map(y => [-2.0, -1.0, 0.0, 1.0, 2.0].map(x => k * x / Math.sqrt((x * x + y * y) * (x * x + y * y) * (x * x + y * y))))
    const ansY = [-2.0, -1.0, 0.0, 1.0, 2.0].map(y => [-2.0, -1.0, 0.0, 1.0, 2.0].map(x => k * y / Math.sqrt((x * x + y * y) * (x * x + y * y) * (x * x + y * y))))
    ansX[2][2] = 0.0
    ansY[2][2] = 0.0
    a.createTemplate(gpu, 2.5, 2.5, 1)
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        expect(a.buffer_x[i][j] / 100000).toBeCloseTo(ansX[i][j] / 100000, 1)
        expect(a.buffer_y[i][j] / 100000).toBeCloseTo(ansY[i][j] / 100000, 1)
      }
    }
  })

  test('0配列を作成する', () => {
    a.fillZero()
    expect(a.buffer_x).toEqual(new Array(3).fill(new Array(3).fill(0.0)))
    expect(a.buffer_y).toEqual(new Array(3).fill(new Array(3).fill(0.0)))
  })

  test('重ね合わせができていること', () => {
    const template = new ElectricField(3, 3)
    template.buffer_x = [-2.0, -1.0, 0.0, 1.0, 2.0].map(y => [-2.0, -1.0, 0.0, 1.0, 2.0].map(x => x))
    template.buffer_y = [-2.0, -1.0, 0.0, 1.0, 2.0].map(y => [-2.0, -1.0, 0.0, 1.0, 2.0].map(x => y))
    a.fillZero()
    a.plusTemplate(gpu, template, -2, -1)
    expect(a.buffer_x).toEqual([-1.0, 0.0, 1.0].map(y => new Float32Array([0.0, 1.0, 2.0].map(x => x))))
    expect(a.buffer_y).toEqual([-1.0, 0.0, 1.0].map(y => new Float32Array([0.0, 1.0, 2.0].map(x => y))))
  })

  test('極座標系に変換できていること', () => {
    a.fillZero()
    const template = new ElectricField(3, 3)
    template.buffer_x = [-2.0, -1.0, 0.0, 1.0, 2.0].map(y => [-2.0, -1.0, 0.0, 1.0, 2.0].map(x => x))
    template.buffer_y = [-2.0, -1.0, 0.0, 1.0, 2.0].map(y => [-2.0, -1.0, 0.0, 1.0, 2.0].map(x => y))
    a.plusTemplate(gpu, template, -2, -1)
    a.convertAbsPhase(gpu)
    expect(a.buffer_x).toEqual([new Float32Array([1, Math.sqrt(2), Math.sqrt(5)]), new Float32Array([0, 1, 2]), new Float32Array([1, Math.sqrt(2), Math.sqrt(5)])])
    expect(a.buffer_y).toEqual([new Float32Array([-Math.PI / 2, -Math.PI / 4, Math.atan(-1 / 2)]), new Float32Array([0, 0, 0]), new Float32Array([Math.PI / 2, Math.PI / 4, Math.atan(1 / 2)])])
  })

  test('表示されていること', () => {
    a.fillZero()
    a.createTemplate(gpu, 0, 0, 1)
    // console.log(a)
    a.displayOutput(gpuCanvas)
  })
})
