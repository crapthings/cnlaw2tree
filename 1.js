const fs = require('fs')
const _ = require('lodash')
const stringSimilarity = require('string-similarity')

const PATTERN = /^第[零一二三四五六七八九十百]+[章节条]?|^[（(][零一二三四五六七八九十百]+[)）]|^[0-9零一二三四五六七八九十百]+、|^[零一二三四五六七八九十百]是/

async function main() {
  const txt1 = fs.readFileSync('./1.txt', { encoding: 'utf-8' })
  const txt2 = fs.readFileSync('./2.txt', { encoding: 'utf-8' })
  const test = stringSimilarity.compareTwoStrings(getNormalizedList(txt1).join('\n'), getNormalizedList(txt2).join('\n'))
  console.log(test)
}

main()

function getNormalizedList(txt) {
  return _.chain(txt).split('\n').reject(_.isEmpty).map(_.trim).value()
}
