import { GPU } from 'gpu.js'
import { ElectricField } from './models/electric_field.js'

const canvas = document.getElementById('verve')

const gpu = new GPU()
const gpuCanvas = new GPU({ canvas: canvas })

// 普通に一枚表示する
const a = new ElectricField(400, 400)
a.createTemplate(gpu, 200, 200)
a.convertAbsPhase(gpu)
a.displayOutput(gpuCanvas)

// setInterval
// let i = 0
// setInterval(() => {
//   i++
//   const a = new ElectricField(500, 500)
//   a.createTemplate(gpu, i, 250 - i * 2)
//   a.convertAbsPhase(gpu)
//   a.displayOutput(gpuCanvas)
// }, 1000 / 30)

// requestAnimationFrame
// const move = () => {
//   const a = new ElectricField(500, 500)
//   a.createTemplate(gpu)
//   a.convertAbsPhase(gpu)
//   a.displayOutput(gpuCanvas)
//   requestAnimationFrame(move)
// }
// move()
