const _ = require('lodash')
const indent2obj = require('indent2obj')
const traverse = require('traverse')

indent2obj.keys = {
  name: "_text",
  children: "children"
}

module.exports = function (file, options = {}) {
  const REGEX0 = /(^第[零一二三四五六七八九十百]+?[条])|(^（[零一二三四五六七八九十百]+?）)|(^\([零一二三四五六七八九十百]+?\))/
  const REGEX1 = /(^第[零一二三四五六七八九十百]+?[章节条])|(^（[零一二三四五六七八九十百]+?）)|(^\([零一二三四五六七八九十百]+?\))/
  const REGEX2 = /(^第[零一二三四五六七八九十百]+?([章节条]))/
  const REGEX3 = /(^（[零一二三四五六七八九十百]+?）)|(^\([零一二三四五六七八九十百]+?\))/

  const REGEX4 = /(^第[零一二三四五六七八九十百]+?[章节])(.+)/

  const nodes = _.chain(file)
    .split('\n')
    .reject(_.isEmpty)
    .map(node => _.trim(node.replace(/\s/g, '')))
    .map(node => _.chain(node).split(REGEX0).reject(_.isEmpty).value())
    .flatten()
    .value()

  const firstMatchedNode = _.find(nodes, node => REGEX1.test(node))
  const firstMatchedMark = _.get(firstMatchedNode.match(REGEX2), '2')

  let startIndent, extraIndent = false
  let nodeIndentPath = []

  _.each(nodes, (node, nodeIdx) => {
    if (REGEX1.test(node)) {
      let mark

      if (REGEX3.test(node)) {
        mark = '（）'
      } else {
        mark = _.get(node.match(REGEX2), '2')
      }

      if (_.includes(['章', '节', '条'], mark)) {
        startIndent = true
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

      nodes[nodeIdx] = '  '.repeat(nodeIndentPath.length - 1) + node
    } else {
      if (REGEX3.test(_.trim(nodes[nodeIdx - 2])) && /。$/.test(_.trim(node))) {
        nodeIndentPath = _.reject(nodeIndentPath, item => _.includes(item, '（）'))
      }

      if (startIndent) {
        nodes[nodeIdx] = '  '.repeat(nodeIndentPath.length) + node
      }
    }
  })

  if (options.indentText) {
    return nodes.join('\n')
  } else {

    const parse1 = traverse(indent2obj(nodes.join('\n'))).map(function(node) {
      if (this.notLeaf && _.isPlainObject(node) && REGEX4.test(node._text)) {
        const parsed = node._text.match(REGEX4)
        this.update({
          mark: parsed[1],
          subject: parsed[2],
          ...node,
        })
      }
    })

    const parse2 = traverse(parse1).map(function(node) {
      if (_.isPlainObject(node)) {
        this.update({
          parentMark: findParentMark({ ctx: this }),
          ...node,
        })
      }
    })

    return parse2
  }

  function findParentMark({ ctx }) {
    if (!ctx.parent) return
    const isPlainObject = _.isPlainObject(_.get(ctx, 'parent.node'))
    const mark = _.get(ctx, 'parent.node.mark')
    if (isPlainObject && mark) {
      return mark
    } else {
      return findParentMark({ ctx: _.get(ctx, 'parent') })
    }
  }
}

