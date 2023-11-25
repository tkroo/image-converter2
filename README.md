# image-converter2

Work in progress.

| If you get an error like this: GSlice: assertion failed: sinfo->n_allocated > 0  
| set G_SLICE=always-malloc in terminal before launching the app  

```
export G_SLICE=always-malloc
```  

Image format conversion app.  
An Electron app built with created with [electron-vite](https://electron-vite.org/), [svelte](https://svelte.dev) and [sharp](https://sharp.pixelplumbing.com)  

![screenshot after conversion](Screenshot1.png)  
![screenshot of settings](Screenshot2.png)  

## Install  

```bash
$ npm install
```

## Development  

```bash
$ npm run dev
```

## Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```
