import fs from 'node:fs'
import path from 'path'
import sharp from 'sharp'
import { myStore, fallbackPath } from '../helpers'
import convert from 'heic-convert'
import mime from 'mime'


// const re = /\.[^.]*$/gm

export async function createDirectories(_, outDirectory) {
  outDirectory = outDirectory ?? fallbackPath

  if (!fs.existsSync(outDirectory)) {
    fs.mkdir(outDirectory, { recursive: true }, (err) => {
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

async function handleHeif(imagePath) {
  try {
    const imageBuffer = await fs.promises.readFile(imagePath)
    return convert({ buffer: imageBuffer, format: 'PNG' })
  } catch (error) {
    console.error(`Error converting HEIF: ${error}`);
    return null
  }
}


async function imgConvert(file, resizeOptions) {
  const { defaultFormat, outputDirectory, appendString } = myStore.get('fOptionsStore.settingsOptions')
  const options = myStore.get('fOptionsStore.formatOptions').find((o) => o.format === defaultFormat).options
  const outDirectory = outputDirectory ?? fallbackPath
  const extname = path.extname(file)
  const filename = path.basename(file).replace(extname, appendString) + '.' + defaultFormat
  const filepath = checkFileExistenceAndIncrementFilename(path.join(outDirectory, filename))
  
  const imageType = mime.getType(file)
  file = imageType != 'image/heic' ? file : await handleHeif(file)

  try {
    const data = resizeOptions.enableResize ? await sharp(file).resize(resizeOptions).toFormat(defaultFormat, options).toFile(filepath) : await sharp(file).toFormat(defaultFormat, options).toFile(filepath)
    return { filename, filepath, imageFormat: defaultFormat, status: 'success' }
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

export async function handleFile(_, file) {
  const resizeOptions = myStore.get('fOptionsStore.resizeOptions')
  // if width or height are 0, set them to null
  if (resizeOptions.width === 0) resizeOptions.width = null
  if (resizeOptions.height === 0) resizeOptions.height = null
  if (resizeOptions.background === '') resizeOptions.background = '#000000'
  return await imgConvert(file, resizeOptions)
}
