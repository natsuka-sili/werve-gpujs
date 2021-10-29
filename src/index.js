import { GPU } from 'gpu.js'
import { ElectricField } from './models/electric_field.js'

const canvas = document.getElementById('verve')

const gpu = new GPU()
const gpuCanvas = new GPU({ canvas: canvas })

// ######################################################### //

const a = new ElectricField(400, 400)
a.createTemplate(gpu, 0, 0, 1)

console.log('A = ', a.buffer_x)

const b = new ElectricField(400, 400)
b.createTemplate(gpu, 200, 100, 3)

console.log('B = ', b.buffer_y)

const c = new ElectricField(400, 400)
c.createTemplate(gpu, -80, -150, 5)

a.plusTemplate(gpu, b, 0, 0)
a.plusTemplate(gpu, c, 0, 0)

console.log('C = ', a.buffer_x)

a.convertAbsPhase(gpu)
a.displayOutput(gpuCanvas)

console.log('D = ', a.buffer_x)

// ######################################################### //

const e = new ElectricField(400, 400)
e.setElectricCharge(0, 0, 1)
e.setElectricCharge(200, 100, 3)
e.setElectricCharge(-80, -150, 5)
e.calcElectricField(gpu)

console.log('A = ', e.electric_field_x[0])
console.log('B = ', e.electric_field_y[1])

e.superposeElectricField(gpu)

console.log('C = ', e.all_electric_field_x)

e.convertPolar(gpu)

console.log('D = ', e.all_electric_field_r)

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
