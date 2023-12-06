<script>
  import { onMount } from 'svelte'
  import { optionsStore } from './stores/optionsStore.js'
  // import { writable } from 'svelte/store'
  

  import { fade } from 'svelte/transition'
  import Gears from './components/GearsSVG.svelte'
  import Dropper from './components/Dropper.svelte'
  
  import UpdateDialog from './components/UpdateDialog.svelte'
  import SettingsPanel from './components/SettingsPanel.svelte'

  let isProcessing = false
  let workDuration = 0

  // let out_directory
  // let optionsStore

  let filesReceived = []
  let convertedFiles = []
  $: filesOk = convertedFiles.filter((f) => f.status != 'error')
  $: filesError = convertedFiles.filter((f) => f.status == 'error')

  let updateMsg = ''
  let downloadProgress = ''
  let updateAvailable = false
  let downloadingUpdate = false
  let updateInfo = {}
  let isMounted = false

  onMount(async () => {
    console.log('onMount')
    isMounted = true
    // const { fOptionsStore } = await window.api.configOps.get()
    // optionsStore = writable({...fOptionsStore})

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
  })

  async function clearFiles() {
    filesReceived = []
    convertedFiles = []
  }

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

    <SettingsPanel
      bind:optionsStore={$optionsStore}
      {filesReceived}
      {updateMsg}
      {convertImages} />

    <main>
      <h1 class="uppercase">Image Format Converter</h1>
      <p class="mt-3">image.xxx will be saved to <strong>{$optionsStore.settingsOptions.outputDirectory}</strong>/image<strong>{#if $optionsStore.settingsOptions.appendStringUsed}<em>{$optionsStore.settingsOptions.appendString}</em>{/if}.<em>{$optionsStore.settingsOptions.defaultFormat}</em></strong></p>

      <Dropper on:gotFiles={convertImages}>
        <p class="message">Drop files / folders here<br/>or<br/>click to select files</p>
      </Dropper>

      <section class="results-wrap">
        {#if convertedFiles.length}
          <div class="row">
            <div class="fgrow">
              process{isProcessing ? `ing ${convertedFiles.length} of ${filesReceived.length}` : `ed ${convertedFiles.length}`} file{convertedFiles.length > 1 ? 's' : ''} {!isProcessing ? `in ${workDuration}` : ''}
                  {#if isProcessing}
                    <span class="geartest" transition:fade>
                      <Gears />
                    </span>  
                  {/if}
                  {#if filesError.length}
                    {#if !isProcessing}<br />converted {filesOk.length} file{filesOk.length > 1 ? 's' : ''} successfully{/if}  
                    <details class="error-list">
                      <summary>
                        <span class="error">
                          {filesError.length} error{filesError.length > 1 ? 's' : ''}:
                        </span>
                      </summary>
                      <ol>{#each filesError as file}
                        <li>file: {file.filename}<br />
                          <small>{file.error}</small>
                        </li>
                      {/each}</ol>
                    </details>
                  {/if}
              
              <br />
              <span>Click to download or drag and drop to a file manager window</span>
            </div>
            
            <div class="f-end">
              <button type="button" class="btn" on:click|preventDefault={async () => await window.api.openDirectory($optionsStore.settingsOptions.outputDirectory)}>open output directory</button>
              <button type="button" class="btn" on:click|preventDefault={clearFiles}>clear results list</button>
            </div>
          </div>
          <ul class="results-list">
            {#each convertedFiles as file}
              {#if file.status === 'success'}
                <li>
                  <a download="file://{file.filepath}" href="file://{file.filepath}" title="click to download, or drag and drop" target="_blank">
                    <img src="file://{file.filepath}" alt={file.filename} loading="lazy" /><br />
                    <span class="filename">{file.filename}</span>
                  </a>
                </li>
              {/if}
            {/each}
          </ul>
        {:else if isProcessing}
          <p>working on it...</p>
        {/if}
      </section>
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
  /* h2 {
    margin: 0;
    font-size: 1.2em;
    display: inline-block;
  } */
  
  .btn {
    font-weight: bold;
    font-family: inherit;
    width: fit-content;
    padding: 0.25rem 0.5rem;
    margin: 0;
    border: 1px solid #aaa;
    border-radius: 0.25rem;
    background-color: #eee;
    cursor: pointer;
  }
  .btn:hover {
    background-color: #ddd;
  }
  .btn:disabled {
    cursor: auto;
  }
  .btn:disabled:hover {
    background-color: #eee;
  }
  
  .results-wrap .row {
    margin: 3rem auto 1rem;
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    gap: 1rem;
    justify-content: space-between;
    align-items: center;
    /* background-color: hsla(200, 100%, 50%, 0.25); */
  }
  .fgrow {
    flex-grow: 2;
    /* background-color: hsla(290, 100%, 50%, 0.25); */
  }
  .f-end {
    /* background-color: hsla(240, 100%, 50%, 0.25); */
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    align-items: center;
    flex-grow: 1;
    gap: 2rem;
  }
  .results-wrap img {
    background: repeating-conic-gradient(#666 0 90deg, #999 0 180deg) 0 0/20px 20px round;
  }
  .results-list {
    padding: 0;
    margin: 0;
    list-style: none;
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }
  .results-list li {
    max-width: 180px;
  }
  .results-list .filename {
    overflow-wrap: anywhere;
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
  a {
    color: var(--color-accent);
    text-decoration: none !important;
  }
  a:hover {
    text-decoration: underline !important;
  }
  .error {
    color: hsl(0, 80%, 60%);
  }
  .error-list {
    margin-top: 0.5rem;
    margin-bottom: 0.4rem;
  }
  .error-list ol {
    padding-left: 2rem;
  }
  .error-list li {
    font-weight: 400;
    margin-bottom: 0.5rem;
  }
  .error-list small {
    font-weight: 300;
    font-size: 0.9em;
  }
  .geartest {
    width: 4rem;
  }
  :global(.custom-dropzone) {
    border: 2px dashed #5a5a5a !important;
    border-radius: 2px;
    background-color: var(--color-drop) !important;
  }

  .test {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }
</style>
