import { GPU } from 'gpu.js'
import { ElectricField } from './models/electric_field.js'

const canvas = document.getElementById('verve')

const gpu = new GPU()
const gpuCanvas = new GPU({ canvas: canvas })

const a = new ElectricField(200, 200)
a.createTemplate(gpu)
a.convertAbsPhase(gpu)
a.displayOutput(gpuCanvas)
