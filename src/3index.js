import { GPU } from 'gpu.js'
import './style.css'
import { Charge } from './models/3charge.js'
import { ElectricField } from './models/3electric_field.js'
import { clear, Render, RenderCircle, RenderForce } from './models/3canvas_2d.js'

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
  if (simulation.checked === true) {
    // document.getElementById('simulationL').innerText = 'stop'
    cancelAnimationFrame(callback)
    simulate()
  } else {
    // document.getElementById('simulationL').innerText = 'start'
    cancelAnimationFrame(callback)
  }
})

const render1 = document.getElementById('render1')
/*
render1.addEventListener('change', () => {
  if (render1.checked === true) {
    document.getElementById('render1L').innerText = 'norm:off'
  } else {
    document.getElementById('render1L').innerText = 'norm:on'
  }
})
*/

const render2 = document.getElementById('render2')
/*
render2.addEventListener('change', () => {
  if (render2.checked === true) {
    document.getElementById('render2L').innerText = 'vector:off'
  } else {
    document.getElementById('render2L').innerText = 'vector:on'
  }
})
*/

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
let render3 = false
// let render4 = false
function simulate () {
  if (c.l === 0) {
    callback = requestAnimationFrame(simulate)
  } else {
    e.superposeElectricFieldKernel(kernelSuperposeElectricFieldFirst, kernelSuperposeElectricField, c)
    e.convertPolarElectricFieldKernel(kernelconvertPolarElectricFieldR, kernelconvertPolarElectricFieldTheta)
    c.calcCoulombForce(e.electric_field_x, e.electric_field_y)

    if (render1.checked === true) {
      e.renderRKernel(kernelRenderR)
      render3 = false
    } else if (render3 === false) {
      e.render0Kernel(kernelRender0)
      render3 = true
    }

    if (render2.checked === true) {
      clear(ctx)
      Render(width, height, e.electric_field_r, e.electric_field_theta, ctx)
      RenderCircle(height, c, ctx)
      // render4 = false
      if (render5.checked === true) {
        RenderForce(height, c, ctx)
        // render4 = false
      }
    } else if (render5.checked === true) {
      clear(ctx)
      RenderCircle(height, c, ctx)
      RenderForce(height, c, ctx)
      // render4 = false
    } else {
      clear(ctx)
      // render4 = true
    }

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

// ここで
// const context = canvas.getContext('2d')
// をするとcontextは定義されるがgpuが使えない

const kernelRenderR = gpuCanvas.createKernel(e.renderRGpu).setOutput([height, width]).setGraphical(true)
const kernelRender0 = gpuCanvas.createKernel(e.render0Gpu).setOutput([height, width]).setGraphical(true)

// ここで
// const context = canvas.getContext('2d')
// をするとcontext = nullとなり定義されない

simulate()
