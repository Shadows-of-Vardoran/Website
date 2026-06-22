<script lang="ts">
  import { getIsAdmin } from '$lib/stores/admin.svelte';
  import { untrack } from 'svelte';
  import { EditorView, basicSetup } from 'codemirror';
  import { EditorState } from '@codemirror/state';
  import { markdown } from '@codemirror/lang-markdown';
  import { oneDark } from '@codemirror/theme-one-dark';

  let {
    filePath,
    sectionKey,
    rawContent,
    children,
    onsave,
  }: {
    filePath: string;
    sectionKey: string;
    rawContent: string;
    children: import('svelte').Snippet;
    onsave?: (sectionKey: string, savedContent: string) => void;
  } = $props();

  let editing = $state(false);
  let editContent = $state('');
  let editorEl: HTMLDivElement | undefined = $state();
  let editorView: EditorView | null = null;

  let isAdmin = $derived(getIsAdmin());

  function openEditor() {
    editContent = rawContent;
    editing = true;
  }

  function handleSave() {
    editing = false;
    onsave?.(sectionKey, editContent);
  }

  function handleCancel() {
    editing = false;
  }

  $effect(() => {
    if (editing && editorEl) {
      const doc = untrack(() => editContent);

      editorView = new EditorView({
        state: EditorState.create({
          doc,
          extensions: [
            basicSetup,
            markdown(),
            oneDark,
            EditorView.lineWrapping,
            EditorView.updateListener.of((update) => {
              if (update.docChanged) {
                editContent = update.state.doc.toString();
              }
            }),
          ],
        }),
        parent: editorEl,
      });

      return () => {
        editorView?.destroy();
        editorView = null;
      };
    }
  });
</script>

<div class="relative group w-full">
  {#if isAdmin && !editing}
    <button
      onclick={openEditor}
      class="absolute top-2 right-2 z-10 px-2 py-1 bg-background-800/80 hover:bg-info-800 text-tprimary text-xs font-cinzel rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
    >
      <i class="mdi mdi-pencil mr-1"></i>Edit
    </button>
  {/if}

  {#if editing}
    <div class="flex flex-col gap-2 w-full">
      <div bind:this={editorEl} class="border border-tprimary-700 rounded overflow-hidden"></div>
      <div class="flex gap-2">
        <button onclick={handleSave} class="px-3 py-1.5 bg-success-800 hover:bg-success-700 text-white font-cinzel text-xs rounded cursor-pointer">
          <i class="mdi mdi-content-save mr-1"></i>Save
        </button>
        <button onclick={handleCancel} class="px-3 py-1.5 bg-background-700 hover:bg-background-600 text-tprimary font-cinzel text-xs rounded cursor-pointer"> Cancel </button>
      </div>
    </div>
  {:else}
    {@render children()}
  {/if}
</div>

<style>
  :global(.cm-editor) {
    max-height: 70vh;
  }

  :global(.cm-editor .cm-scroller) {
    font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
    font-size: 13px;
    line-height: 1.6;
  }

  :global(.cm-editor .cm-gutters) {
    border-right: 1px solid rgba(255, 255, 255, 0.08);
  }

  :global(.cm-editor.cm-focused) {
    outline: none;
  }
</style>
