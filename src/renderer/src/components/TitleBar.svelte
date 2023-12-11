<script>
  // import Icon from './svg/appIcon.svelte'
  import Close from './svg/titlebar/close.svelte'
  import Maximize from './svg/titlebar/maximize.svelte'
  import Minimize from './svg/titlebar/minimize.svelte'
</script>

<div class="titlebar Xdraggable">
  <div class="title">Image Format Converter</div>
  <div class="spacer"></div>
  <!-- <Icon /> -->
  <div class="controls Xno-draggable">
    <button class="unbutton" on:click={() => {window.api.winMinimize()}}><Minimize /></button>
    <button class="unbutton" on:click={() => {window.api.winMaximize()}}><Maximize /></button>
    <button class="unbutton" on:click={() => {window.api.winClose()}}><Close /></button>
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
  .title {
    position: absolute;
    width: 100%;
    color: var(--color-fg);
    font-size: 15px;
    font-weight: 500;
    text-align: center;
  }
  .spacer {
    /* padding-left: 1rem; */
    flex-grow: 1;
  }
  .controls {
    display: flex;
    margin-right: 0.25rem;
    gap: 1.25rem;
    align-items: center;
    justify-content: space-between;
    z-index: 900;
  }
</style>