const fs = require("fs")
const filter = "Alba"
const drops = ["alba", "l'alba", "sull'alba"]
const vowels = ["a", "e", "i", "o", "u"]
const outPath = "./out.txt"

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
    const lastWord = words[words.length - 1]

    // remove short final words
    while (lastWord.length < 3 && words.length > 1) words.pop()
    // remove sentences not ending with vowel
    while (!isVowelAtLastCharacter(lastWord) && words.length > 1) words.pop()
    // pick a word to drop in casually 👀
    const drop = drops[Math.floor(Math.random() * drops.length)]
    words.splice(1 + Math.floor(Math.random() * (words.length - 1)), 0, drop)
    // join the new array in a sentence
    const newSentence = words.join(" ")
    // add it only if it's longer than 18 characters. No underages.
    if (newSentence.length > 18) synthetics.push(newSentence)
  })

  // chop the rest
  const percentage = 0.3
  const amount = ~~(rest.length * percentage)
  const scramble = shuffle(rest)
  const smol = scramble.slice(0, amount)

  // merge all
  const all = shuffle([...synthetics, ...smol])
  // join in a newline fashion
  const output = all.join("\r\n")

  // delete old file
  try {
    fs.unlinkSync(outPath)
    //file removed
  } catch (err) {
    console.error(err)
  }

  // generate new file
  fs.writeFile(outPath, output, function (err) {
    if (err) return console.log(err)
  })
})

// check for vowels
const isVowelAtLastCharacter = (str) => {
  if (str) {
    const lastChar = str.charAt(str.length - 1)
    return vowels.includes(lastChar)
  }
}

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--

    // And swap it with the current element.
    ;[array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ]
  }

  return array
}

// sentences.forEach((sentence, i) => {
//   console.log(sentence)
// })

// fs.writeFile("zpl.txt", zpl, function (err) {
//   if (err) return console.log(err)
// })
