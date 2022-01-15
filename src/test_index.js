import { GPU } from 'gpu.js'
import './test_index.scss'
import { Charge } from './models/charge.js'
import { ElectricField } from './models/electric-field.js'
import { clear, Render, RenderCircle, RenderForce } from './models/render.js'
// ####################
let dark = false
// if (window.matchMedia('(prefers-color-scheme: dark)').matches === true) {
//   dark = true
// } else {
//   dark = false
// }
console.log(dark)
// ####################
// const inputElem = document.getElementById('range');
const currentValueElem = document.getElementById('rangeV')
const setCurrentValue = (val) => {
  currentValueElem.innerText = 'charge : ' + val
}
const rangeOnChange = (e) => {
  setCurrentValue(e.target.value)
}
window.onload = () => {
  inputElem.addEventListener('input', rangeOnChange)
  setCurrentValue(inputElem.value)
}
// ####################
const canvas = document.getElementById('canvas')
const gpu = new GPU()
const gpuCanvas = new GPU({ canvas: canvas })
const width = 300
const height = 300
canvas.width = width
canvas.height = height

const test = document.getElementById('canvas2')
const ctx = test.getContext('2d')
test.width = 2 * width
test.height = 2 * height

// canvas.style.border = '1px solid'
// test.style.border = '1px solid'

let radio = '1'
document.getElementsByName('radio').forEach(
  r => r.addEventListener('change',
    e => (radio = e.target.value))
)

// const simulation = document.getElementById('simulation')
// simulation.addEventListener('change', () => {
//   if (simulation.checked) {
//     // document.getElementById('simulationL').innerText = 'stop'
//     cancelAnimationFrame(callback)
//     simulate()
//   } else {
//     // document.getElementById('simulationL').innerText = 'start'
//     cancelAnimationFrame(callback)
//   }
// })
const time = document.getElementById('time')
const render1 = document.getElementById('norm')

const render2 = document.getElementById('vector')

const render5 = document.getElementById('force')

const inputElem = document.getElementById('range')
/*
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
*/

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
//
function canvasTouchstart (a) {
  const touch = a.changedTouches[0]
  const rect = touch.target.getBoundingClientRect()
  const viewX = touch.clientX - rect.left
  const viewY = touch.clientY - rect.top
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
function canvasTouchend () {
  c.moveEndCharge()
}
function canvasTouchmove (a) {
  // a.preventDefault()
  if (Number(inputElem.value) !== 0 && radio === '4' && c.move.includes(true) === true) {
    const touch = a.changedTouches[0]
    const rect = touch.target.getBoundingClientRect()
    const viewX = touch.clientX - rect.left
    const viewY = touch.clientY - rect.top
    const scaleWidth = canvas.clientWidth / width
    const scaleHeight = canvas.clientHeight / height
    const canvasX = Math.floor(viewX / scaleWidth)
    const canvasY = Math.floor(viewY / scaleHeight)
    mouseX = canvasX
    mouseY = canvasY
  }
}

test.addEventListener('touchmove', function (a) {
// document.addEventListener('touchmove', function (a) {
  a.preventDefault()
}, { passive: false })

test.addEventListener('touchstart', canvasTouchstart, false)
test.addEventListener('touchmove', canvasTouchmove, false)
document.addEventListener('touchend', canvasTouchend, false)
test.addEventListener('mousedown', canvasMousedown, false)
test.addEventListener('mousemove', canvasMousemove, false)
document.addEventListener('mouseup', canvasMouseup, false)

// let callback
let render3 = true
function simulate () {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches === true) {
    dark = true
  } else {
    dark = false
  }
  if (c.l === 0) {
    e.render0Kernel(kernelRender0, dark)
    clear(width, height, ctx)
    // callback = requestAnimationFrame(simulate)
    requestAnimationFrame(simulate)
  } else {
    e.superposeElectricFieldKernel(kernelSuperposeElectricFieldFirst, kernelSuperposeElectricField, c)
    e.convertPolarElectricFieldKernel(kernelconvertPolarElectricFieldR, kernelconvertPolarElectricFieldTheta)
    if (time.checked) {
      c.calcCoulombForce(e.electric_field_x, e.electric_field_y)
    }

    if (render1.checked) {
      e.renderRKernel(kernelRenderR, dark)
      render3 = true
    } else if (render3) {
      e.render0Kernel(kernelRender0, dark)
      render3 = false
    }

    if (render2.checked) {
      clear(width, height, ctx)
      Render(width, height, e.electric_field_r, e.electric_field_theta, ctx, dark)
      RenderCircle(height, c, ctx, dark)
      if (render5.checked) {
        RenderForce(height, c, ctx)
      }
    } else if (render5.checked) {
      clear(width, height, ctx)
      RenderCircle(height, c, ctx, dark)
      RenderForce(height, c, ctx)
    } else {
      clear(width, height, ctx)
    }

    if (time.checked) {
      c.calcPositions(width, height, mouseX, height - mouseY)
    }

    // callback = requestAnimationFrame(simulate)
    requestAnimationFrame(simulate)
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
