<script>
  import { onMount } from 'svelte'
  import { writable } from 'svelte/store'
  import { fade } from 'svelte/transition'
  // import Gears from './components/GearsSVG.svelte'
  import Dropper from './components/Dropper.svelte'
  import UpdateDialog from './components/UpdateDialog.svelte'
  import SettingsPanel from './components/SettingsPanel.svelte'
  import ResultsGrid from './components/ResultsGrid.svelte'

  let isMounted = false
  let isProcessing = false
  let workDuration = 0

  let optionsStore = null

  let filesReceived = []
  let convertedFiles = []
  $: filesOk = convertedFiles.filter((f) => f.status != 'error')
  $: filesError = convertedFiles.filter((f) => f.status == 'error')

  let updateMsg = ''
  let downloadProgress = ''
  let updateAvailable = false
  let downloadingUpdate = false
  let updateInfo = {}

  onMount(async () => {
    // create a writable store from the schema file
    const { fOptionsStore } = await window.api.configOps.get()
    optionsStore = writable({...fOptionsStore})
    
    window.api.sendUpDateInfo((event, info) => {
      updateInfo = info
      if (info.currentVersion >= info.version) {
        updateMsg = `${info.appName} ${info.currentVersion}`
        updateAvailable = false
      } else {
        updateMsg = `${info.appName} ${info.currentVersion} <br/><span class="ok">version ${info.version} available</span>`
        updateAvailable = true
      }
    })
    window.api.sendUpDateDownloadProgress((event, log_message) => {
      downloadProgress = log_message
    })
    isMounted = true
  })

  function timeFormat(duration) {
    const m = new Date(duration).getMinutes()
    const s = new Date(duration).getSeconds()
    const ms = new Date(duration).getMilliseconds()
    const minutes = m == 0 ? '' : m + (m > 1 ? ' mins ' : ' min ')
    const seconds = s == 0 ? '' : s + (s > 1 ? ' seconds ' : ' second ')
    return minutes + seconds + ms + ' milliseconds'
  }

  async function convertImages(e) {
    isProcessing = true
    convertedFiles = []
    await window.api.createDirectories($optionsStore.settingsOptions.outputDirectory)
    filesReceived = e.detail.files ?? filesReceived
    const startTime = Date.now()
    await Promise.all(
      filesReceived.map(async(f) => {
        let tmp = await window.api.handleFile(
          f,
          $optionsStore.settingsOptions.defaultFormat,
          $optionsStore.settingsOptions.outputDirectory,
          $optionsStore.settingsOptions.appendStringUsed ? $optionsStore.settingsOptions.appendString : '',
          $optionsStore.resizeOptions
        )
        convertedFiles = [...convertedFiles, tmp]
      })
    )

    const endTime = Date.now()

    workDuration = timeFormat(endTime - startTime)

    isProcessing = false
    convertedFiles = convertedFiles
  }
</script>

{#if isMounted && $optionsStore}
  <UpdateDialog {updateInfo} {updateAvailable} {downloadingUpdate} {downloadProgress} />

  <div class="container">

    <SettingsPanel bind:optionsStore={$optionsStore} {filesReceived} {updateMsg} {convertImages} />

    <main>
      <h1 class="uppercase">Image Format Converter</h1>
      <p class="mt-3">image.xxx will be saved to <strong>{$optionsStore.settingsOptions.outputDirectory}</strong>/image<strong>{#if $optionsStore.settingsOptions.appendStringUsed}<em>{$optionsStore.settingsOptions.appendString}</em>{/if}.<em>{$optionsStore.settingsOptions.defaultFormat}</em></strong></p>

      <Dropper on:gotFiles={convertImages}>
        <p class="message">Drop files / folders here<br/>or<br/>click to select files</p>
      </Dropper>

      <ResultsGrid
        bind:convertedFiles={convertedFiles}
        bind:filesReceived={filesReceived}
        optionsStore={$optionsStore}
        {isProcessing}
        {workDuration}
        {filesError}
        {filesOk}
      />
    </main>
    
  </div>
{/if}


<style>
  .container {
    min-height: 100%;
    height: 100%;
    padding-right: 2rem;
  }
  main {
    width: 100%;
    font-size: 0.8em;
    padding: 1rem 0rem 0 4rem;
    height: 100%;
  }
  h1 {
    text-transform: uppercase;
    font-size: 1.6em;
    margin: 0;
    user-select: none;
  }
  .uppercase {
    text-transform: uppercase;
  }
  .message {
    color: #222;
    font-size: 1.2rem;
    font-weight: bold;
    margin: 0;
    padding: 1rem;
    user-select: none;
    text-align: center;
  }
  .mt-3 {
    margin-bottom: 1rem;
  }
  
  :global(.custom-dropzone) {
    border: 2px dashed #5a5a5a !important;
    border-radius: 2px;
    background-color: var(--color-drop) !important;
  }
</style>
