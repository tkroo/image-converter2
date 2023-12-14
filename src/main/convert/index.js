import fs from 'node:fs'
import path from 'path'
import sharp from 'sharp'
import { myStore, fallbackPath, thumbnailsDir } from '../helpers'
import convert from 'heic-convert'
import mime from 'mime'


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

async function convertHeif(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath)
    return convert({ buffer: imageBuffer, format: 'PNG' })
  } catch (error) {
    console.error(`Error converting HEIF: ${error}`);
    return null
  }
}

async function imgConvert(f, format, outDirectory, appendString, options, resizeOptions) {
  
  outDirectory = outDirectory ?? fallbackPath
  
  const filename = path.basename(f).replace(re, appendString) + '.' + format
  const filepath = checkFileExistenceAndIncrementFilename(path.join(outDirectory, filename))
  
  const imageType = mime.getType(f)
  let file = imageType != 'image/heic' ? f : await convertHeif(f)

  try {
    const data = await sharp(file).resize(resizeOptions).toFormat(format, options).toFile(filepath)
    return { filename, filepath, imageFormat: format, status: 'success', data: data }
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
  if (resizeOptions.background === '') resizeOptions.background = '#000000'
  return await imgConvert(args[0], args[1], args[2], args[3] ? args[3] : '', options, resizeOptions)
}
