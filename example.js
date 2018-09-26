const fs = require('fs')
const indent2obj = require('indent2obj')
const tree = require('./')

const nodes = tree(fs.readFileSync('./example.txt', { encoding: 'utf-8' }), { indentText: true })

fs.writeFileSync('./result.txt', nodes)
fs.writeFileSync('./result.json', JSON.stringify(indent2obj(nodes), null, 2))
