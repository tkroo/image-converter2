import { writable } from 'svelte/store'

export const optionsStore = writable(
  {
    resizeOptions: {
      width: null,
      height: null,
      fit: 'contain',
    },
    settingsOptions: {
      outputDirectory: '',
      appendString: '_extra',
      appendStringUsed: false,
      defaultFormat: 'png'
    },
    formatOptions: [
      {
        format: 'png',
        options: {
          compressionLevel: 6
        }
      },
      {
        format: 'jpg',
        options: {
          quality: 80,
          mozjpeg: false
        }
      },
      {
        format: 'webp',
        options: {
          quality: 80,
          lossless: false
        }
      },
      {
        format: 'avif',
        options: {
          quality: 50,
          lossless: false
        }
      },
      {
        format: 'gif',
        options: {
          colors: 256,
          dither: 1
        }
      }
    ]
  }
)

