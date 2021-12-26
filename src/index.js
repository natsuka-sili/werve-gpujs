import { GPU } from 'gpu.js'
import './index.css'
import { Charge } from './models/charge.js'
import { ElectricField } from './models/electric-field.js'
import { clear, Render, RenderCircle, RenderForce } from './models/render.js'

const canvas = document.getElementById('canvas')
const gpu = new GPU()
const gpuCanvas = new GPU({ canvas: canvas })
const width = 300
const height = 300
canvas.width = width
canvas.height = height

const test = document.getElementById('test_arrow')
const ctx = test.getContext('2d')
test.width = 2 * width
test.height = 2 * height
// test.width = width
// test.height = height

let radio = '1'
document.getElementsByName('radio').forEach(
  r => r.addEventListener('change',
  // e => console.log('change:' + e.target.value)
    e => (radio = e.target.value))
)

const simulation = document.getElementById('simulation')
simulation.addEventListener('change', () => {
  if (simulation.checked) {
    // document.getElementById('simulationL').innerText = 'stop'
    cancelAnimationFrame(callback)
    simulate()
  } else {
    // document.getElementById('simulationL').innerText = 'start'
    cancelAnimationFrame(callback)
  }
})
const time = document.getElementById('time')
const render1 = document.getElementById('render1')

const render2 = document.getElementById('render2')

const render5 = document.getElementById('render5')

const inputElem = document.getElementById('example')
const currentValueElem = document.getElementById('current-value')
const setCurrentValue = (val) => {
  currentValueElem.innerText = Math.round(val * 10 / 3) // 無理やり-10~10にしている
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
  if (Number(inputElem.value) !== 0 && radio === '1') {
    c.setCharge([canvasX, height - canvasY, Number(inputElem.value)])
  }
  if (radio === '2') {
    c.deleteCharge(canvasX, height - canvasY)
  }
  if (radio === '3') {
    c.fixCharge(canvasX, height - canvasY)
  }
}
test.addEventListener('click', canvasClick, false)

let mouseX
let mouseY
function canvasMousedown (a) {
  const rect = a.target.getBoundingClientRect()
  const viewX = a.clientX - rect.left
  const viewY = a.clientY - rect.top
  const scaleWidth = canvas.clientWidth / width
  const scaleHeight = canvas.clientHeight / height
  const canvasX = Math.floor(viewX / scaleWidth)
  const canvasY = Math.floor(viewY / scaleHeight)
  mouseX = canvasX
  mouseY = canvasY
  if (Number(inputElem.value) !== 0 && radio === '4') {
    c.moveBeginCharge(canvasX, height - canvasY)
  }
}
function canvasMouseup () {
  c.moveEndCharge()
}
test.addEventListener('mousedown', canvasMousedown, false)
document.addEventListener('mouseup', canvasMouseup, false)
function canvasMousemove (a) {
  if (Number(inputElem.value) !== 0 && radio === '4' && c.move.includes(true) === true) {
    const rect = a.target.getBoundingClientRect()
    const viewX = a.clientX - rect.left
    const viewY = a.clientY - rect.top
    const scaleWidth = canvas.clientWidth / width
    const scaleHeight = canvas.clientHeight / height
    const canvasX = Math.floor(viewX / scaleWidth)
    const canvasY = Math.floor(viewY / scaleHeight)
    mouseX = canvasX
    mouseY = canvasY
  }
}
test.addEventListener('mousemove', canvasMousemove, false)

let callback
let render3 = true
function simulate () {
  if (c.l === 0) {
    e.render0Kernel(kernelRender0)
    clear(width, height, ctx)
    callback = requestAnimationFrame(simulate)
  } else {
    e.superposeElectricFieldKernel(kernelSuperposeElectricFieldFirst, kernelSuperposeElectricField, c)
    e.convertPolarElectricFieldKernel(kernelconvertPolarElectricFieldR, kernelconvertPolarElectricFieldTheta)
    if (time.checked) {
      c.calcCoulombForce(e.electric_field_x, e.electric_field_y)
    }

    if (render1.checked) {
      e.renderRKernel(kernelRenderR)
      render3 = true
    } else if (render3) {
      e.render0Kernel(kernelRender0)
      render3 = false
    }

    if (render2.checked) {
      clear(width, height, ctx)
      Render(width, height, e.electric_field_r, e.electric_field_theta, ctx)
      RenderCircle(height, c, ctx)
      if (render5.checked) {
        RenderForce(height, c, ctx)
      }
    } else if (render5.checked) {
      clear(width, height, ctx)
      RenderCircle(height, c, ctx)
      RenderForce(height, c, ctx)
    } else {
      clear(width, height, ctx)
    }

    if (time.checked) {
      c.calcPositions(width, height, mouseX, height - mouseY)
    }

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
const kernelRender0 = gpuCanvas.createKernel(e.render0Gpu).setOutput([height, width]).setGraphical(true)

simulate()
