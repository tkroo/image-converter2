<script>
  import Icon from './svg/appIcon.svelte'
  import Close from './svg/titlebar/close.svelte'
  import Maximize from './svg/titlebar/maximize.svelte'
  import Minimize from './svg/titlebar/minimize.svelte'
</script>
<div class="titlebar draggable">
  <Icon />
  <div class="spacer"></div>
  <div class="controls no-draggable">
    <button class="unbutton" on:click={() => window.api.winMinimize()}><Minimize /></button>
    <button class="unbutton" on:click={() => window.api.winMaximize()}><Maximize /></button>
    <button class="unbutton" on:click={() => window.api.winClose()}><Close /></button>
  </div>
</div>

<style>
  .titlebar {
    display: flex;
    align-items: center;
    width: 100%;
    z-index: 9000;
    position: fixed;
    top: 0;
    left: 0;
    height: var(--titlebar-height);
    background-color: var(--color-titlebar-bg);
    padding: 0 0.5rem;
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
  }
  .spacer {
    flex-grow: 1;
  }
  .controls {
    display: flex;
    margin-right: 0.25rem;
    gap: 1.25rem;
    align-items: center;
    justify-content: space-between;
  }
  .title-icon path {
    fill: red;
  }
</style>