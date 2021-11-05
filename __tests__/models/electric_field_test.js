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
  })

  test('オブジェクトが生成できること', () => {
    expect(a).not.toBe(null)
  })

  test('電荷が配置できること', () => {
    a = new ElectricField(4, 4)
    a.setElectricCharge(1, 0, 2)
    a.setElectricCharge(-2, 1, -1)

    expect(a.charge[0]).toEqual([1, 0, 0, 0, 2])
    expect(a.charge[1]).toEqual([-2, 1, 0, 0, -1])
  })

  test('電界のテンプレートが作られること', () => {
    a = new ElectricField(4, 4)
    a.setElectricCharge(1, 0, 2)
    a.setElectricCharge(-2, 1, -1)
    a.calcElectricFieldTemplate(gpu)

    const k = 9E+9
    const ansX = [-3.0, -2.0, -1.0, 0.0, 1.0, 2.0, 3.0].map(y => [-3.0, -2.0, -1.0, 0.0, 1.0, 2.0, 3.0].map(x => k * x / Math.sqrt((x * x + y * y) * (x * x + y * y) * (x * x + y * y))))
    const ansY = [-3.0, -2.0, -1.0, 0.0, 1.0, 2.0, 3.0].map(y => [-3.0, -2.0, -1.0, 0.0, 1.0, 2.0, 3.0].map(x => k * y / Math.sqrt((x * x + y * y) * (x * x + y * y) * (x * x + y * y))))
    ansX[3][3] = 0.0
    ansY[3][3] = 0.0
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        expect(a.template_electric_field_x[i][j]).toBeCloseTo(Math.abs(ansX[i][j]), -4)
        expect(a.template_electric_field_y[i][j]).toBeCloseTo(Math.abs(ansY[i][j]), -4)
      }
    }
  })

  test('電界の重ね合わせができること', () => {
    a = new ElectricField(3, 3)
    a.setElectricCharge(0, 1, 1)
    a.setElectricCharge(0, 1, 1)
    a.template_electric_field_x = [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [11, 12, 13, 14, 15], [16, 17, 18, 19, 20], [21, 22, 23, 24, 25]]
    a.template_electric_field_y = [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [11, 12, 13, 14, 15], [16, 17, 18, 19, 20], [21, 22, 23, 24, 25]]
    a.superposeElectricField(gpu)
    console.log(a.template_electric_field_x)
    console.log(a.electric_field_x)

    const k = 9E+9
    const ansX1 = [0.0, 1.0, 2.0, 3.0, 4.0].map(y => [-1.0, 0.0, 1.0, 2.0, 3.0].map(x => k * x / Math.sqrt((x * x + y * y) * (x * x + y * y) * (x * x + y * y))))
    const ansX2 = [-3.0, -2.0, -1.0, 0.0, 1.0].map(y => [0.0, 1.0, 2.0, 3.0, 4.0].map(x => k * x / Math.sqrt((x * x + y * y) * (x * x + y * y) * (x * x + y * y))))
    ansX1[0][1] = 0
    ansX2[3][0] = 0
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        expect(a.electric_field_x[i][j]).toBeCloseTo(Math.abs(ansX1[i][j] + ansX2[i][j]), -4)
      }
    }
  })
  /*
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
    console.log(a.buffer_x)
    a.plusTemplate(gpu, template, -2, -1)
    a.convertAbsPhase(gpu)
    expect(a.buffer_x).toEqual([new Float32Array([1, Math.sqrt(2), Math.sqrt(5)]), new Float32Array([0, 1, 2]), new Float32Array([1, Math.sqrt(2), Math.sqrt(5)])])
    expect(a.buffer_y).toEqual([new Float32Array([-Math.PI / 2, -Math.PI / 4, Math.atan(-1 / 2)]), new Float32Array([0, 0, 0]), new Float32Array([Math.PI / 2, Math.PI / 4, Math.atan(1 / 2)])])
    console.log(a.buffer_x)
  })

  test('表示されていること', () => {
    a.fillZero()
    a.createTemplate(gpu, 0, 0, 1)
    a.displayOutput(gpuCanvas)
  })

  // ############################################################# //

  test('電荷の設置ができること', () => {
    a.setElectricCharge(1, 4, 7)
    expect(a.charge[0]).toEqual([1, 4, 7])
    a.setElectricCharge(7, -3, 0.5)
    expect(a.charge[1]).toEqual([7, -3, 0.5])
  })

  test('電界を配列に入れられていること', () => {
    const k = 9E+9
    const ansX1 = [-2.0, -1.0, 0.0, 1.0, 2.0].map(y => [-2.0, -1.0, 0.0, 1.0, 2.0].map(x => k * x / Math.sqrt((x * x + y * y) * (x * x + y * y) * (x * x + y * y))))
    const ansY1 = [-2.0, -1.0, 0.0, 1.0, 2.0].map(y => [-2.0, -1.0, 0.0, 1.0, 2.0].map(x => k * y / Math.sqrt((x * x + y * y) * (x * x + y * y) * (x * x + y * y))))
    ansX1[2][2] = 0.0
    ansY1[2][2] = 0.0

    const ansX2 = [-2.0, -1.0, 0.0, 1.0, 2.0].map(y => [-2.0, -1.0, 0.0, 1.0, 2.0].map(x => 4 * k * x / Math.sqrt((x * x + y * y) * (x * x + y * y) * (x * x + y * y))))
    const ansY2 = [-2.0, -1.0, 0.0, 1.0, 2.0].map(y => [-2.0, -1.0, 0.0, 1.0, 2.0].map(x => 4 * k * y / Math.sqrt((x * x + y * y) * (x * x + y * y) * (x * x + y * y))))
    ansX2[2][2] = 0.0
    ansY2[2][2] = 0.0

    a.setElectricCharge(2.5, 2.5, 1)
    a.setElectricCharge(2.5, 2.5, 4)

    a.calcElectricField(gpu)
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        expect(a.electric_field_x[0][i][j] / 100000).toBeCloseTo(ansX1[i][j] / 100000, 1)
        expect(a.electric_field_y[0][i][j] / 100000).toBeCloseTo(ansY1[i][j] / 100000, 1)
        expect(a.electric_field_x[1][i][j] / 100000).toBeCloseTo(ansX2[i][j] / 100000, 1)
        expect(a.electric_field_y[1][i][j] / 100000).toBeCloseTo(ansY2[i][j] / 100000, 1)
      }
    }
  })

  test('重ね合わせができていること', () => {
    a.setElectricCharge(0, 0, 1)
    a.setElectricCharge(0, 0, 1)

    a.electric_field_x.push([-1.0, 0.0, 1.0].map(y => new Float32Array([0.0, 1.0, 2.0].map(x => x))))
    a.electric_field_y.push([-1.0, 0.0, 1.0].map(y => new Float32Array([0.0, 1.0, 2.0].map(x => y))))
    a.electric_field_x.push([-1.0, 0.0, 1.0].map(y => new Float32Array([0.0, 1.0, 2.0].map(x => x))))
    a.electric_field_y.push([-1.0, 0.0, 1.0].map(y => new Float32Array([0.0, 1.0, 2.0].map(x => y))))

    a.superposeElectricField(gpu)
    expect(a.all_electric_field_x).toEqual([-2.0, 0.0, 2.0].map(y => new Float32Array([0.0, 2.0, 4.0].map(x => x))))
    expect(a.all_electric_field_y).toEqual([-2.0, 0.0, 2.0].map(y => new Float32Array([0.0, 2.0, 4.0].map(x => y))))
  })

  test('極座標変換でがきていること', () => {
    a.all_electric_field_x = [-2.0, -1.0, 0.0, 1.0, 2.0].map(y => [-2.0, -1.0, 0.0, 1.0, 2.0].map(x => x))
    a.all_electric_field_y = [-2.0, -1.0, 0.0, 1.0, 2.0].map(y => [-2.0, -1.0, 0.0, 1.0, 2.0].map(x => y))
    a.convertPolar(gpu)
    console.log(a.all_electric_field_x)
    console.log(a.all_electric_field_y)
    console.log(a.all_electric_field_r)
    expect(a.all_electric_field_r).toEqual([new Float32Array([1, Math.sqrt(2), Math.sqrt(5)]), new Float32Array([0, 1, 2]), new Float32Array([1, Math.sqrt(2), Math.sqrt(5)])])
    expect(a.all_electric_field_theta).toEqual([new Float32Array([-Math.PI / 2, -Math.PI / 4, Math.atan(-1 / 2)]), new Float32Array([0, 0, 0]), new Float32Array([Math.PI / 2, Math.PI / 4, Math.atan(1 / 2)])])
  }) */
})
