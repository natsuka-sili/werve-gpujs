// __test__/models/template_test.js
/* eslint-disable no-alert, no-console, no-undef */

const Template = require('sotuken_js/src/models/template.js')

describe('Template', () => {
  let a
  beforeEach(() => {
    a = new Template(5, 5)
  })

  test('オブジェクトが生成できること', () => {
    expect(a).not.toBe(null)
  })

  test('値が正しく計算されること', () => {
    a.createTemplate()
    expect(a.buffer).toEqual([[0, 1, 2, 3, 4], [1, 2, 3, 4, 5], [2, 3, 4, 5, 6], [3, 4, 5, 6, 7], [4, 5, 6, 7, 8]])
  })
})
