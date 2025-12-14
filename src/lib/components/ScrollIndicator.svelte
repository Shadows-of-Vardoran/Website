<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  export let scrollElement: HTMLElement | null = null;
  export let direction: 'up' | 'down' = 'down';

  let visible = true;

  function updateVisibility() {
    if (!scrollElement) {
      visible = true;
      return;
    }
    if (direction === 'down') {
      visible = scrollElement.scrollTop + scrollElement.clientHeight < scrollElement.scrollHeight - 1;
    } else {
      console.log('bleh');
      // Show when not at the very top (allow for small scroll tolerance)
      visible = scrollElement.scrollTop > 0;
    }
  }

  let listener: (() => void) | null = null;

  onMount(() => {
    if (scrollElement) {
      listener = () => updateVisibility();
      scrollElement.addEventListener('scroll', listener);
      setTimeout(() => {
        updateVisibility();
      }, 100);
    }
  });

  onDestroy(() => {
    if (scrollElement && listener) {
      scrollElement.removeEventListener('scroll', listener);
    }
  });

  $: if (scrollElement) updateVisibility();
</script>

<div class="indicator {direction === 'down' ? 'bottom' : 'top'} {visible ? '' : 'hide'}">
  {#if direction === 'down'}
    <!-- Down Chevron SVG -->
    <svg class="chevron" viewBox="0 0 96 24">
      <!-- Gothic Down Chevron: extra wide -->
      <path d="M8 6 L48 22 L88 6 Q48 16 8 6 Z" />
    </svg>
  {:else}
    <!-- Up Chevron SVG -->
    <svg class="chevron" viewBox="0 0 96 24">
      <!-- Gothic Up Chevron: extra wide -->
      <path d="M8 18 L48 2 L88 18 Q48 10 8 18 Z" />
    </svg>
  {/if}
</div>

<style>
  .indicator {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    transition: opacity 0.2s;
    pointer-events: none;
    opacity: 1;
  }
  .indicator.hide {
    opacity: 0;
  }
  .chevron {
    width: 120px;
    height: 24px;
    display: block;
    fill: var(--color-background-50);
    color: var(--color-background-50);
    /* Only border, no glow, no background */
    stroke: none;
    stroke-width: 0;
    paint-order: stroke fill;
    border-radius: 4px;
    /* Arrow itself shadow: more pronounced */
    box-shadow: none;
    filter: drop-shadow(30px 0px 5px black) drop-shadow(-30px 0px 5px black) drop-shadow(20px 0px 10px black) drop-shadow(-20px 0px 10px black) drop-shadow(0 0px 16px black);
    background: none;
  }
  .top {
    top: 16px;
  }
  .bottom {
    bottom: 16px;
  }
</style>
