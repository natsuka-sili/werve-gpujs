import { GPU } from 'gpu.js'
import { Charge } from './models/3charge.js'
import { ElectricField } from './models/3electric_field.js'

const test = document.getElementById('test_arrow')
const ctx = test.getContext('2d')

let i = 0
function drawArrowSaved () {
  i++
  ctx.clearRect(0, 0, 300, 300)
  function tri () {
    ctx.moveTo(-5, -3)
    ctx.lineTo(5, 0)
    ctx.lineTo(-5, 3)
    ctx.closePath()
  }
  function render (x, y) {
    ctx.save()
    ctx.translate(x - i % 123, y - i % 123)
    ctx.rotate(x / Math.sqrt(y) * i / 100)
    tri()
    ctx.restore()
  }
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let j = 0; j < 15; j++) {
    for (let k = 0; k < 15; k++) {
      render(j * 30, k * 30)
    }
  }
  ctx.stroke()
  requestAnimationFrame(drawArrowSaved)
}
drawArrowSaved()

const canvas = document.getElementById('canvas')
const gpu = new GPU()
const gpuCanvas = new GPU({ canvas: canvas })
const width = 300
const height = 300

const simulation = document.getElementById('simulation')
simulation.addEventListener('change', () => {
  if (simulation.checked === true) {
    document.getElementById('simulationL').innerText = 'stop'
    cancelAnimationFrame(callback)
    simulate()
  } else {
    document.getElementById('simulationL').innerText = 'start'
    cancelAnimationFrame(callback)
  }
})

const inputElem = document.getElementById('example')
const currentValueElem = document.getElementById('current-value')
const setCurrentValue = (val) => {
  currentValueElem.innerText = val
}
const rangeOnChange = (e) => {
  setCurrentValue(e.target.value)
}
window.onload = () => {
  inputElem.addEventListener('input', rangeOnChange)
  setCurrentValue(inputElem.value)
}

function canvasClick (a) {
  const rect = a.target.getBoundingClientRect()
  const viewX = a.clientX - rect.left
  const viewY = a.clientY - rect.top
  const scaleWidth = canvas.clientWidth / width
  const scaleHeight = canvas.clientHeight / height
  const canvasX = Math.floor(viewX / scaleWidth)
  const canvasY = Math.floor(viewY / scaleHeight)
  if (Number(inputElem.value) !== 0) {
    c.setElectricCharge([canvasX, height - canvasY, Number(inputElem.value)])
  }
}
canvas.addEventListener('click', canvasClick, false)

let callback
function simulate () {
  if (c.l === 0) {
    callback = requestAnimationFrame(simulate)
  } else {
    e.superposeElectricFieldKernel(kernelSuperposeElectricFieldFirst, kernelSuperposeElectricField, c)
    e.convertPolarElectricFieldKernel(kernelconvertPolarElectricFieldR, kernelconvertPolarElectricFieldTheta)
    e.renderRKernel(kernelRenderR)
    c.calcCoulombForce(e.electric_field_x, e.electric_field_y)
    c.calcPositions(width, height)
    callback = requestAnimationFrame(simulate)
  }
}

const e = new ElectricField(width, height)
e.calcElectricFieldTemplate(gpu)

const c = new Charge()

const kernelSuperposeElectricFieldFirst = gpu.createKernel(e.superposeElectricFieldFirstGpu).setConstants({ w: width, h: height }).setOutput([height, width])
const kernelSuperposeElectricField = gpu.createKernel(e.superposeElectricFieldGpu).setConstants({ w: width, h: height }).setOutput([height, width])
const kernelconvertPolarElectricFieldR = gpu.createKernel(e.convertPolarElectricFieldGpuR).setOutput([height, width])
const kernelconvertPolarElectricFieldTheta = gpu.createKernel(e.convertPolarElectricFieldGpuTheta).setOutput([height, width])
const kernelRenderR = gpuCanvas.createKernel(e.renderRGpu).setOutput([height, width]).setGraphical(true)

simulate()
