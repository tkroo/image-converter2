const schema = {
  fOptionsStore: {
    type: "object",
    properties: {
      resizeOptions: {
        type: "object",
        properties: {
          width: {
            type: ["number", "null"],
          },
          height: {
            type: ["number", "null"],
          },
          fit: {
            type: "string",
            enum: ["cover", "contain", "fill", "inside", "outside"],
          },
          background: {
            type: "string",
          }
        }
      },
      settingsOptions: {
        type: "object",
        properties: {
          outputDirectory: {
            type: "string",
          },
          appendString: {
            type: "string",
            default: "_extra",
          },
          appendStringUsed: {
            type: "boolean",
            default: false,
          },
          defaultFormat: {
            type: "string",
            default: "png",
          }
        }
      },
      formatOptions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            format: {
              type: 'string'
            },
            options: {
              type: 'object',
              properties: {
                quality: {
                  type: 'number',
                  maximum: 100,
                  minimum: 1
                },
                mozjpeg: {
                  type: 'boolean'
                },
                lossless: {
                  type: 'boolean'
                },
                colors: {
                  type: 'number',
                  maximum: 256,
                  minimum: 2
                },
                dither: {
                  type: 'number',
                  maximum: 1.0,
                  minimum: 0
                },
                compressionLevel: {
                  type: 'number',
                  maximum: 9,
                  minimum: 0
                }
              }
            }
          }
        }
      }
    },
    default: {
      resizeOptions: {
        width: null,
        height: null,
        fit: "contain",
        background: "#FFFFFF"
      },
      settingsOptions: {
        outputDirectory: "",
        appendString: "_extra",
        appendStringUsed: false,
        defaultFormat: "png"
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
  }
}

export default schema
