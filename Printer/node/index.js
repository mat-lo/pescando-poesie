const RPiGPIOButtons = require("rpi-gpio-buttons")
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

let buttons = new RPiGPIOButtons({
  pins: [2],
})

buttons.on("clicked", (pin) => {
  switch (pin) {
    case 2:
      console.log("press!")
      print()
      break
  }
})

buttons.init().catch((error) => {
  console.log("ERROR", error.stack)
  process.exit(1)
})
