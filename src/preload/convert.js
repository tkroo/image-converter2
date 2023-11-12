import fs from 'node:fs'
import sharp from 'sharp'
const convert = async (file, format, out_directory, append_string, options) => {
  let basePath = process.argv.slice(-1)[0]
  const buffer = Buffer.from(await file.arrayBuffer())
  // console.log('---OPTIONS---')
  // console.log(options)

  // options = coerceTypes(options)
  // console.log('---correctedtypes options---')
  // console.log(options)
  // console.log('---options---')
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
    .toFormat(format, options)
    .toBuffer()
    .then((data) => {
      fs.writeFileSync(filepath, data, 'base64')
      return { filename, filepath, imageFormat: format }
    })
    .catch((err) => {
      console.log(`error: ${err}`)
    })
}

// const coerceTypes = (options) => {
//   Object.entries(options).forEach((e) => {
//     options[e[0]] = coerceValue(e[1])
//   })
//   return options
// }

// const coerceValue = (value) => {
//   if (value == 'true') {
//     return true
//   } else if (value == 'false') {
//     return false
//   } else if (!isNaN(parseFloat(value))) {
//     return parseFloat(value)
//   } else {
//     return value
//   }
// }

export default convert
