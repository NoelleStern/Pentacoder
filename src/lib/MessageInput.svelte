<script lang="ts">

  import { toast } from 'svelte-sonner';

  interface Props { message: String, lastMessage: String, encoderFSM: any };
  let { message=$bindable(), lastMessage, encoderFSM }: Props  = $props();
  
  export function encodePressed() {
    if (!message) {
      toast.warning("No message provided");
    } else if (lastMessage == message) {
      toast.warning("Already encoded");
    } else {
      encoderFSM.buttonPressed();
    }
  }

</script>


<!-- Text input field -->
<div class="flex">
  <label class="floating-label select-none w-md">
    <span class="label">Message</span>
    <input bind:value={message} type="text" placeholder="Message" class="input input-bordered flex-1 focus:outline-none w-full max-w-md" />
  </label>

  <!-- Encode button -->
  <button onclick={encodePressed} class="btn btn-primary outline-offset-1 flex-none ml-[0.3rem] {$encoderFSM!='idle' ? 'btn-disabled' : ''}">Encode</button>
</div>