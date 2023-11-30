<script>
  export let name
  export let inputElement
  export let cfiles = []

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  }

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    let files =[];

    const fileHandlesPromises = [...e.dataTransfer.items]
      .filter((item) => item.kind === 'file')
      .map((item) => item.getAsFileSystemHandle())

    for await (const handle of fileHandlesPromises) {
      if (handle.kind === 'directory') {
        const getListing = await getDirectoryListing(handle)
        console.log('getListing :', getListing)
        files = [...files, ...getListing]
      } else {
        files = [...files, handle]
      }
    }

    console.log("==========")
    console.log('files: ')
    console.log(files)
    console.log("==========")
    for (const file of files) {
      console.log('file.webkitRelativePath: ', file.webkitRelativePath)
      console.log('file.directoryHandle: ', file.directoryHandle)
      console.log('file.handle: ', file.handle)
      // let tmp = await window.api.handleFile(f, imageFormat, out_directory, use_append_string ? append_string : '')
    }
    cfiles = files.map((f) => f.webkitRelativePath)

  }


  const getDirectoryListing = async(dirHandle) => {
    let directoryStructure = undefined;

    const getFiles = async (dirHandle, path = dirHandle.name) => {
      const dirs = [];
      const files = [];
      for await (const entry of dirHandle.values()) {
        const nestedPath = `${path}/${entry.name}`;
        if (entry.kind === "file") {
          files.push(
            entry.getFile().then((file) => {
              file.directoryHandle = dirHandle;
              file.handle = entry;
              return Object.defineProperty(file, "webkitRelativePath", {
                configurable: true,
                enumerable: true,
                get: () => nestedPath,
              });
            })
          );
        } else if (entry.kind === "directory") {
          dirs.push(getFiles(entry, nestedPath));
        }
      }
      return [
        ...(await Promise.all(dirs)).flat(),
        ...(await Promise.all(files)),
      ];
    };

    try {
      const handle = dirHandle;
      directoryStructure = getFiles(handle, undefined);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error(err.name, err.message);
      }
    }
    return directoryStructure;

  }


  function openFileDialog() {
    if (inputElement) {
      inputElement.value = null; // TODO check if null needs to be set
      // state.isFileDialogActive = true;
      inputElement.click();
    }
  }

  function onClickCb() {
    openFileDialog();
  }

  const onInputElementClick = (event) => {
    event.stopPropagation();
  }

  function onKeyDownCb(event) {
    // Ignore keyboard events bubbling up the DOM tree
    // if (!rootRef || !rootRef.isEqualNode(event.target)) {
    //   return;
    // }

    if (event.keyCode === 32 || event.keyCode === 13) {
      event.preventDefault();
      openFileDialog();
    }
  }


</script>


<div id="holder" role="button" tabindex="0"
  on:dragover={handleDragOver}
  on:drop={handleDrop}
  on:click={onClickCb}
  on:keydown={onKeyDownCb}
>
<input accept="image/*" multiple type="file" {name}
    autocomplete="off"
    tabindex="-1"
    bind:this={inputElement}
    style="display: none;"
    on:change={handleDrop}
    on:click={onInputElementClick}
  />
  <slot> Drop test </slot>
</div>

<style>
  #holder {
    border-radius: 0.5rem;
    padding: 2rem;
    color: #fff;
    background-color: #000;
    margin: 1rem auto;
  }
</style>