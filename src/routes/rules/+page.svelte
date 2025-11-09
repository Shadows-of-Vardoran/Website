<script lang="ts">
  import { onMount } from 'svelte';
  import { marked } from 'marked';

  let html: string | Promise<string> = '';

  onMount(async () => {
    const res = await fetch('/content/rules.md');
    const md = await res.text();
    html = marked(md);
  });
</script>

<div class="flex">
  <aside class="p-4">
    <div>Sidebar (section links go here)</div>
  </aside>

  <main class="flex-1 p-8 prose max-w-none">
    {@html html}
  </main>
</div>
