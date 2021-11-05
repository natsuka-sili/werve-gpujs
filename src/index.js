import { GPU } from 'gpu.js'
import { ElectricField } from './models/electric_field.js'

const canvas = document.getElementById('canvas')

const gpu = new GPU()
const gpuCanvas = new GPU({ canvas: canvas })

const width = 200
const height = 200

const a = new ElectricField(width, height)
a.calcElectricFieldTemplate(gpu)
a.setElectricCharge(-width / 4, height / 3, 1)
a.setElectricCharge(width / 4, -height / 3, 1)
a.setElectricCharge(0, 0, 1)
const move = () => {
  a.superposeElectricField(gpu)
  a.convertPolarElectricField(gpu)
  a.renderR(gpuCanvas)
  console.log(a.charge[0][0], a.charge[0][2], a.charge[1][0], a.charge[1][2], ' ', a.charge[0][1], a.charge[0][3], a.charge[1][1], a.charge[1][3])
  a.calcCoulombForce()
  a.sumCoulombForce()
  a.calcPositions()
  requestAnimationFrame(move)
}
setTimeout(function () { move() }, 2000)

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

/*
const e = new ElectricField(width, height)
e.calcElectricFieldTemplate(gpu)
e.setElectricCharge(0, 0, 1)
e.setElectricCharge(-width / 4, width / 4, 2)
e.setElectricCharge(width / 2, -width / 8, 3)
e.setElectricCharge(-width / 2, -width / 2, 4)
e.superposeElectricField(gpu)
e.convertPolarElectricField(gpu)
e.renderR(gpuCanvas)
e.calcCoulombForce()
e.convertPolarCoulombForce()
e.sumCoulombForce()
*/

/*
const canvas2 = document.getElementById('canvas2')
const gpuCanvas2 = new GPU({ canvas: canvas2 })

const a = new ElectricField(400, 400)
a.createTemplate(gpu, 0, 0, 1)
const b = new ElectricField(400, 400)
b.createTemplate(gpu, 0, 0, 2)
const c = new ElectricField(400, 400)
c.createTemplate(gpu, 100, 50, 3)
a.plusTemplate(gpu, b, -100, 100)
a.plusTemplate(gpu, c, 100, -100)
a.convertAbsPhase(gpu)
a.displayOutput(gpuCanvas2)
*/

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
