import { GPU } from 'gpu.js'
import { ElectricField } from './models/electric_field.js'

const canvas = document.getElementById('canvas')
const canvas2 = document.getElementById('canvas2')

const gpu = new GPU()
const gpuCanvas = new GPU({ canvas: canvas })
const gpuCanvas2 = new GPU({ canvas: canvas2 })

const width = 200
const height = 200

const a = new ElectricField(width, height)
a.calcElectricFieldTemplate(gpu)
a.renderTemplate(gpuCanvas2)
a.setElectricCharge(50, 50, 1)
a.setElectricCharge(150, 150, 1)
a.setElectricCharge(40, 180, 1)

/*
const move = () => {
  a.superposeElectricField(gpu)
  a.convertPolarElectricField(gpu)
  a.renderR(gpuCanvas)
  a.calcCoulombForce()
  a.sumCoulombForce()
  a.calcPositions()
  requestAnimationFrame(move)
}
setTimeout(function () { move() }, 1000)
*/

a.superposeElectricField(gpu)
a.convertPolarElectricField(gpu)
a.renderR(gpuCanvas)
a.calcCoulombForce()
a.sumCoulombForce()
a.calcPositions()
a.calcSumCoulombForce()
console.log(a.template_electric_field_x)
