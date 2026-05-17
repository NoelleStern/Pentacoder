<script lang="ts">

  import { TitleArtLong } from './TitleArt';

</script>


<style>
  .title {
    /* https://youtu.be/2IV08sP9m3U?t=122 */
    padding-left: 1rem;
    font-size: clamp(0.3rem, 1vw, 0.6rem);
    font-family: monospace;
    font-weight: 900;
    user-select: none;
    white-space: pre;
  }
</style>


<div class="navbar bg-primary">  
  <div class="relative flex w-full">
    <span class="title">{TitleArtLong}</span>
    <span class="absolute right-[1rem] bottom-0"> by Noelle Stern</span>
  </div>
</div>
