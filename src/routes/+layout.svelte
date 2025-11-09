<script lang="ts">
  import '../app.css';
</script>

<svelte:head>
  <!-- <link rel="icon" href={dwLogoWhite} /> -->
</svelte:head>

<div class="h-screen w-screen flex flex-col overflow-hidden">
  <div class="text-center h-12 bg-background-700"> top nav bar goes here </div>

  <div class="w-full h-full overflow-hidden">
    <slot />
  </div>
</div>
