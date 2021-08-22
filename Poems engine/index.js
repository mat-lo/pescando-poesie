const fs = require("fs")
const path = require("path")
const csv = require("fast-csv")

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
  const {
    Date,
    ClorofA,
    ClorofTens,
    CondSpec,
    LDO,
    LDOPerc,
    pH,
    Redox,
    TempAcqua,
  } = line
  console.log(
    Date,
    ClorofA,
    ClorofTens,
    CondSpec,
    LDO,
    LDOPerc,
    pH,
    Redox,
    TempAcqua
  )
}
