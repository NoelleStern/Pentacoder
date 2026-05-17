<script lang="ts">

  import Header from './lib/Header.svelte';
  import Toaster from './lib/Toaster.svelte';
  import Pentacoder from './lib/Pages/Pentacoder.svelte';

</script>


<div>

  <Toaster />

  <div class="view">
    <div class="content overflow-clip bg-base-100">

      <Header />

      <div class="app">
        <Pentacoder />
      </div>

    </div>
  </div>

</div>