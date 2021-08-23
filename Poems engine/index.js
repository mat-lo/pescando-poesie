const fs = require("fs")
const path = require("path")
const csv = require("fast-csv")
const p5 = require("node-p5")

const cbook = p5.loadFont({ path: "./fonts/cbook.otf", family: "CBook" })
const cbold = p5.loadFont({ path: "./fonts/cbold.otf", family: "CBold" })

const jan = []
const jul = []

// Date,ClorofA,ClorofTens,CondSpec,LDO,LDOPerc,pH,Redox,TempAcqua

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

  function sketch(p) {
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
      p.text("hello world!", 50, 100)
    }
  }

  let p5Instance = p5.createSketch(sketch)
}
