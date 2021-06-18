const request = require('request')
request('https://cdn.jsdelivr.net/npm/gpu.js@latest/dist/gpu-browser.min.js')
const gpu = new GPU()

class Template {
  constructor (xs, ys) {
    this.xs = xs
    this.ys = ys
    this.buffer = [[], [], [], [], []]
  }
};

module.exports = Template
