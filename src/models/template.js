const { GPU } = require('gpu.js')
const gpu = new GPU()

class Template {
  constructor (xs, ys) {
    this.xs = xs
    this.ys = ys
  }

  createTemplate () {
    this.buffer = []
    for (let i = 0; i < this.ys; i++) {
      const x = []
      for (let j = 0; j < this.xs; j++) {
        x.push(i + j)
      }
      this.buffer.push(x)
    }
    console.log(this.buffer)
  }
};

module.exports = Template
