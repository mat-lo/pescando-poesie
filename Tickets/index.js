const fs = require("fs")
const { readFile } = require("fs/promises")
const path = require("path")
const csv = require("fast-csv")
const p5 = require("node-p5")

const cbook = p5.loadFont({ path: "./fonts/cbook.otf", family: "CBook" })
const cbold = p5.loadFont({ path: "./fonts/cbold.otf", family: "CBold" })

const bannedChars = [".", ":", ",", ";"]

const txtToList = async (src) => {
  const result = await readFile(src, "utf8")
  const lines = result.split("\n")
  const newLines = []
  lines.forEach((line) => {
    if (bannedChars.some((v) => line.slice(-1) === v)) {
      line = line.slice(0, -1)
    }
    const lowerLine = lowerFirstLetter(line)
    newLines.push(lowerLine)
  })
  return newLines
}

const linesSrc = [
  "temp/hot",
  "temp/cold",
  "temp/mid",
  "loc/lago",
  "loc/mantova",
  "loc/lagodimezzo",
  "time/mattino",
  "time/mezzo",
  "time/notte",
  "time/sera",
  "misc",
]

const srcPromises = []
linesSrc.forEach((src) => {
  srcPromises.push(txtToList(`lines/${src}.txt`))
})

const lowerFirstLetter = (string) => {
  return string.charAt(0).toLowerCase() + string.slice(1)
}

const upperFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

const getRandomItem = (array) => {
  return array[~~(Math.random() * array.length)]
}

const getTimeVerse = (hours, lines) => {
  if (hours > 21 || hours <= 4) {
    return getRandomItem(lines.notte)
  }
  if (hours > 4 && hours <= 11) {
    return getRandomItem(lines.mattino)
  }
  if (hours > 11 && hours <= 17) {
    return getRandomItem(lines.mezzo)
  }
  if (hours > 17 && hours <= 21) {
    return getRandomItem(lines.sera)
  }
}

const getTempVerse = (temp, lines) => {
  if (temp < 10) {
    return getRandomItem(lines.cold)
  }
  if (temp > 15 && temp < 27) {
    return getRandomItem(lines.mid)
  }
  if (temp >= 27) {
    return getRandomItem(lines.hot)
  }
}

const getLocation = (lines) => {
  const r = Math.random()
  if (r < 0.33) {
    return getRandomItem(lines.lagodimezzo)
  }
  if (r < 0.66 && r >= 0.33) {
    return getRandomItem(lines.lago)
  }
  if (r >= 0.66) {
    return getRandomItem(lines.mantova)
  }
}

const getMisc = (lines) => {
  return getRandomItem(lines.misc)
}

const getVerses = (hours, TempAcqua, lines) => {
  const verses = []
  verses.push(getTimeVerse(hours, lines))
  verses.push(getTempVerse(TempAcqua, lines))
  if (Math.random() < Math.random()) {
    verses.push(getLocation(lines))
  } else {
    verses.push(getMisc(lines))
  }
  verses.push(getMisc(lines))
  while (Math.random() < 0.4 && verses.length < 7) {
    verses.push(getMisc(lines))
  }
  return shuffle(verses)
}

const shuffle = (array) => {
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

const generatePoemsTxt = (srcCsv, outPath, n) => {
  // read all the src files
  Promise.all(srcPromises).then((values) => {
    const lines = {
      hot: values[0],
      cold: values[1],
      mid: values[2],
      lago: values[3],
      mantova: values[4],
      lagodimezzo: values[5],
      mattino: values[6],
      mezzo: values[7],
      notte: values[8],
      sera: values[9],
      misc: values[10],
    }

    const rows = []

    fs.createReadStream(path.resolve(__dirname, "csv", srcCsv))
      .pipe(csv.parse({ headers: true }))
      .on("error", (error) => console.error(error))
      .on("data", (row) => {
        rows.push(row)
      })
      .on("end", (rowCount) => {
        console.log(`Parsed ${rowCount} rows`)
        generatePoem(rows, lines, outPath, n)
      })
  })
}

const generatePoem = (rows, lines, out, n) => {
  const poems = []

  for (let i = 0; i < n; i++) {
    const row = getRandomItem(rows)
    const { fullDate, TempAcqua, ClorofA, pH } = row
    const date = new Date(fullDate)
    const hours = date.getHours()

    const poem = getVerses(hours, TempAcqua, lines)
    poem.push(
      `${date.getDate()}*${date.getMonth()}*${hours}*${date.getMinutes()}*${TempAcqua}*${ClorofA}*${pH}`
    )
    const p = poem.join("@@")
    poems.push(p)
  }

  // generate new file
  fs.writeFile(out, poems.join("%^&"), function (err) {
    if (err) return console.log(err)
  })
}

// const generateTicket = (poem) => {
const generateTicket = () => {
  const poem = [
    "e d'aurei tristi vicini",
    "il Lago nostra a morte",
    "sopporta, un freddo",
    "i miei son caduti",
    "«Sí come i notte bei",
    "4*6*17*30*27.69*36.7*8.25",
  ]

  const data = poem[poem.length - 1]
  const vals = data.split("*")
  const day = vals[0]
  const month = vals[1]
  const hours = vals[2]
  const minutes = vals[3]
  const temp = vals[4]
  const clorof = vals[5]
  const ph = vals[6]

  const footerText = [
    `Questa fu scritta il giorno ${day} ${
      month === 0 ? "Gennnaio" : "Luglio"
    } alle ${hours}:${minutes}. La temperatura`,
    `era di ${temp}°, mentre la Clorofilla A era ${clorof}ug/l e il pH ${ph}. `,
  ]

  const sketch = (p) => {
    p.setup = () => {
      let canvas = p.createCanvas(639, 1772)
      setTimeout(() => {
        p.saveCanvas(canvas, "myCanvas", "png").then((filename) => {
          console.log(`saved the canvas as ${filename}`)
        })
      }, 100)
    }
    p.draw = () => {
      p.background(255)

      // header
      p.textFont(cbold, 36)
      p.text("pescando", 50, 100)
      p.text("poesie", 50, 100)

      p.text(footerText, 50, 100)
    }
  }

  let p5Instance = p5.createSketch(sketch)
}

// main
// generatePoemsTxt("jan.csv", "./jan.txt", 1000)
generateTicket()
