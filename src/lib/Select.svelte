
<script lang="ts">

  interface Props { label: string, values: any, value: any, shift?: number };
  let { label, values, value = $bindable(), shift = 0 }: Props = $props();
  
</script>


<label class="floating-label grow max-w-[10rem] select-none">
  <span class="label">{label}</span>
  <select bind:value={value} class="select select-bordered focus:outline-none w-full">
    {#each values as v}
      <option value={String(v)}>{String(v+shift)}</option>
    {/each}
  </select> 
</label>