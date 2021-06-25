const { GPU } = require('gpu.js')
const gpu = new GPU()

class Template {
  constructor (xs, ys) {
    this.xs = xs
    this.ys = ys
  }

  createTemplate (a) {
    this.buffer = [[], [], [], [], []]
  }
};

module.exports = Template
