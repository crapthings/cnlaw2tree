const fs = require('fs')
const _ = require('lodash')
const synonyms = require('node-synonyms')

const stopwords = fs.readFileSync('./stopwords.txt', { encoding: 'utf-8' }).split('\n')

const txt = fs.readFileSync('./sample.txt', { encoding: 'utf-8' })

const test = async () => {
  let words = await synonyms.seg(txt, false, false)
  words = _.chain(words)
    .filter(word => _.isNaN(parseInt(word)))
    .reject(word => word.length < 2)
    .reject(word => /^第[零一二三四五六七八九十百千万]+?/.test(word))
    .reject(word => /^[零一二三四五六七八九十百千万]+?/.test(word))
    .reject(word => _.includes(stopwords, word))
    .countBy()
    .map((value, keyword) => ({ keyword, value }))
    .orderBy(['value'], ['desc'])
    .take(10)
    .value()

  let keywords = []

  for (const word of words) {
    try {
      let nearby = await synonyms.nearby(word.keyword)
      nearby = _.zip(nearby[0], nearby[1])
      nearby = _.reject(nearby, ([w, r]) => {
        if (r == 1) return true
        if (r < 0.5) return true
      })
      _.each(nearby, ([w, r]) => {
        keywords.push(w)
      })
    } catch (ex) {
      console.log(ex)
      continue
    }
  }

  keywords = _.chain(keywords).flatten().value()
  log(words)
  console.log(keywords)
  console.log(keywords.length)
}

test()

function log(ctx) {
  console.log(JSON.stringify(ctx, null, 2))
}
