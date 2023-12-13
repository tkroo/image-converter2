<script>
  export let optionsStore  
</script>

<div class="quick-settings">
  <fieldset>
    <legend>&nbsp;convert to&nbsp;</legend>
    {#each optionsStore.formatOptions.map((f) => f.format) as format}
      <label for={format}>
        <input bind:group={optionsStore.settingsOptions.defaultFormat} type="radio" id={format} value={format} />
        {format}
      </label>
    {/each}
  </fieldset>
  <p>save images to <button type="button" on:click|preventDefault={async () => {optionsStore.settingsOptions.outputDirectory = await window.api.selectOutDir()}} class="btn btn-output-select">
    {optionsStore.settingsOptions.outputDirectory}
  </button></p>
</div>

<style>
  .quick-settings {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .btn-output-select {
    margin-left: 0.5rem;
  }
</style>