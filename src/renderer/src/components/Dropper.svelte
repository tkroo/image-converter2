<script>
  import { fromEvent } from 'file-selector'
  import { createEventDispatcher } from 'svelte'
  import accepts from './attr-accept'

  const dispatch = createEventDispatcher()
  const acceptTheseTypes = ['image/*']

  let inputElement
  let dragoverClass = ''

  const handleDrop = async (e) => {
    e.preventDefault()
    dragoverClass = ''
    const eventFiles = await fromEvent(e)
    const acceptedFiles = eventFiles.filter((f) => accepts(f, acceptTheseTypes))
    const files = acceptedFiles.map((f) => f.path)
    dispatch('gotFiles', { files })
  }

  const handleKeyDown = (e) => {
    if (e.keyCode === 32 || e.keyCode === 13) {
      inputElement.click()
    }
  }
</script>

<div
  id="dropzone"
  role="button"
  tabindex="0"
  class="{dragoverClass}"
  on:drop={handleDrop}
  on:click={() => {inputElement.click()}}
  on:keydown|preventDefault={handleKeyDown}
  on:dragover|preventDefault|stopPropagation={() => (dragoverClass = 'dragover')}
  on:dragleave={() => (dragoverClass = '')}
>
  <input
    accept="*"
    type="file"
    multiple
    name='dropper'
    tabindex="-1"
    on:change={handleDrop}
    bind:this={inputElement}
  />
  <slot>Drop files here</slot>
</div>

<style>
  #dropzone {
    border-radius: 0.5rem;
    border: 4px dashed var(--color-drop-bg);
    padding: 1rem;
    color: #222;
    background-color: var(--color-drop-bg);
    margin: 1rem auto;
    transition: background-color 200ms ease-in-out, border-color 200ms ease-in-out;
  }
  #dropzone input {
    display: none;
  }
  .dragover {
    border: 4px dashed #66666666 !important;
    background-color: var(--color-drop) !important;
  }
</style>