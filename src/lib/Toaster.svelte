<script lang="ts">

  import { Toaster } from 'svelte-sonner';
  
</script>


<Toaster
  expand={true}
  gap={5}
  duration={2000}
  offset={'0.5rem'}
  visibleToasts={5}
  class='![--width:16rem] ![--toast-icon-margin-end:0.4rem]'
  toastOptions={{
    unstyled: true,
    classes: {
      toast: 'flex h-fit items-center bg-base-300 p-4 rounded-sm w-(--width) h-(--initial-height) content-center',
      success: 'bg-success text-success-content',
      error: 'bg-error text-error-content',
      warning: 'bg-warning text-warning-content',
      info: 'bg-info text-info-content',
      description: 'text-base-content',
      actionButton: 'text-xs',
      cancelButton: 'bg-success',
      closeButton: 'text-error'
    }
  }}
/>