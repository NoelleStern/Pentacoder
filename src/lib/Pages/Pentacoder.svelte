<script lang="ts">

  import fsm from 'svelte-fsm';
  import Options from '../Options.svelte';
  import Preview from '../Preview.svelte';
  import ColorPicker from '../ColorPicker.svelte';
  import SaveButtons from '../SaveButtons.svelte';
  import MessageInput from '../MessageInput.svelte';
  import DebugCheckbox from '../DebugCheckbox.svelte';

  import { onMount } from 'svelte';
  import { PentacodeDirect } from '../Pentacoder/direct';
  import { pentacode } from '../Stores/PentacodeStore.svelte';


  // https://stackoverflow.com/questions/72369356/svelte-web-worker-in-without-sveltekit
  // https://stackoverflow.com/questions/79353733/how-to-import-modules-in-a-web-worker-js-file-using-a-react-vite-app
  const worker: Worker = new Worker(new URL('../Workers/EncodeWorker.ts', import.meta.url), { type: 'module' });

  // Just an array results in double reactivity
  let keyValue = $derived(
    "" + $pentacode.id + $pentacode.ringAmountString +
    $pentacode.spinString + $pentacode.primaryColor + $pentacode.secondaryColor
  );

  // Main variables
  let message: string = $state('meow');
  let lastMessage: string = $state('');
  const encoderFSM = fsm('idle', {
    idle: {
      buttonPressed() {
        worker.postMessage(message);
        return 'active';
      },
    },
    active: {
      finished() {
        return 'idle';
      },
    },
  });

  
  // When encoding result returns
  worker.onmessage = (msg: MessageEvent<PentacodeDirect>) => {
    $pentacode.pentacode = PentacodeDirect.copy(msg.data); // Is a thing because onmessage serialization is silly
    lastMessage = $pentacode.pentacode.text;
    encoderFSM.finished();
  }

  // Automatically encode the default message on mount
  onMount(() => {
    encoderFSM.buttonPressed();
	});
</script>


<!-- Animated svg path css -->
<!-- svelte-ignore css_unused_selector -->
<style>
  :global(.animated-path) {
    animation: dash 0.65s ease-in-out 0s 1 normal forwards;
  }
  @keyframes dash {
    100% { stroke-dashoffset: 0; }
  }
</style>


<div class="flex flex-col h-full gap-y-(--gap)">

  <!-- Message input -->
  <MessageInput bind:message {lastMessage} {encoderFSM} />
  
  {#if ($encoderFSM == 'idle' && $pentacode.pentacode)}
    
    <!-- Options -->
    <Options />

    <!-- Pentacode preview, extra UI and download -->
    {#key keyValue}
      <div class="relative flex flex-col grow">

        <!-- Debug checkbox and color picker -->
        <div class="flex flex-col gap-y-(--gap) z-1">
          <div class="flex gap-1">
            <ColorPicker bind:color={$pentacode.primaryColor}/>
            <ColorPicker bind:color={$pentacode.secondaryColor}/>
          </div>

          <DebugCheckbox />
        </div>

        <!-- Preview -->
        <div class="absolute size-full">
          <Preview />
        </div>

        <!-- Download buttons -->
        <div class="flex flex-col h-full">
          <div class="grow"></div>
          <div class="flex gap-1 z-2">
            <SaveButtons />
          </div>
        </div>

      </div>
    {/key}

  {:else}

    <!-- Loading spinner -->
    <span class="loading loading-spinner loading-lg"></span>

  {/if}

</div>