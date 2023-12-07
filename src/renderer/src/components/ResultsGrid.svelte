<script>
  import { fade } from 'svelte/transition'
  import Gears from './GearsSVG.svelte'

  export let optionsStore
  export let convertedFiles
  export let filesReceived
  export let isProcessing
  export let workDuration
  
  $: filesOk = convertedFiles.filter((f) => f.status != 'error')
  $: filesError = convertedFiles.filter((f) => f.status == 'error')

  async function clearFiles() {
    filesReceived = []
    convertedFiles = []
  }

</script>
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
        <button type="button" class="btn" on:click|preventDefault={async () => await window.api.openDirectory(optionsStore.settingsOptions.outputDirectory)}>open output directory</button>
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

<style>
  .results-wrap .row {
    margin: 3rem auto 1rem;
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    gap: 1rem;
    justify-content: space-between;
    align-items: center;
  }
  .fgrow {
    flex-grow: 2;
  }
  .f-end {
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