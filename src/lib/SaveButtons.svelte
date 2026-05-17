<script lang="ts">

	import { saveAs } from 'file-saver';
  import SaveButton from './SaveButtonComponent.svelte';
  import { pentacode, debug } from './Stores/PentacodeStore.svelte';


  // MAKING SHARE WORK WAS QUITE A RIDE SOMEHOW
  function basicShare(file: File, title: string = "Share Pentacode") {
    navigator.share({
      title: title,
      files: [file]
    });
  }

  function svgBlob(): Blob {
    const svg: string = $pentacode.getOutputSVG($debug);
    const blob: Blob = new Blob([svg], {type: "image/svg+xml"});
    return blob
  }
	function saveSVG(): void {
    const blob: Blob = svgBlob();
    saveAs(blob, "Pentacode.svg");
  }
  function shareSVG(): void {
    const blob: Blob = svgBlob();
    const file: File = new File([blob], 'Pentacode.svg', {type: blob.type});
    basicShare(file);
  }

  // https://gist.github.com/ycmjason/1570f2ae6588be753053ca874d71b64
  // https://gist.github.com/tatsuyasusukida/1261585e3422da5645a1cbb9cf8813d6
  async function createImage(size: number = 1024): Promise<HTMLCanvasElement> {
    return new Promise((resolve) => {
      const image = new Image()

      image.onload = () => {
        const canvas = document.createElement('canvas');

        canvas.setAttribute('width', `${size}`);
        canvas.setAttribute('height', `${size}`);

        const context = canvas.getContext('2d');
        context!.drawImage(image, 0, 0, size, size);
        
        resolve(canvas);
      };

      const svg: string = $pentacode.getOutputSVG($debug);
      const svgBlob: Blob = new Blob([svg], {type: "image/svg+xml"});
      image.src = URL.createObjectURL(svgBlob);
    });
  }
  async function pngURL(size: number = 1024): Promise<string> {
    const canvas: HTMLCanvasElement = await createImage(size);
    return canvas.toDataURL('image/png');
  }
  async function savePNG(size: number = 1024): Promise<void> {
    const blob = await pngURL(size);
    saveAs(blob, "Pentacode.png");
  }
  async function sharePNG(): Promise<void> {
    const url: string = await pngURL();
    const blob: Blob = await fetch(url).then(r => r.blob());
    const file: File = new File([blob], 'Pentacode.png', {type: blob.type});
    basicShare(file);
  }
</script>


<!-- Download buttons -->
<SaveButton text="Save .png" saveFunction={() => savePNG()}  shareFunction={sharePNG} />
<SaveButton text="Save .svg" saveFunction={saveSVG} shareFunction={shareSVG} />