import fs from 'node:fs'
import sharp from 'sharp'
const convert = async (file, format, out_directory, append_string) => {
  let basePath = process.argv.slice(-1)[0]
  const buffer = Buffer.from(await file.arrayBuffer())

  let filepath
  let re = /\.[^.]*$/gm
  let newname = file.name.replace(re, append_string)
  let filename = `/${newname}.${format}`

  if (!out_directory) {
    fs.mkdir(basePath, { recursive: true }, (err) => {
      if (err) throw err
    })
    filepath = `${basePath}${filename}`
  } else {
    fs.mkdir(out_directory, { recursive: true }, (err) => {
      if (err) throw err
    })
    filepath = `${out_directory}${filename}`
  }

  return sharp(buffer)
    .toFormat(format)
    .toBuffer()
    .then((data) => {
      fs.writeFileSync(filepath, data, 'base64')
      return { filename, filepath, imageFormat: format }
    })
    .catch((err) => {
      console.log(`error: ${err}`)
    })
}

export default convert
