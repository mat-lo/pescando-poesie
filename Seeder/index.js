const fs = require("fs")
const filter = "Alba"
const drops = ["alba", "l'alba", "sull'alba"]
const vowels = ["a", "e", "i", "o", "u"]

fs.readFile("source.txt", "utf8", function (err, data) {
  if (err) throw err

  const sentences = data.split("$")
  const filtered = sentences.filter(function (str) {
    return str.includes(filter) === false
  })
  const rest = sentences.filter(function (str) {
    return str.includes(filter)
  })

  const synthetics = []

  filtered.map((sentence, i) => {
    const words = sentence.split(" ")
    // console.log(words)
    // remove short final words
    // [TODO] remove last word recursively
    if (words[words.length - 1].length < 3) words.pop()

    // remove sentences not ending with vowel
    // [TODO] remove last word recursively
    if (!isVowelAtLastCharacter(words[words.length - 1])) words.pop()

    const drop = drops[Math.floor(Math.random() * drops.length)]
    words.splice(1 + Math.floor(Math.random() * (words.length - 1)), 0, drop)
    const newSentence = words.join(" ")
    synthetics.push(newSentence)
  })

  const all = [...synthetics, ...rest]

  const output = all.join("\r\n")

  fs.writeFile("out.txt", output, function (err) {
    if (err) return console.log(err)
  })
})

const isVowelAtLastCharacter = (str) => {
  const lastChar = str.charAt(str.length - 1)
  return vowels.includes(lastChar)
}

// sentences.forEach((sentence, i) => {
//   console.log(sentence)
// })

// fs.writeFile("zpl.txt", zpl, function (err) {
//   if (err) return console.log(err)
// })
