<script>
  import { onMount } from 'svelte'
  import { fade } from 'svelte/transition'
  import Dropzone from 'svelte-file-dropzone/Dropzone.svelte'
  import Gears from './components/GearsSVG.svelte'
  // import errorIcon from './assets/warning-svgrepo-com.svg'

  let open_toggle = false
  let formats = ['png', 'jpg', 'webp', 'avif', 'gif']
  let imageFormat = 'png'
  let convertedFiles = []
  let files = {
    accepted: [],
    rejected: []
  }
  let out_directory
  let append_string = '_converted'
  let format_options = []
  let use_append_string
  let isProcessing = false

  $: filesOk = convertedFiles.filter((f) => f.status != 'error')
  $: filesError = convertedFiles.filter((f) => f.status == 'error')

  onMount(async () => {
    let { defaultFormat, outputDirectory, appendString, formatOptions, appendStringUsed } = await window.api.getConfig()
    imageFormat = defaultFormat
    out_directory = outputDirectory
    append_string = appendString
    format_options = formatOptions
    use_append_string = appendStringUsed
  })

  let timer
  $: append_string && debounceUpdate('appendString', append_string)
  $: imageFormat && debounceUpdate('defaultFormat', imageFormat, 250)
  $: format_options && debounceUpdate('formatOptions', format_options)
  
  function debounceUpdate(key, val, timeout = 750) {
    clearTimeout(timer)
    if (key == 'formatOptions') {
      format_options = val
    }
    timer = setTimeout(() => window.api.setConfig(key, val), timeout)
  }

  function coerceValue(value) {
    if (value == 'true') {
      return true
    } else if (value == 'false') {
      return false
    } else if (Number(value)) {
      return Number(value)
    } else {
      return value
    }
  }

  async function clearFiles() {
    files.accepted = []
    convertedFiles = []
  }

  async function handleConvert(event) {
    isProcessing = true
    let af
    if (event.detail.acceptedFiles) {
      files.accepted = []
      convertedFiles = []
      const { acceptedFiles } = event.detail
      af = acceptedFiles
      files.accepted = [...files.accepted, ...acceptedFiles]
    } else {
      if (files.accepted.length) {
        convertedFiles = []
        af = files.accepted
      } else {
        af = []
      }
    }
    const myfiles = af.map((f) => f.path)
    // for (let i = 0; i < myfiles.length; i++) {
    //   const file = myfiles[i]
    //   const foo = await window.api.handleFile(file, imageFormat, out_directory, use_append_string ? append_string : '')
    //   convertedFiles = [...convertedFiles, foo]
    // }
    const foo = await Promise.all(myfiles.map(async(f) => {
      const tmp = await window.api.handleFile(f, imageFormat, out_directory, use_append_string ? append_string : '')
      convertedFiles = [...convertedFiles, tmp]
      return tmp
    }))
    // convertedFiles = [...convertedFiles, ...foo]
    console.log('finished converting files')
    isProcessing = false
    convertedFiles = convertedFiles
  }

  async function selectPath() {
    const filePath = await window.api.selectOutDir()
    out_directory = filePath
  }

  async function resetPrefs() {
    await window.api.resetConfig()
  }

  async function editPrefs() {
    await window.api.editConfig()
  }

  function toggle() {
    open_toggle = !open_toggle
  }
</script>

