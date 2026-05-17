<script lang="ts">

  interface Props { color: string };
  let { color = $bindable() }: Props = $props();

</script>


<div class="size-12 rounded-(--radius-field) border-1 border-base-content/20 focus-within:border-base-content" style:background-color={color}>
  <input bind:value={color} type="color" class="opacity-0 size-full"/>
</div>