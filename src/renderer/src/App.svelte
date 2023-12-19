<script>
  import { onMount } from 'svelte'
  import { writable } from 'svelte/store'
  import Dropper from './components/Dropper.svelte'
  import UpdateDialog from './components/UpdateDialog.svelte'
  import SettingsPanel from './components/SettingsPanel.svelte'
  import ResultsGrid from './components/ResultsGrid.svelte'
  import formatTime from './lib/formatTime'
  import TitleBar from './components/TitleBar.svelte'
  import QuickSettings from './components/QuickSettings.svelte'

  let isMounted = false
  let isProcessing = false
  let workDuration = 0

  let optionsStore = null

  let filesDropped = []
  let filesConverted = []

  let updateMsg = ''
  // let panelOpen
  let rootElement
  $:rootElement && rootElement.style.setProperty('--color-accent', $optionsStore.theme.accentColor)

  onMount(async () => {
    // create a writable store from the schema file
    const { fOptionsStore } = await window.api.configOps.get()
    optionsStore = writable({...fOptionsStore})
    
    isMounted = true
  })

  async function convertImages(e) {
    isProcessing = true
    filesConverted = []
    await window.api.createDirectories($optionsStore.settingsOptions.outputDirectory)
    filesDropped = e.detail.files ?? filesDropped
    const startTime = Date.now()

    await Promise.all(
      filesDropped.map(async(file) => {
        let tmp = await window.api.handleFile(file)
        filesConverted = [...filesConverted, tmp]
      })
    )
    
    const endTime = Date.now()
    workDuration = formatTime(endTime - startTime)
    isProcessing = false
    filesConverted = filesConverted
  }

</script>
{#if isMounted && $optionsStore}
  <div id="outer" bind:this={rootElement} data-theme={$optionsStore.theme.themeName}>
    <UpdateDialog bind:updateMsg={updateMsg} />
    <TitleBar />
    <div class="container">
      <SettingsPanel bind:optionsStore={$optionsStore} {filesDropped} {updateMsg} {convertImages} />
      <main>
        <!-- <h1 class="accent uppercase">{window.document.title}</h1> -->
        {#if $optionsStore.theme.showQuickSettings}
          <QuickSettings bind:optionsStore={$optionsStore} {convertImages} {filesDropped} />
        {/if}
        <Dropper on:gotFiles={convertImages}>
          <p class="message">Drop files / folders here<br/>or<br/>click to select files</p>
        </Dropper>
        <!-- <p class="mt-3">image.xxx will be saved to <strong>{$optionsStore.settingsOptions.outputDirectory}</strong>/image<strong>{#if $optionsStore.settingsOptions.appendStringUsed}<em>{$optionsStore.settingsOptions.appendString}</em>{/if}.<em>{$optionsStore.settingsOptions.defaultFormat}</em></strong></p> -->
        <ResultsGrid
          bind:filesConverted={filesConverted}
          bind:filesDropped={filesDropped}
          optionsStore={$optionsStore}
          {isProcessing}
          {workDuration}
        />
      </main>
    
    </div>
  </div>
{/if}

<style>
  #outer {
    padding: 0;
    padding-top: var(--titlebar-height);
    margin: 0;
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: var(--color-bg);
    border-top-left-radius: 0.95rem;
    border-top-right-radius: 0.95rem;
  }
  .container {
    height: 100%;
    overflow: auto;
    width: 100%;
    padding-right: 2rem;
    background-color: var(--color-bg);
    color: var(--color-fg);
  }
  main {
    width: 100%;
    font-size: 0.8em;
    padding: 1rem 0 0 4rem;
    height: 100%;
  }
  /* h1 {
    text-transform: uppercase;
    font-size: 1.6em;
    margin: 0;
    user-select: none;
  }
  .uppercase {
    text-transform: uppercase;
  }
  .accent {
    color: var(--color-accent);
  } */
  .message {
    color: var(--color-accent);
    font-size: 1.2rem;
    font-weight: bold;
    margin: 0;
    padding: 1rem;
    user-select: none;
    text-align: center;
  }
  /* .mt-3 {
    margin-bottom: 1rem;
  } */
</style>
