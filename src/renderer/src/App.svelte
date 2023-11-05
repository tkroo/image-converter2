<script>
  import Dropzone from 'svelte-file-dropzone/Dropzone.svelte'

  let imageFormat = 'png'
  let convertedFiles = []
  let files = {
    accepted: [],
    rejected: []
  }

  async function handleFilesSelect(e) {
    files.accepted = []
    convertedFiles = []

    const { acceptedFiles, fileRejections } = e.detail
    files.accepted = [...files.accepted, ...acceptedFiles]
    files.rejected = [...files.rejected, ...fileRejections]

    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i]
      // eslint-disable-next-line no-undef
      const f = await convert(file, imageFormat) // convert is defined in src/preload/index.js
      convertedFiles.push(f)
      convertedFiles = convertedFiles
    }
  }
</script>

<div class="container">
  <h1>image format converter</h1>
  <fieldset>
    <legend>&nbsp;output format&nbsp;</legend>
    <div>
      <input
        bind:group={imageFormat}
        type="radio"
        id="png"
        name="imageFormat"
        value="png"
        checked
      />
      <label for="png">png</label>
      <input bind:group={imageFormat} type="radio" id="jpg" name="imageFormat" value="jpg" />
      <label for="jpg">jpg</label>
      <input bind:group={imageFormat} type="radio" id="webp" name="imageFormat" value="webp" />
      <label for="webp">webp</label>
      <input bind:group={imageFormat} type="radio" id="avif" name="imageFormat" value="avif" />
      <label for="avif">avif</label>
    </div>
  </fieldset>
  <Dropzone
    on:drop={handleFilesSelect}
    containerStyles={'padding: 4rem;border-color: #aaaaaa;'}
    name="image"
    accept="image/*"
  >
    <p>Drop files here, or click to select files</p>
  </Dropzone>

  <div class="results-wrap">
    {#if convertedFiles.length}
      <h2>
        convert{convertedFiles.length < files.accepted.length
          ? `ing ${convertedFiles.length} of ${files.accepted.length}`
          : `ed ${convertedFiles.length}`} file{convertedFiles.length > 1 ? 's' : ''}
      </h2>
      <p>Click to download or drag and drop to a file manager window</p>
      <ul class="results">
        {#each convertedFiles as file}
          <li>
            <a
              download="file://{file.filepath}"
              href="file://{file.filepath}"
              title="click to download"
              target="_blank"
            >
              <img src="file://{file.filepath}" alt={file.filename} /><br />
            </a>
            <!-- <span>file.filename: {file.filename}</span><br /> -->
            <span>{file.filename.slice(1)}</span>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>

<style>
  .container {
    flex: 1;
    display: flex;
    flex-direction: column;
    /* max-width: 840px; */
    margin: 0 auto;
    padding: 15px 30px 0 30px;
    height: 100%;
  }
  h1 {
    font-size: 1.4rem;
    margin-bottom: 0.5rem;
  }
  h2 {
    font-size: 1.2rem;
  }
  fieldset {
    font-size: 0.9rem;
    margin-bottom: 1rem;
    padding: 0.5rem 1rem 1rem 1rem;
  }
  fieldset label {
    margin-right: 1rem;
  }
  .results-wrap {
    margin-top: 1rem;
  }
  .results {
    padding: 2rem 0;
    list-style: none;
    font-size: 0.8rem;
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }
  .results li {
    max-width: 180px;
  }
  .results li span {
    word-break: break-all;
  }
  .results img {
    width: 100%;
    height: auto;
  }
</style>
