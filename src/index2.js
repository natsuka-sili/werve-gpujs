import { GPU } from 'gpu.js'
import { Charge } from './models/charge.js'

const canvas = document.getElementById('canvas')
const canvas2 = document.getElementById('canvas2')
const gpu = new GPU()
const gpuCanvas = new GPU({ canvas: canvas })
const gpuCanvas2 = new GPU({ canvas: canvas2 })
const width = 400
const height = 400

const a = new Charge(width, height)
a.calcElectricFieldTemplate(gpu)
a.renderTemplate(gpuCanvas2)
a.setElectricCharge(0, 0, 1)
a.setElectricCharge(99, 50, 1)
a.setElectricCharge(199, 25, 1)

const move = () => {
  a.superposeElectricField(gpu)
  a.convertPolarElectricField(gpu)
  a.calcCoulombForce()
  a.sumCoulombForce()
  a.calcPositions()
  console.log(a.charge)
  a.renderR(gpuCanvas)
  requestAnimationFrame(move)
}

const stop = () => {
  a.superposeElectricField(gpu)
  a.convertPolarElectricField(gpu)
  a.calcCoulombForce()
  a.sumCoulombForce()
  a.calcPositions()
  console.log(a.sum_force_x, a.sum_force_x2)
  a.renderR(gpuCanvas)
}

move()
