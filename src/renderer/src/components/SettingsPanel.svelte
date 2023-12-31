<script>
  import { onMount } from 'svelte'
  import { fade } from 'svelte/transition'
  import SettingsIcon from './svg/SettingsIcon.svelte'
  import UpArrow from './svg/UpArrow.svelte'
  import schema from '../../../main/schema'

  export let optionsStore  
  export let updateMsg
  export let convertImages
  export let filesDropped
  let panel
  let showScroll = false
  
  const formats = optionsStore.formatOptions.map((f) => f.format)
  const themeNames = schema.fOptionsStore.properties.theme.properties.themeName.enum
  const accentColors = schema.fOptionsStore.properties.theme.properties.accentColor.enum

  let panelOpen = false

  $:showScroll = panelOpen && panel.scrollTop > 10

  onMount(async () => {
    updateConfig()
  })

  let timer
  $: optionsStore && debounceUpdate('fOptionsStore', optionsStore)
  
  function debounceUpdate(key, val, timeout = 750) {
    clearTimeout(timer)
    timer = setTimeout(() => window.api.configOps.set(key, val), timeout)
  }

  async function updateConfig() {
    const { fOptionsStore } = await window.api.configOps.get()
    optionsStore = fOptionsStore
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
      in:fade={{ delay: 100, duration: 200 }}
      out:fade={{ delay: 250, duration: 200 }}
      on:click={() => (panelOpen = false)}
      on:mousewheel={(e) => (e.preventDefault(), e.stopPropagation())}
    ></button>
  {/if}
  <aside bind:this={panel} on:scroll={() => (showScroll = panel.scrollTop > 10 ? true : false)}>
    <button type="button" class="unbutton toggle-btn" on:click={toggle} title={panelOpen ? "close settings" : "open settings"}>
      <div class="icon"><SettingsIcon /></div>
      {#if showScroll}<button transition:fade={{ delay: 250, duration: 300 }} class="unbutton backtotop" on:click|stopPropagation={() => panel.scrollTo({top:0, behavior:'smooth'})}><UpArrow /></button>{/if}
    </button>
    <div class="version-info">
      <small>{@html updateMsg}</small>
    </div>
    <div class="flex-row">
      <button type="button" class="btn" on:click={convertImages} disabled={filesDropped.length === 0}>convert again</button>
      <button type="button" class="btn"
        on:click|preventDefault={async () => await window.api.openDirectory(optionsStore.settingsOptions.outputDirectory)}
      >open output directory</button>
    </div>
    <hr class="hr">
    <h2>conversion settings</h2>
    <section class="options">
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
                    </label>
                    <input
                      id={key}
                      type="text"
                      bind:value={option.options[key]}
                      on:change={() => (option.options[key] = coerceValue(v))}
                    />
                  {/each}
                </fieldset>
              </li>
            {/each}
          </ul>
          <p>read <a href="https://sharp.pixelplumbing.com/api-output" target="_blank">sharp output options</a> for valid values.</p>
        </details>
      </fieldset>
      <p class="mt-2">save images to<br />
        <button type="button" on:click|preventDefault={async () => {optionsStore.settingsOptions.outputDirectory = await window.api.selectOutDir()}} class="btn">
          {optionsStore.settingsOptions.outputDirectory}
        </button>
      </p>
      <div class="mt-2">
        <label for="use_append">
          <input
            id="use_append"
            type="checkbox"
            bind:checked={optionsStore.settingsOptions.appendStringUsed}
          />append string to file name
        </label>
        <label for="append_string">
          <input id="append_string" type="text" bind:value={optionsStore.settingsOptions.appendString} />
          <br/>
          <small>image.*** will be saved as image{#if optionsStore.settingsOptions.appendStringUsed}<em>{optionsStore.settingsOptions.appendString}</em>{/if}.{optionsStore.settingsOptions.defaultFormat}</small>
        </label>
      </div>
    </section>
    <hr class="hr">
    <h2>resize settings</h2>
    <label for="enableResize"><input type="checkbox" id="enableResize" bind:checked={optionsStore.resizeOptions.enableResize} />enable resize</label>
    <!-- <p>leave height and width blank to keep original size</p> -->

    {#if optionsStore.resizeOptions.enableResize}
      <div class="gridme">
        <label for="width">width</label>
        <input id="width" type="number" bind:value={optionsStore.resizeOptions.width} />
        <label for="height">height</label>
        <input id="height" type="number" bind:value={optionsStore.resizeOptions.height} />
        <label for="fit">fit</label>
        <select id="fit" bind:value={optionsStore.resizeOptions.fit}>
          <option value="cover">cover</option>
          <option value="contain">contain</option>
          <option value="fill">fill</option>
          <option value="inside">inside</option>
          <option value="outside">outside</option>
        </select>
      </div>
      <label for="background">
        <p>background color when contain is used:</p>
        <input id="background" type="text" bind:value={optionsStore.resizeOptions.background} />
      </label>
    {/if}
    <hr class="hr">
    <h2>theme settings</h2>
    <div class="flex-row">
      <fieldset>
        <legend>&nbsp;light/dark mode&nbsp;</legend>
        {#each themeNames as themeName}
          <label for={themeName}>
            <input bind:group={optionsStore.theme.themeName} type="radio" id={themeName} value={themeName} />
            {themeName}
          </label>
        {/each}
      </fieldset>
      <fieldset id="accentColors">
        <legend>&nbsp;accent color&nbsp;</legend>
        {#each accentColors as aColor}
          <label for={aColor}>
            <input bind:group={optionsStore.theme.accentColor} type="radio" id={aColor} value={aColor} style="background-color: {aColor}; accent-color: {aColor}; outline-color: {aColor};" />
          </label>
        {/each}
      </fieldset>
      <!-- <fieldset>
        <legend>&nbsp;accent color&nbsp;</legend>
      <label for="accentColor">
        <input type="color" id="accentColor" bind:value={optionsStore.theme.accentColor} />
      </label>
      </fieldset> -->
      <label for="showQuickSettings">
        <input type="checkbox" id="showQuickSettings" bind:checked={optionsStore.theme.showQuickSettings} />
        show quick settings on main window
      </label>
    </div>
    <hr class="hr">
    <h2>extra settings</h2>
    <div class="flex-row">
      <button type="button" class="btn" on:click={openConfig}> open settings file </button>
      <button type="button" class="btn" on:click={resetConfig}> reset all defaults </button>
    </div>
  </aside>
</div>

<style>
  :root {
    --o: min(80%, 400px);
    --c: calc(var(--o)*-1);
  }
  .hr {
    z-index: 2;
    margin: 2rem -2rem 2rem -1rem;
    border-color: var(--color-accent2);
  }
  .hr:first-of-type {
    margin: 2rem -2rem 2rem -1rem;
  }
  aside {
    font-size: 0.8em;
    position: fixed;
    width: calc(var(--o) + 2rem);
    height: 100%;
    top: var(--titlebar-height);
    padding: 1rem 2rem 4rem 2rem;
    background-color: var(--color-settings-bg);
    overflow: hidden;
    left: var(--c);
    transition: left 300ms ease-out;
    /* border-right: 2px solid var(--color-accent2); */
    padding-right: 4rem;
    z-index: 1;
    height: 100%;
  }

  aside .options {
    display: none;
  }

  .backtotop {
    position: fixed;
    bottom: 0.5rem;
  }

  .panelOpen aside .options {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin: 0;
  }

  aside details[open] {
    margin-bottom: 2rem;
  }
  aside summary {
    cursor: pointer;
    user-select: none;
    padding: 0.25rem 0;
    /* background-color: cornflowerblue; */
  }
  aside details[open] summary {
    margin-bottom: 0.5rem;
    color: var(--color-accent);
  }

  .panelOpen aside {
    position: fixed;
    top: var(--titlebar-height);
    left: 0;
    box-shadow: rgba(0, 0, 0, 0.75) 0px 5px 15px;
    overflow: auto;
    background-color: var(--color-settings-bg);
    /* border-right: 1px solid var(--color-settings-bg); */
    transition: left 300ms ease-in-out;
  }
  .close-overlay {
    cursor: pointer !important;
    display: block;
    overflow: hidden;
    position: fixed;
    top: var(--titlebar-height);
    left: 0;
    bottom: 0;
    right: 0;
    height: 100%;
    background-color: hsla(45, 100%, 0%, 0.75) !important;
  }
  h2 {
    color: var(--color-fg);
    font-size: 1.2em;
    /* display: inline-block; */
    margin: 1rem 0 1rem 0;
  }
  p {
    margin: 0 0 0.25rem 0;
  }
  .mt-2 {
    margin-top: 1rem;
  }
  #accentColor {
    margin: 0;
    width: 100%;
  }
  details {
    margin-bottom: 0rem;
  }
  details:first-of-type {
    margin-top: 1rem;
  }
  .flex-row {
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
    justify-content: flex-start;
  }
  .flex-row label p {
    margin: 0 0 0.5rem 0;

  }
  .toggle-btn {
    z-index: 4;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    padding-top: 1rem !important;
    width: 2rem;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    /* background-color: var(--color-settings-bg); */
    cursor: pointer;
    height: 200%;
  }
  .icon {
    position: sticky;
    top: 0;
    left: 0;
  }
  :global(.icon svg path) {
    fill: var(--color-accent);
  }
  /* .panelOpen .toggle-btn {
    height: 200%;
  } */
  .format-options ul {
    list-style: none;
    padding: 0;
    margin: 0 0 1rem 0;
  }
  .format-options input {
    width: 50px;
  }
  .format-options summary {
    cursor: pointer;
    user-select: none;
    margin: 0.5rem 0 0 0.5rem !important;
    color: unset !important;
  }
  .format-options[open] summary {
    color: var(--color-accent) !important;
  }
  .version-info {
    margin-bottom: 1rem;
  }
  .format-options fieldset {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr 2fr;
    width: 100%;
    margin-bottom: 0.5rem;
    align-items: center;
  }
  .gridme {
    width: 120px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    gap: 1rem;
  }
  .gridme input {
    max-width: 6rem;
  }
  #accentColors input[type="radio"]:checked {
    outline: 1px solid;
    outline-offset: 2px;
  }
</style>