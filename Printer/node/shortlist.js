const { exec } = require("child_process")

const N = 30
const life = 5000

let c = 0

const print = (file) => {
  const rImg = `shortlist/${file}.png`

  exec(
    `zplgfa -file ${rImg} | nc 192.168.8.162 9100`,
    { timeout: life },
    (err, stdout, stderr) => {
      if (err) {
        //some err occurred
        console.error(err)
      } else {
        // the *entire* stdout and stderr (buffered)
        console.log(`stdout: ${stdout}`)
        console.log(`stderr: ${stderr}`)
      }
    }
  )
}

const ping = setInterval(() => {
  if (c < 30) {
    print(c)
    c++
  } else {
    clearInterval(ping)
  }
}, life + 1000)
