
<script lang="ts">
  
  import Share from '../svg/Share.svelte';
  import type { MouseEventHandler } from 'svelte/elements';

  interface Props { saveFunction: MouseEventHandler<HTMLButtonElement>, shareFunction: MouseEventHandler<HTMLButtonElement>, text: String };
  let { saveFunction, shareFunction, text }: Props = $props();
  
</script>


<!-- focus-within makes it keyboard accessible -->
<!-- Note: ":is()" works fine with pseudo-classes, but not pseudo-elements!  -->
<!-- Transition delays are there to make the animation look super smooth -->
<style>
  .save-holder {
    display: flex;
  }

  /* Share button could be absent */
  .save-holder:is(:hover, :focus-within):has(.btn-share) > .btn-save {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    transition-delay: 0s;
  }
 

  .save-holder:is(:hover, :focus-within) > .btn-share {
    width: 24px;
    border: 1px;
    padding: 2px;
    transition-delay: 0.05s;
  }

  .btn-save {
    border-top-right-radius: var(--radius-field);
    border-bottom-right-radius: var(--radius-field);
    transition: 0.2s;
    transition-delay: 0.1s;
  }

  .btn-share {
    width: 0;
    border: 0;
    padding: 0;
    transition: 0.15s;
    transition-delay: 0s;
  }
</style>


<div class="save-holder">
  <button onclick={saveFunction} class="btn btn-primary btn-save rounded-r-none outline-offset-1 flex-none px-3">{text}</button>
  {#if navigator.share != undefined}
    <button onclick={shareFunction} class="btn btn-accent btn-square btn-share rounded-l-none"> <Share color='var(--color-accent-content)'/> </button>
  {/if}
</div>