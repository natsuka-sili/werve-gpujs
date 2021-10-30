import { GPU } from 'gpu.js'
import { ElectricField } from './models/electric_field.js'

const canvas = document.getElementById('canvas')

const gpu = new GPU()
const gpuCanvas = new GPU({ canvas: canvas })

const e = new ElectricField(400, 400)
e.calcElectricField(gpu)
e.setElectricCharge(0, 0, 1)
e.setElectricCharge(-100, 100, 2)
e.setElectricCharge(200, -50, 1)
e.superposeElectricField(gpu)
e.convertPolar(gpu)
e.renderR(gpuCanvas)
console.log(e)

/*
#####################
#####################
#####################
#####################
#####################
#####################
#####################
#####################
*/

const canvas2 = document.getElementById('canvas2')
const gpuCanvas2 = new GPU({ canvas: canvas2 })

const a = new ElectricField(400, 400)
a.createTemplate(gpu, 0, 0, 1)
const b = new ElectricField(400, 400)
b.createTemplate(gpu, 0, 0, 2)
const c = new ElectricField(400, 400)
c.createTemplate(gpu, 100, 50, 1)
a.plusTemplate(gpu, b, -100, 100)
a.plusTemplate(gpu, c, 100, -100)
a.convertAbsPhase(gpu)
a.displayOutput(gpuCanvas2)

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
