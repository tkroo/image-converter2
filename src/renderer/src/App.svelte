<script>
  import { onMount } from 'svelte'
  import Dropzone from 'svelte-file-dropzone/Dropzone.svelte'
  import gearicon from '../../../resources/gears.gif?asset'

  // let myConfig
  let formats = ['png', 'jpg', 'webp', 'avif', 'gif']
  let imageFormat = 'png'
  let convertedFiles = []
  let files = {
    accepted: [],
    rejected: []
  }
  let out_directory
  let append_string = '_converted'

  onMount(async () => {
    let { defaultFormat, outputDirectory, appendString } = await window.electronAPI.getConfig()
    imageFormat = defaultFormat
    out_directory = outputDirectory
    append_string = appendString
    console.log('defaultFormat: ', defaultFormat)
    console.log('outputDirectory: ', outputDirectory)
    console.log('appendString: ', appendString)
  })

  async function handleConversion(e) {
    if (e.detail) {
      files.accepted = []
      convertedFiles = []
      // const { acceptedFiles, fileRejections } = e.detail
      const { acceptedFiles } = e.detail
      files.accepted = [...files.accepted, ...acceptedFiles]
      // files.rejected = [...files.rejected, ...fileRejections]
      convertFiles(acceptedFiles, imageFormat, out_directory, append_string)
    } else {
      imageFormat = e.target.value
      window.electronAPI.setConfig('defaultFormat', imageFormat)
      if (files.accepted.length) {
        convertedFiles = []
        convertFiles(files.accepted, imageFormat, out_directory, append_string)
      }
    }
  }

  async function clearFiles() {
    files.accepted = []
    convertedFiles = []
  }

  async function convertFiles(files, format, out_directory, append_string) {
    for (let i = 0; i < files.length; i++) {
      // eslint-disable-next-line no-undef
      const f = await convert(files[i], imageFormat, out_directory, append_string) // convert is defined in src/preload/index.js
      convertedFiles = [...convertedFiles, f]
    }
  }

  async function selectPath() {
    const filePath = await window.electronAPI.selectOutDir()
    out_directory = filePath
  }
</script>

<div class="container">
  <header>
    <h1>image format converter</h1>
  </header>

  <section class="options">
    <fieldset>
      <legend>&nbsp;convert to&nbsp;</legend>
      {#each formats as format}
        <label for={format}>
          <input
            bind:group={imageFormat}
            on:change={handleConversion}
            type="radio"
            id={format}
            name="imageFormat"
            value={format}
          />
          {format}
        </label>
      {/each}
    </fieldset>
    <div class="saveto">
      <p>save images to</p>
      <button type="button" on:click|preventDefault={selectPath} class="btn">
        <span>{out_directory}</span>
      </button>
      <!-- <p class="warning">existing files with the same name will be overwritten!</p> -->
    </div>
    <div class="append">
      <p>append string to file names</p>
      <input id="append_string" type="text" bind:value={append_string} /><br />
      <small>
        <em>example.jpg</em>
        <br />becomes<br />
        <em>example</em><strong>{append_string}</strong><em>.{imageFormat}</em>
      </small>
    </div>
  </section>

  <Dropzone
    on:drop={handleConversion}
    containerStyles={'padding: 4rem;border-color: #aaaaaa;'}
    name="image"
    accept="image/*"
  >
    <p>Drop files here, or click to select files</p>
  </Dropzone>

  <section class="results-wrap">
    {#if convertedFiles.length}
      <div class="row">
        <div>
          <h2>
            convert{convertedFiles.length < files.accepted.length
              ? `ing ${convertedFiles.length} of ${files.accepted.length}`
              : `ed ${convertedFiles.length}`} file{convertedFiles.length > 1 ? 's' : ''} to {imageFormat}
          </h2>
          <br />
          <span>Click to download or drag and drop to a file manager window</span>
        </div>
        {#if convertedFiles.length < files.accepted.length}
          <img src={gearicon} alt="gears" class="gears" />
        {/if}
        <button
          type="button"
          class="btn btn-green"
          on:click|preventDefault={async () => await window.electronAPI.openDirectory(out_directory)}
        >
          <span>View converted files</span>
        </button>

        <button type="button" class="btn" on:click|preventDefault={clearFiles}>
          <span>Clear files</span>
        </button>
      </div>
      <ul class="results-list">
        {#each convertedFiles as file}
          <li>
            <a
              download="file://{file.filepath}"
              href="file://{file.filepath}"
              title="click to download, or drag and drop"
              target="_blank"
            >
              <img src="file://{file.filepath}" alt={file.filename} loading="lazy" /><br />
              <span>{file.filename.slice(1)}</span>
            </a>
            <!-- <span>file.filename: {file.filename}</span><br /> -->
          </li>
        {/each}
      </ul>
    {:else if files.accepted.length}
      <p><img src={gearicon} alt="gears" class="gears" />working on it...</p>
    {/if}
  </section>
</div>

<style>
  .container {
    font-size: 0.8em;
    padding: 1rem 2rem 0 2rem;
    height: 100%;
  }
  h1 {
    font-size: 1.4em;
  }
  h2 {
    font-size: 1.2em;
    display: inline-block;
  }
  .options {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 1rem;
  }
  .btn {
    font-weight: inherit;
    font-family: inherit;
    width: fit-content;
    padding: 0.25rem 0.5rem;
    margin: 0;
    border: 1px solid #aaa;
    border-radius: 0.25rem;
    background-color: #eee;
  }
  .btn:hover {
    background-color: #ddd;
  }
  .btn span {
    font-weight: bold;
  }
  .saveto p,
  .append p {
    margin: 0 0 0.5rem 0;
  }
  .append input {
    margin: 0 0 0.5rem 0;
    padding: 0.25rem 0.5rem;
    border: 1px solid #aaa;
    border-radius: 0.25rem;
  }
  fieldset {
    padding: 0.5em 1em 1em 1em;
    min-width: fit-content;
    border: 1px solid #aaa;
    border-radius: 0.25rem;
  }
  fieldset label {
    user-select: none;
    margin-right: 1rem;
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
    /* background-color: aqua; */
    justify-content: space-between;
  }
  .btn-green {
    background-color: hsl(152, 83%, 40%);
    border-color: hsl(152, 83%, 40%);
    color: white;
    margin: 0 1rem;
  }
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
  .results-list li span {
    word-break: break-all;
  }
  .results-list img {
    width: 100%;
    height: auto;
  }
  .gears {
    margin: 0 0 0 0.5rem;
    user-select: none;
    width: 40px;
    height: auto;
  }
</style>
