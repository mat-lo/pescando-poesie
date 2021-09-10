const minutes = 5
const the_interval = minutes * 60 * 1000

const { exec } = require("child_process")

const N = 1820

const print = () => {
  const r = ~~(Math.random() * N)
  const rImg = "tickets/" + r + ".png"

  exec(
    "zplgfa -file " + rImg + " | nc 192.168.8.162 9100",
    { timeout: 5000 },
    (err, stdout, stderr) => {
      if (err) {
        //some err occurred
        console.error(err)
      } else {
        // the *entire* stdout and stderr (buffered)
        // console.log(`stdout: ${stdout}`)
        // console.log(`stderr: ${stderr}`)
      }
    }
  )
}

print()

setInterval(() => {
  print()
}, the_interval)
