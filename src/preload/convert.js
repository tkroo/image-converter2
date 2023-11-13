import fs from 'node:fs'
import sharp from 'sharp'
import path from 'path'

const re = /\.[^.]*$/gm

function checkFileExistenceAndIncrementFilename(filepath) {
  // Check if file exists and increment the filename if it does.
  const dirname = path.dirname(filepath)
  const extname = path.extname(filepath)
  const filenameBase = path.basename(filepath, extname)
  let filenameNumber = 0
  while (fs.existsSync(filepath)) {
    filenameNumber++
    filepath = path.join(dirname, `${filenameBase}_${filenameNumber}${extname}`)
  }
  return filepath
}

const convert = async (file, format, out_directory, append_string, options) => {
  let buffer = Buffer.from(await file.arrayBuffer())
  let filepath
  let filename = file.name.replace(re, append_string) + '.' + format
  if (!out_directory) {
    out_directory = process.argv.slice(-1)[0]
  }
  fs.mkdir(out_directory, { recursive: true }, (err) => {
    if (err) throw err
  })
  // filepath = path.join(out_directory, filename)
  filepath = checkFileExistenceAndIncrementFilename(path.join(out_directory, filename))

  return sharp(buffer)
    .toFormat(format, options)
    .toBuffer()
    .then((data) => {
      fs.writeFileSync(filepath, data, 'base64')
      filename = path.basename(filepath)
      return { filename, filepath, imageFormat: format }
    })
    .catch((err) => {
      console.log(`error: ${err}`)
    })
}

export default convert
