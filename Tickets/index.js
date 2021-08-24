const fs = require("fs")
const { readFile } = require("fs/promises")
const path = require("path")
const csv = require("fast-csv")
const p5 = require("node-p5")

const cbook = p5.loadFont({ path: "./fonts/cbook.otf", family: "CBook" })
const cbold = p5.loadFont({ path: "./fonts/cbold.otf", family: "CBold" })

const jan = []
const jul = []

const bannedChars = [".", ":", ",", ";"]

// Date,ClorofA,ClorofTens,CondSpec,LDO,LDOPerc,pH,Redox,TempAcqua

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

  fs.createReadStream(path.resolve(__dirname, "csv", "jan.csv"))
    .pipe(csv.parse({ headers: true }))
    .on("error", (error) => console.error(error))
    .on("data", (row) => {
      jan.push(row)
    })
    .on("end", (rowCount) => {
      console.log(`Parsed ${rowCount} rows`)
      randomLine(jan)
    })
})

const randomLine = (lines) => {
  const line = lines[~~(Math.random() * lines.length)]
  const { fullDate, ClorofA, pH, TempAcqua } = line
  const date = new Date(fullDate)

  const sentences = [
    `Questa fu scritta il giorno ${date.getDate()} ${
      date.getMonth() === 0 ? "Gennnaio" : "Agosto"
    } alle ${date.getHours()}:${date.getMinutes()}. La temperatura`,
    `era di ${TempAcqua}°, mentre la Clorofilla A era ${ClorofA}ug/l e il pH ${pH}. `,
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
      p.background(50)
      p.textFont(cbold, 36)
      p.text(sentences, 50, 100)
    }
  }

  // let p5Instance = p5.createSketch(sketch)
}
