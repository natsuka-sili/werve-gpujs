import { GPU } from 'gpu.js'
import { ElectricField } from './models/electric_field.js'

const canvas = document.getElementById('verve')

const gpu = new GPU()
const gpuCanvas = new GPU({ canvas: canvas })

// ######################################################### //

const a = new ElectricField(400, 400)
a.createTemplate(gpu, 0, 0, 1)

const b = new ElectricField(400, 400)
b.createTemplate(gpu, 200, 100, 3)

const c = new ElectricField(400, 400)
c.createTemplate(gpu, 0, 0, 5)

a.plusTemplate(gpu, b, 0, 0)
a.plusTemplate(gpu, c, -80, -150)

a.convertAbsPhase(gpu)
a.displayOutput(gpuCanvas)

console.log('a.buffer_x = ', a.buffer_x)
console.log('a.buffer_y = ', a.buffer_y)

// ######################################################### //

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
