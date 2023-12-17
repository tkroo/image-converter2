<script>
  import { onMount } from 'svelte'
  import { fade } from 'svelte/transition'

  // export let updateAvailable
  // export let downloadingUpdate
  // export let updateInfo
  // export let downloadProgress

  export let updateMsg

  let updateAvailable = false
  let downloadingUpdate = false
  let updateInfo = {}
  let downloadProgress = ''


  onMount(async () => {
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

</script>

{#if updateAvailable}
  <div class="popover-container" transition:fade={{ delay: 200, duration: 300 }}>
    <div class="popover-dialog" transition:fade={{ duration: 100 }}>
      {#if downloadingUpdate}
        <div class="message">
          <p>downloading update ...</p>
          <p>{downloadProgress}</p>
        </div>
      {:else}
        <div class="message">
          <h1>update available</h1>
          <p>version {updateInfo.version} available</p>
          <small>current version {updateInfo.currentVersion}</small>
        </div>
        <div class="buttons">
          <button
            class="btn"
            on:click={() => {
              downloadingUpdate = true
              window.api.checkForUpdates(true)
            }}>update to {updateInfo.version}</button
          >
          <button class="btn" on:click={() => (updateAvailable = false)}>cancel</button>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .popover-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: hsla(0, 0%, 0%, 0.75);
    z-index: 999;
  }
  .popover-dialog {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    width: 40vw;
    min-height: 36vh;
    padding: 2rem 2rem;
    border-radius: 0.5rem;
    background-color: var(--color-settings-bg);
  }
  .message {
    text-align: center;
    color: var(--color-fg);
  }
  h1 {
    font-size: 1.5rem;
    margin: 0 0 1.5rem;
  }
  .buttons {
    display: flex;
    justify-content: space-between;
    width: 100%;
    gap: 1rem;
  }
</style>
