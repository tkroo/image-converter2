<script>
  import { onMount } from 'svelte'
  import { fade } from 'svelte/transition'
  import SettingsIcon from './svg/SettingsIcon.svelte'

  export let optionsStore  
  export let updateMsg
  export let convertImages
  export let filesDropped

  const formats = optionsStore.formatOptions.map((f) => f.format)

  let panelOpen = false
  
  onMount(async () => {
    const { fOptionsStore } = await window.api.configOps.get()
    optionsStore = fOptionsStore
  })

  let timer
  $: optionsStore && debounceUpdate('fOptionsStore', optionsStore)
  
  function debounceUpdate(key, val, timeout = 750) {
    clearTimeout(timer)
    timer = setTimeout(() => window.api.configOps.set(key, val), timeout)
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

  async function selectPath() {
    const filePath = await window.api.selectOutDir()
    optionsStore.settingsOptions.outputDirectory = filePath
  }

  async function resetConfig(key) {
    await window.api.configOps.reset(key)
    await window.api.configOps.init()
    updateConfig()
  }

  async function openConfig() {
    await window.api.configOps.open()
  }

  function toggle() {
    panelOpen = !panelOpen
  }
</script>

<div class="panel-wrapper" class:panelOpen={panelOpen}>
  {#if panelOpen}
    <button
      class="unbutton close-overlay"
      in:fade={{ delay: 100, duration: 300 }}
      out:fade={{ delay: 250, duration: 300 }}
      on:click={() => (panelOpen = false)}
      on:mousewheel={(e) => (e.preventDefault(), e.stopPropagation())}
    ></button>
  {/if}
  <aside>
    <button type="button" class="unbutton toggle-btn" on:click={toggle} title={panelOpen ? "close settings" : "open settings"}>
      <SettingsIcon />
    </button>

    <div class="test">
      
    </div>

    <details open>
      <summary><h2>settings</h2></summary>
      <section class="options">
        <button type="button" class="btn" on:click={convertImages} disabled={filesDropped.length === 0}>convert again</button>
        <fieldset>
          <legend>&nbsp;convert to&nbsp;</legend>
          {#each formats as format}
            <label for={format}>
              <input bind:group={optionsStore.settingsOptions.defaultFormat} type="radio" id={format} value={format} />
              {format}
            </label>
          {/each}
          <details class="format-options">
            <summary>format options</summary>
            <ul>
              {#each optionsStore.formatOptions as option}
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
            <!-- <button on:click={() => {resetConfig('optionsStore.formatOptions')}} type="button" class="btn btn-small mt-2"> restore format defaults </button> -->
          </details>
        </fieldset>
        <div class="saveto">
          <p>save images to</p>
          <button type="button" on:click|preventDefault={selectPath} class="btn">
            {optionsStore.settingsOptions.outputDirectory}
          </button>
          <br />
          <button
            type="button"
            class="btn mt-2"
            on:click|preventDefault={async () => await window.api.openDirectory(optionsStore.settingsOptions.outputDirectory)}
          >
            open output directory
          </button>
          <!-- <p class="warning">existing files with the same name will be overwritten!</p> -->
        </div>
        <div class="append">
          <label for="use_append">
            <p>append string to file name
            <input
              id="use_append"
              type="checkbox"
              bind:checked={optionsStore.settingsOptions.appendStringUsed}
            /></p>
            <input id="append_string" type="text" bind:value={optionsStore.settingsOptions.appendString} />
            <br/>
            <small>image.*** will be saved as image{#if optionsStore.settingsOptions.appendStringUsed}<em>{optionsStore.settingsOptions.appendString}</em>{/if}.{optionsStore.settingsOptions.defaultFormat}</small>
          </label>
        </div>
        <div class="cols-2">
          <button type="button" class="btn" on:click={openConfig}> open settings file </button>
          <button type="button" class="btn" on:click={resetConfig}> restore all defaults </button>
        </div>
      </section>
    </details>

    <details>
      <summary><h2>resize options</h2></summary>
      <section class="options">
        <p>leave height and width blank to keep original size</p>
        <label for="width">
          width
          <input id="width" type="number" bind:value={optionsStore.resizeOptions.width} />
        </label>
        <label for="height">
          height
          <input id="height" type="number" bind:value={optionsStore.resizeOptions.height} />
        </label>
        <label for="fit">
          fit
          <select id="fit" bind:value={optionsStore.resizeOptions.fit}>
            <option value="cover">cover</option>
            <option value="contain">contain</option>
            <option value="fill">fill</option>
            <option value="inside">inside</option>
            <option value="outside">outside</option>
          </select>
        </label>
        <label for="background">
          background color when contain is used:
          <input id="background" type="text" bind:value={optionsStore.resizeOptions.background} />
        </label>
      </section>
    </details>
    
    <div class="version-info">
      <small>{@html updateMsg}</small>
    </div>
  </aside>
</div>

<style>
  :root {
    /* --o: min(80%, 600px); */
    --o: min(80%, 330px);
    --c: calc(var(--o)*-1);
  }
  aside {
    font-size: 0.8em;
    position: fixed;
    width: calc(var(--o) + 2rem);
    height: 100%;
    top: 0;
    padding: 1rem 2rem 1rem 1rem;
    background-color: var(--color-settings-bg);
    overflow: hidden;
    left: var(--c);
    transition: left 400ms ease-out, background-color 300ms ease-in-out;
    border-right: 1px solid var(--color-accent2);
  }

  aside .options {
    display: none;
  }

  .panelOpen aside .options {
    padding: 1rem 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin: 0;
  }

  .panelOpen aside {
    position: fixed;
    top: 0;
    left: 0;
    box-shadow: rgba(0, 0, 0, 0.75) 0px 5px 15px;
    overflow: auto;
    background-color: var(--color-settings-bg);
    border-right: 1px solid var(--color-settings-bg);
    transition: left 300ms ease-in-out, background-color 300ms ease-in-out;
  }
  .close-overlay {
    cursor: pointer !important;
    display: block;
    overflow: hidden;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    height: 100%;
    background-color: hsla(45, 100%, 0%, 0.75) !important;
  }
  h2 {
    margin: 0;
    font-size: 1.2em;
    display: inline-block;
  }
  a {
    color: var(--color-accent);
    text-decoration: none !important;
  }
  a:hover {
    text-decoration: underline !important;
  }
  input[type="number"], input[type="text"] {
    margin: 0.25rem 0;
    padding: 0.25rem 0.5rem;
    border: 1px solid #aaa;
    border-radius: 0.25rem;
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
    word-break: break-all;
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
  .cols-2 {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: flex-start;
  }
  .mt-2 {
    margin-top: 0.5rem;
  }
  /*
  .btn-small {
    font-size: 0.8em;
    padding: 0.125rem 0.25rem;
  }
  */
  .saveto p {
    line-height: 1.1;
    margin-top: 0;
    margin-bottom: 0.5rem;
  }
  
  fieldset {
    padding: 0.5em;
    /* min-width: fit-content; */
    width: 100%;
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
  .toggle-btn {
    position: absolute;
    top: 0;
    right: 0rem;
    cursor: pointer;
    /* height: 90%; */
    bottom: 0;
    padding-top: 1rem !important;
    padding-right: 0.25rem !important;
    display: flex;
    align-items: flex-start;
  }
  .format-options ul {
    list-style: none;
    padding: 0;
    margin: 0 0 1rem 0;
  }
  .format-options input {
    width: 50px;
    margin-left: 0.25rem;
  }
  .format-options summary {
    cursor: pointer;
    user-select: none;
    margin: 0.5rem 0 0 0.5rem;
  }
  .version-info {
    position: absolute;
    bottom: 1rem;
    font-size: 0.8rem;
  }
</style>