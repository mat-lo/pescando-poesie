const fs = require("fs")
const { readFile } = require("fs/promises")
const path = require("path")
const csv = require("fast-csv")
const p5 = require("node-p5")

const cbold = p5.loadFont({ path: "./fonts/cbold.otf", family: "CBold" })

var poemsVar = require("./shortlist")

const resourcesToPreload = {
  waveImg: p5.loadImage("./images/wave.png"),
  bait: p5.loadImage("./images/bait.png"),
  footwave: p5.loadImage("./images/footwave.png"),
  arrow: p5.loadImage("./images/arrow.png"),
  logo: p5.loadImage("./images/logo.png"),
}

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
const generateTicket = (poem, outPath) => {
  const data = poem[poem.length - 1]
  const vals = data.split("*")
  const day = vals[0]
  const month = vals[1]
  const hours = vals[2]
  const minutes = vals[3]
  const temp = vals[4]
  const clorof = vals[5]
  const ph = vals[6]

  const sketch = (p, preloaded) => {
    const write = (what, x, y, r) => {
      p.push()
      p.translate(x, y - 10)
      p.rotate(p.radians(r))
      p.text(what, 0, 0)
      p.pop()
    }

    const footpara = (array, x, y, r, linea) => {
      p.push()
      p.translate(x, y)
      p.rotate(p.radians(r))
      array.forEach((string, i) => {
        p.text(string, 0, i * 36)
      })
      if (linea) {
        p.noFill()
        p.stroke(255)
        p.strokeWeight(4)
        p.line(240, 255, 460, 255)
        p.noStroke()
        p.fill(255)
      }
      p.pop()
    }

    p.setup = () => {
      const waveImg = preloaded.waveImg
      const bait = preloaded.bait
      const footwave = preloaded.footwave
      const arrow = preloaded.arrow
      const logo = preloaded.logo

      const wave = (x, y) => {
        p.push()
        p.translate(x, y)
        p.rotate(p.radians(p.random(-7, 7)))
        p.image(waveImg, 0, 0, 102, 11)
        p.pop()
      }

      let canvas = p.createCanvas(639, 2092)

      p.background(255)
      p.textAlign(p.LEFT, p.TOP)

      // header
      p.fill(0)
      p.textFont(cbold, 90)
      write("pescando", 140, 37, p.random(-4, 4))
      write("poesie", 270, 154, p.random(-4, 4))
      p.image(bait, 32, 0, 82, 339)
      wave(p.random(20, p.width - 140), 364)

      // poems
      const n = poem.length - 1
      const hspace = 750 / n
      if (n < 5) {
        wave(
          p.random(20, p.width - 150),
          450 + ~~p.random(n - 1) * hspace + hspace * 0.5
        )
      }

      p.textSize(35)
      for (let i = 0; i < n; i++) {
        const w = p.textWidth(poem[i])
        const x = p.random(10, p.width - w - 40)
        const y = 450 + i * hspace

        p.fill(0)

        //close left
        if (x > 200) {
          if (Math.random() > 0.5) {
            wave(p.random(30, 60), y)
          }
        }

        //close right
        if (p.width - w - x > 200) {
          if (Math.random() > 0.5) {
            wave(p.random(p.width - 190, p.width - 150), y)
          }
        }

        write(poem[i].toLowerCase(), x, y, p.random(-4, 4))
      }

      // footer
      p.image(footwave, 0, 1150, p.width, 11)
      p.fill(0)
      p.rect(0, 1160, p.width, p.height - 1160)
      p.image(arrow, 18, 1220, 33, 29)

      const h1 = [
        "Questi versi non sono scritti da un",
        "essere umano, bensì dal lago di",
        "Mantova. Con l’intelligenza artificiale",
        "abbiamo insegnato ai laghi a scrivere",
        "trasformando dati ambientali",
        "in poesia.",
      ]
      const h2 = [
        `Questa fu scritta il giorno ${day} ${
          month === "0" ? "Gennnaio" : "Luglio"
        } alle`,
        `${hours}:${minutes}. La temperatura era di ${temp}°,`,
        `mentre la Clorofilla A era ${clorof} ug/l`,
        `e il pH ${ph}. Questi valori hanno ispirato il`,
        `lago nella scrittura della poesia.`,
        `Com’è possibile?`,
        `Leggilo sul sito → oio.studio/pesca`,
      ]

      const h3 = [
        "Pescando Poesie è un progetto di",
        "Matteo Loglio con oio per",
        "Edizioni Corraini, durante il",
        "Festivaletteratura 2021.",
        "I dati sono forniti dal CNR.",
      ]

      p.fill(255)
      p.textSize(28)
      footpara(h1, 65, 1230, p.random(-2, 2), false)
      footpara(h2, 28, 1490, -1, true)
      footpara(h3, 20, 1790, p.random(-1.5, 1.5), false)

      // logos
      p.image(logo, 15, 2030, 369, 38)
      p.textSize(55)
      write("ø", p.width - 170, 2020, p.random(-10, 10))
      write("i", p.width - 115, 2020, p.random(-10, 10))
      write("o", p.width - 75, 2020, p.random(-10, 10))

      p.saveCanvas(canvas, outPath, "png")
        .then((f) => {
          console.log(`saved canvas as ${f}`)
        })
        .catch(console.error)

      p.noLoop()
    }
  }
  const p5Instance = p5.createSketch(sketch, resourcesToPreload)
}

// main

// generatePoemsTxt("jan.csv", "./jan.txt", 1000)
const poemsAll = poemsVar.poemsAll
poemsAll.forEach((poem, i) => generateTicket(poem, `./out/${i}`))
// generateTicket(poemsAll[10], `./out/ano`)
