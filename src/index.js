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
a.setElectricCharge(width / 4, -2 * height / 9, 1)
a.setElectricCharge(0, 0, -1)

const move = () => {
  a.superposeElectricField(gpu)
  a.convertPolarElectricField(gpu)
  a.renderR(gpuCanvas)
  a.calcCoulombForce()
  a.sumCoulombForce()
  a.calcPositions()
  requestAnimationFrame(move)
}
setTimeout(function () { move() }, 2000)
