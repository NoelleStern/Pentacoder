<script lang="ts">

  import { debug } from './Stores/PentacodeStore.svelte';

</script>


<div class="form-control top w-52 mt-[-0.35rem] pb-(--gap)">
  <label class="cursor-pointer select-none">
    <span>Debug:</span>
    <input bind:checked={$debug} type="checkbox" class="checkbox checkbox-primary outline-offset-1" />
  </label>
</div>