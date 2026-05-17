<script lang="ts">

  import { toast } from 'svelte-sonner';
  import { fade } from 'svelte/transition';
  import { pentacode, debug } from './Stores/PentacodeStore.svelte';


  function addSVG(containerElement: SVGSVGElement): void {
    const draw = $pentacode.getSVG();
    const svg: string = draw.svg();
    let inner: string;
    
    if ($pentacode.freshlyGeneratedFlag) {
      $pentacode.freshlyGeneratedFlag = false;

      // Parsing is required for .getTotalLength() to work + it's easier to work with
      // .getTotalLength() actually doesn't work without wrapping <g> into <svg> tag
      let parser: DOMParser = new DOMParser();
      let doc: Document = parser.parseFromString(`<svg>${svg}</svg>`, "text/html");

      for (const p of doc.querySelectorAll('path')) {
        p.classList.add('animated-path');
        p.style.strokeDasharray = String(p.getTotalLength());
        p.style.strokeDashoffset = String(p.getTotalLength());
      }

      inner = doc.querySelector('g')!.innerHTML;
    } else {
      inner = svg;
    }

    containerElement.innerHTML = inner;
  }
  function addDebug(containerElement: SVGSVGElement) {
    let draw = $pentacode.getSVG(true);
    containerElement.innerHTML = draw.svg();
  }
  function handleDblClick(_e: MouseEvent) {
    navigator.clipboard.writeText($pentacode.pentacode!.binaryTextPretty);
    toast.success('Text copied to clipboard');
  }

</script>


<div class="size-full flex flex-col items-center justify-center">
  <div class="relative size-full">

    <!-- I'm just overlaying one on top of the other -->
     
    <!-- Main SVG -->
    <svg class="absolute size-full" use:addSVG viewBox="0,0,{$pentacode.canvasInfo.size},{$pentacode.canvasInfo.size}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"/>
    <!-- Debug SVG -->
    {#if $debug}
      <div transition:fade={{ duration: 150 }}>
        <svg class="absolute size-full select-none pointer-events-none" use:addDebug viewBox="0,0,{$pentacode.canvasInfo.size},{$pentacode.canvasInfo.size}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"/>
      </div>
    {/if}

  </div>

  <!-- Binary text -->
  {#if $debug}
    <div class="absolute select-all z-1" transition:fade={{ duration: 150 }}>
      <span role="button" tabindex="0" ondblclick={handleDblClick}> {$pentacode.pentacode!.binaryTextPretty} </span>
    </div>
  {/if}
  
</div>