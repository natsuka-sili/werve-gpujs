import { GPU } from 'gpu.js'
import { Charge } from './models/charge.js'
import { ElectricField } from './models/electric_field.js'

const canvas = document.getElementById('canvas')
const gpu = new GPU()
const gpuCanvas = new GPU({ canvas: canvas })

const a = new ElectricField(200, 200)
a.calcElectricFieldTemplate(gpu)

console.log(a)
