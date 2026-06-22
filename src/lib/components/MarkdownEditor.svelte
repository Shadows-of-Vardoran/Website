<script lang="ts">
  import { useMarked } from '$lib/useMarked';
  import { saveContent, buildCommitMessage } from '$lib/github-save';
  import { getCmsPat } from '$lib/stores/admin.svelte';

  const { parse } = useMarked();

  let {
    filePath,
    initialContent,
    show,
    onsave,
  }: {
    filePath: string;
    initialContent: string;
    show: boolean;
    onsave?: (savedContent?: string) => void;
  } = $props();

  let editedContent = $state('');
  let previewHtml = $state('');
  let saving = $state(false);
  let statusMsg = $state('');

  $effect(() => {
    if (show) {
      editedContent = initialContent;
      updatePreview();
    }
  });

  async function updatePreview() {
    previewHtml = await parse(editedContent);
  }

  let previewTimeout: ReturnType<typeof setTimeout> | undefined;

  function onInput() {
    clearTimeout(previewTimeout);
    previewTimeout = setTimeout(() => {
      updatePreview();
    }, 300);
  }

  async function handleSave() {
    const pat = getCmsPat();
    if (!pat) {
      statusMsg = 'CMS not configured (missing PAT)';
      return;
    }

    saving = true;
    statusMsg = 'Saving...';

    const result = await saveContent(filePath, editedContent, buildCommitMessage(filePath), pat);

    if (result.ok) {
      statusMsg = 'Saved!';
      setTimeout(() => {
        onsave?.(editedContent);
      }, 1500);
    } else {
      statusMsg = `Error: ${result.error}`;
      saving = false;
    }
  }

  function handleCancel() {
    onsave?.(undefined);
  }
</script>

{#if show}
  <div class="fixed inset-0 z-50 flex flex-col bg-background-900/95">
    <div class="flex items-center justify-between px-6 py-3 border-b border-tprimary-800 bg-background-900">
      <div class="flex items-center gap-4">
        <span class="text-tprimary font-cinzel text-lg">Editing: {filePath}</span>
        <span class="text-sm text-tprimary-600">{editedContent.length} chars</span>
      </div>
      <div class="flex items-center gap-3">
        {#if saving}
          <span class="text-info-0">{statusMsg}</span>
        {:else if statusMsg}
          <span class="text-{statusMsg.startsWith('Error') ? 'error' : 'success'}-0">{statusMsg}</span>
        {/if}
        <button onclick={handleSave} disabled={saving} class="px-4 py-1.5 bg-success-800 hover:bg-success-700 text-white font-cinzel rounded disabled:opacity-50 cursor-pointer">
          Save
        </button>
        <button
          onclick={handleCancel}
          disabled={saving}
          class="px-4 py-1.5 bg-background-700 hover:bg-background-600 text-tprimary font-cinzel rounded disabled:opacity-50 cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>

    <div class="flex flex-1 overflow-hidden">
      <div class="flex-1 flex flex-col border-r border-tprimary-800">
        <div class="px-4 py-2 text-sm text-tprimary-600 bg-background-800 font-cinzel">Markdown</div>
        <textarea bind:value={editedContent} oninput={onInput} class="flex-1 p-4 bg-background-900 text-tprimary font-mono text-sm resize-none outline-none scrollbar-hidden"
        ></textarea>
      </div>

      <div class="flex-1 flex flex-col overflow-hidden">
        <div class="px-4 py-2 text-sm text-tprimary-600 bg-background-800 font-cinzel">Preview</div>
        <div class="flex-1 overflow-y-auto p-4 marked scrollbar-hidden">
          {@html previewHtml}
        </div>
      </div>
    </div>
  </div>
{/if}
