const fs = require('fs')
const _ = require('lodash')
const synonyms = require('node-synonyms')
const tree = require('./')

const files = fs.readFileSync('./example.txt', { encoding: 'utf-8' })

// const nodesToIndentText = new tree(files, { indentText: true })
// const nodesToTree = new tree(files)

const list = tree(files, { flat: true })

async function test() {
  const newlist = []
  for (let i=0; i<list.length;i++) {
    const item = list[i]
    let keywords = await synonyms.seg(item._text, false, false)
    keywords = _.chain(keywords).uniq().reject(item => item.length < 2).value()
    let similar = []
    for (let keyword of keywords) {
      try {
        const nearby = await synonyms.nearby(keyword)
        similar.push(nearby[0])
      } catch (ex) {
        continue
      }
    }
    similar = _.chain(similar).flatten().uniq().value()
    newlist.push({
      keywords,
      similar,
      ...item,
    })
    console.log(item._text)
  }
  fs.writeFileSync('./test.json', JSON.stringify(newlist, null, 2))
}

test()

// fs.writeFileSync('./result.txt', nodesToIndentText)
// fs.writeFileSync('./result.json', JSON.stringify(nodesToTree, null, 2))
