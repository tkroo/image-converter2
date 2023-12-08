import fs from 'node:fs'
import path from 'path'
import sharp from 'sharp'
import { myStore, fallbackPath, thumbnailsDir } from '../helpers'

const re = /\.[^.]*$/gm

export async function createDirectories(_, outDirectory) {
  outDirectory = outDirectory ?? fallbackPath

  if (!fs.existsSync(outDirectory)) {
    fs.mkdir(outDirectory, { recursive: true }, (err) => {
      if (err) throw err
    })
  }
  if (!fs.existsSync(thumbnailsDir)) {
    fs.mkdir(thumbnailsDir, { recursive: true }, (err) => {
      if (err) throw err
    })
  }
}

function checkFileExistenceAndIncrementFilename(filepath) {
  // Check if file exists and increment the filename if it does.
  const dirname = path.dirname(filepath)
  const extname = path.extname(filepath)
  const baseName = path.basename(filepath, extname)
  let appendNumber = 0
  while (fs.existsSync(filepath)) {
    appendNumber++
    filepath = path.join(dirname, `${baseName}_${appendNumber}${extname}`)
  }
  return filepath
}

async function convert(file, format, outDirectory, appendString, options, resizeOptions) {
  outDirectory = outDirectory ?? fallbackPath

  const filename = path.basename(file).replace(re, appendString) + '.' + format
  const filepath = checkFileExistenceAndIncrementFilename(path.join(outDirectory, filename))

  try {
    await sharp(file).resize(resizeOptions).toFormat(format, options).toFile(filepath)
    return { filename, filepath, imageFormat: format, status: 'success' }
  } catch (error) {
    console.error(`err: ${error} - ${path.basename(filepath)}`)
    try {
      fs.unlinkSync(filepath)
    } catch (error) {
      console.error(`unlinkSync err: ${error}`)
    }
    return { filename: path.basename(file), status: 'error', error }
  }
}

export async function handleFile(_, ...args) {
  const options = myStore.get('fOptionsStore.formatOptions').find((o) => o.format === args[1]).options
  let resizeOptions = args[args.length-1]
  // if width or height are 0, set them to null
  if (resizeOptions.width === 0) resizeOptions.width = null
  if (resizeOptions.height === 0) resizeOptions.height = null
  return await convert(args[0], args[1], args[2], args[3] ? args[3] : '', options, resizeOptions)
}
