const fs = require('fs')
const tree = require('./')

const files = fs.readFileSync('./example.txt', { encoding: 'utf-8' })

const nodesToIndentText = tree(files, { indentText: true })
const nodesToTree = tree(files)

fs.writeFileSync('./result.txt', nodesToIndentText)
fs.writeFileSync('./result.json', JSON.stringify(nodesToTree, null, 2))