<div class="container">
  <header>
    <h1 class="uppercase">image format converter</h1>
  </header>

  <button class="unbutton color-accent" on:click|preventDefault={toggle}>
    image.*** will be saved to <strong>{out_directory}</strong> as image{#if use_append_string}<em>{append_string}</em
      >{/if}.<em>{imageFormat}</em>
  </button>

  <details class="config" bind:open={open_toggle}>
    <summary class="summary-handle">
      <h2>settings</h2>
    </summary>
    <section class="options">
      <fieldset>
        <legend>&nbsp;convert to&nbsp;</legend>
        {#each formats as format}
          <label for={format}>
            <input bind:group={imageFormat} type="radio" id={format} name="imageFormat" value={format} />
            {format}
          </label>
        {/each}
        <details class="format-options">
          <summary>format options</summary>
          <ul>
            {#each format_options as option}
              <li>
                <fieldset>
                  <legend>&nbsp;{option.format}&nbsp;</legend>
                  {#each Object.entries(option.options) as [key, v]}
                    <label for={key}>
                      {key}:
                      <input
                        id={key}
                        type="text"
                        bind:value={option.options[key]}
                        on:change={() => (option.options[key] = coerceValue(v))}
                      />
                    </label>
                  {/each}
                </fieldset>
              </li>
            {/each}
          </ul>
          <p>
            read <a href="https://sharp.pixelplumbing.com/api-output" target="_blank">sharp output options</a> for valid
            values.
          </p>
          <button on:click={resetPrefs} type="button" class="btn btn-small pt-2"> restore defaults </button>
        </details>
      </fieldset>
      <div class="saveto">
        <p>save images to</p>
        <button type="button" on:click|preventDefault={selectPath} class="btn">
          {out_directory}
        </button>
        <br />
        <button
          type="button"
          class="btn pt-2"
          on:click|preventDefault={async () => await window.api.openDirectory(out_directory)}
        >
          open output directory
        </button>
        <!-- <p class="warning">existing files with the same name will be overwritten!</p> -->
      </div>
      <div class="append">
        <label for="use_append_string">
          append string to file name
          <input
            id="use_append_string"
            type="checkbox"
            bind:checked={use_append_string}
            on:change={async () => await window.api.setConfig('appendStringUsed', use_append_string)}
          />
          <br />
          <input id="append_string" type="text" bind:value={append_string} />
        </label>
        <br />
        <small>
          image.jpg will be saved as image{#if use_append_string}<em>{append_string}</em>{/if}.{imageFormat}
        </small>
      </div>
    </section>
    <button type="button" class="btn open-config" on:click={handleConvert} disabled={files.accepted.length === 0}>convert again</button>
    <button type="button" class="btn open-config" on:click={editPrefs}>open settings file</button>
  </details>
  <!-- </Modal> -->

  <Dropzone
    on:drop={handleConvert}
    containerStyles={'padding: 4rem;border-color: #aaaaaa; cursor: pointer;'}
    name="image"
    accept="image/*"
  >
    <p class="message">Drop files here, or click to select files</p>
  </Dropzone>

  <section class="results-wrap">
    {#if convertedFiles.length}
      <div class="row">
        <div class="fgrow">
          <h2>process{isProcessing
              ? `ing ${convertedFiles.length} of ${files.accepted.length}`
              : `ed ${convertedFiles.length}`} file{convertedFiles.length > 1 ? 's' : ''}
              {#if filesError.length}
              {#if !isProcessing}<br />converted {filesOk.length} file{filesOk.length > 1 ? 's' : ''} successfully{/if}
              
              <details class="error-list">
                <summary>
                  <span class="error">
                    {filesError.length} error{filesError.length > 1 ? 's' : ''}:
                  </span>
                </summary>
                <ol>
                  {#each filesError as file}
                    <li>file: {file.filename}<br />
                      <small>{file.error}</small>
                    </li>
                  {/each}
                </ol>
              </details>
              {/if}
          </h2>
          <br />
          <span>Click to download or drag and drop to a file manager window</span>
        </div>
        {#if isProcessing}
        <span class="geartest" transition:fade>
          <Gears />
        </span>  
        {/if}
        <button
          type="button"
          class="btn"
          on:click|preventDefault={async () => await window.api.openDirectory(out_directory)}
        >
          open output directory
        </button>

        <button type="button" class="btn" on:click|preventDefault={clearFiles}> clear results list </button>
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
</div>

<style>
  .container {
    font-size: 0.8em;
    padding: 1rem 2rem 0 2rem;
    height: 100%;
    /* display: flex;
    flex-direction: column; */
  }
  header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }
  h1 {
    text-transform: uppercase;
    font-size: 1.6em;
    margin-bottom: 0.5rem;
    user-select: none;
  }
  h2 {
    font-size: 1.2em;
    display: inline-block;
  }
  .config {
    margin: 0 0 0.5rem 0;
    padding: 0;
    border-radius: 0.25rem;
  }
  .config[open] {
    background-color: var(--color-accent2);
    color: var(--color-fg);
    margin-bottom: 1rem;
  }
  .config .summary-handle {
    cursor: pointer;
    user-select: none;
    margin-left: 0.5rem;
  }
  .btn.open-config {
    margin: 0 0 1rem 0.5rem;
  }
  .options {
    padding: 0.5rem;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    margin: 0;
  }
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
  .btn-small {
    font-size: 0.8em;
    padding: 0.125rem 0.25rem;
  }
  .saveto p {
    line-height: 1.1;
    margin-top: 0;
    margin-bottom: 0.5rem;
  }
  .append input {
    margin: 0 0 0.5rem 0;
    padding: 0.25rem 0.5rem;
    border: 1px solid #aaa;
    border-radius: 0.25rem;
  }
  fieldset {
    padding: 0em 0.5em 0.5em 0.5em;
    min-width: fit-content;
    border: 1px solid #aaa;
    border-radius: 0.25rem;
  }
  fieldset label {
    user-select: none;
    cursor: pointer;
    margin-right: 0.5rem;
  }
  fieldset label:last-child {
    margin-right: 0;
  }
  .results-wrap {
    margin-top: 1rem;
  }
  .results-wrap .row h2 {
    margin: 0;
  }
  .results-wrap .row {
    margin-top: 1rem;
    display: flex;
    align-items: flex-end;
    width: 100%;
    gap: 2rem;
    /* background-color: aqua; */
    justify-content: space-between;
  }
  .fgrow {
    flex-grow: 2;
  }
  .results-wrap img {
    background: repeating-conic-gradient(#666 0 90deg, #999 0 180deg) 0 0/20px 20px round;
  }
  /* .results-wrap img.error {
    background: var(--color-accent2);
    border-radius: 0.25rem;
    padding: 1rem;
  } */
  .results-list {
    padding: 1rem 0;
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
  .format-options ul {
    list-style: none;
    padding: 0;
    margin: 0 0 1rem 0;
  }
  .format-options input {
    width: 50px;
    margin-left: 0.25rem;
    padding: 0.25rem 0.5rem;
    border: 1px solid #aaa;
    border-radius: 0.25rem;
  }
  .format-options summary {
    cursor: pointer;
    user-select: none;
    margin: 0.5rem 0 0 0.5rem;
  }
  .uppercase {
    text-transform: uppercase;
  }
  .unbutton {
    background-color: transparent;
    color: inherit;
    border: none;
    margin: 0;
    padding: 0;
    text-align: inherit;
    font: inherit;
    border-radius: 0;
    appearance: none;
    cursor: pointer;
  }
  .color-accent {
    color: var(--color-accent);
  }
  .message {
    color: #222;
    font-size: 1.2rem;
    font-weight: bold;
    margin: 0;
    user-select: none;
  }
  /* .pt-1 {
    margin-top: 0.25rem;
  } */
  .pt-2 {
    margin-top: 0.5rem;
  }
  /*
  .ml-1 {
    margin-left: 0.25rem;
  }
  .mb-1 {
    margin-bottom: 1rem;
  }
  */
  a {
    color: var(--color-accent);
    text-decoration: none !important;
  }
  a:hover {
    text-decoration: underline !important;
  }
  /* .ok {
    color: green;
  } */
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
</style>
