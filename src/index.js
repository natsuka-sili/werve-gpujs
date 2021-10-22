// const { GPU } = require('gpu.js')
// const ElectricField = require('./models/electric_field.js')
import { ElectricField } from './models/electric_field.js'

const canvas = document.getElementById('verve')

const gpu = new GPU()
const gpuCanvas = new GPU({ canvas: canvas })

const a = new ElectricField(1000, 1080)
a.createTemplate(gpu)
a.convertAbsPhase(gpu)
a.displayOutput(gpuCanvas)
