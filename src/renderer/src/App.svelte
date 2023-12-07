<script>
  import { onMount } from 'svelte'
  import { writable } from 'svelte/store'
  import Dropper from './components/Dropper.svelte'
  import UpdateDialog from './components/UpdateDialog.svelte'
  import SettingsPanel from './components/SettingsPanel.svelte'
  import ResultsGrid from './components/ResultsGrid.svelte'
  import formatTime from './lib/formatTime'

  let isMounted = false
  let isProcessing = false
  let workDuration = 0

  let optionsStore = null

  let filesReceived = []
  let convertedFiles = []

  let updateMsg = ''

  onMount(async () => {
    // create a writable store from the schema file
    const { fOptionsStore } = await window.api.configOps.get()
    optionsStore = writable({...fOptionsStore})
    
    isMounted = true
  })

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
    workDuration = formatTime(endTime - startTime)
    isProcessing = false
    convertedFiles = convertedFiles
  }
</script>

{#if isMounted && $optionsStore}
  <UpdateDialog bind:updateMsg={updateMsg} />

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
</style>
