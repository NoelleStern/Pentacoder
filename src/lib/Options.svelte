<script lang="ts">

  import Select from './Select.svelte';
  import { pentacode } from './Stores/PentacodeStore.svelte';

</script>


<div class="flex gap-1">
  <!-- Ring amount select -->
  <Select label="Ring amount" values={$pentacode.getCircleList()} bind:value={$pentacode.ringAmountString} shift={1} />
  <!-- Spin select -->
  <Select label="Spin" values={$pentacode.spinValues} bind:value={$pentacode.spinString} />
</div>