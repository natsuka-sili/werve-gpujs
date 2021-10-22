import { ElectricField } from './models/electric_field.js'
import { GPU } from 'gpu.js'

const canvas = document.getElementById('verve')

const gpu = new GPU()
const gpuCanvas = new GPU({ canvas: canvas })

const a = new ElectricField(800, 800)
a.createTemplate(gpu)
a.convertAbsPhase(gpu)
a.displayOutput(gpuCanvas)
