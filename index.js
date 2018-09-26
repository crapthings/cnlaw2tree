const _ = require('lodash')
const indent2obj = require('indent2obj')

module.exports = function (file, options = {}) {
  const REGEX1 = /(^第[零一二三四五六七八九十百]+?[章节条])|(^（[零一二三四五六七八九十百]+?）)/
  const REGEX2 = /(^第[零一二三四五六七八九十百]+?([章节条]))/

  const nodes = _.chain(file)
    .split('\n')
    .reject(_.isEmpty)
    .map(node => _.trim(node.replace(/\s/g, '')))
    .map(node => _.chain(node).split(REGEX1).reject(_.isEmpty).value())
    .flatten()
    .value()

  const firstMatchedNode = _.find(nodes, node => REGEX1.test(node))
  const firstMatchedMark = _.get(firstMatchedNode.match(REGEX2), '2')

  let startIndent, extraIndent = false
  let nodeIndentPath = []

  _.each(nodes, (node, nodeIdx) => {
    if (REGEX1.test(node)) {
      let mark

      if (/^（/.test(node)) {
        mark = '（）'
      } else {
        mark = _.get(node.match(REGEX2), '2')
      }

      if (_.includes(['章', '节'], mark)) {
        startIndent = true
        extraIndent = true
      } else {
        extraIndent = false
      }

      const markIdx = _.findLastIndex(nodeIndentPath, p => p === mark)

      if (markIdx === -1) {
        nodeIndentPath.push(mark)
        if (mark === '（）') {
          nodeIndentPath.push(mark)
        }
      } else {
        nodeIndentPath = _.take(nodeIndentPath, markIdx + 1)
      }

      nodes[nodeIdx] = '  '.repeat(extraIndent ? nodeIndentPath.length - 1 : nodeIndentPath.length) + node
    } else {
      if (/(^（)/.test(_.trim(nodes[nodeIdx - 2])) && /。$/.test(_.trim(node))) {
        nodeIndentPath = _.reject(nodeIndentPath, item => _.includes(item, '（）'))
      }

      if (startIndent) {
        nodes[nodeIdx] = '  '.repeat(extraIndent ? nodeIndentPath.length: nodeIndentPath.length  + 1) + node
      }
    }
  })

  if (options.indentText) {
    return nodes.join('\n')
  }

  return indent2obj(nodes.join('\n'))
}
