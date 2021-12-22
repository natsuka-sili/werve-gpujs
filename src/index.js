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
test.width = width
test.height = height

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
test.addEventListener('click', canvasClick, false)

let callback
let render3 = true
function simulate () {
  if (c.l === 0) {
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
      clear(ctx)
      Render(width, height, e.electric_field_r, e.electric_field_theta, ctx)
      RenderCircle(height, c, ctx)
      if (render5.checked) {
        RenderForce(height, c, ctx)
      }
    } else if (render5.checked) {
      clear(ctx)
      RenderCircle(height, c, ctx)
      RenderForce(height, c, ctx)
    } else {
      clear(ctx)
    }

    if (time.checked) {
      c.calcPositions(width, height)
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
