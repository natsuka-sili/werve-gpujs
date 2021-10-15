// const { GPU } = require('gpu.js')

const ElectricField = require('sotuken_js/src/models/electric_field.js')

const canvas = document.getElementById('verve')

const gpu = new GPU()
const gpuCanvas = new GPU({ canvas: canvas })

const a = new ElectricField(300, 300)
a.createTemplate(gpu)
a.displayOutput(gpuCanvas)
