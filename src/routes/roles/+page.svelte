<!--
@component
Ctrl+Shift+P   Local History: Find Entry to Restore
-->

<script lang="ts">
  import { SvelteMap, SvelteSet } from 'svelte/reactivity';

  const allRoles = ['USER', 'ADMIN', 'VISITOR', 'MODERATOR'];
  const roles = new SvelteMap<string, SvelteSet<string>>();

  function roleSelected(e: MouseEvent, model?: string) {
    const el = e.target as HTMLElement;

    if (!el.classList[0]) {
      return;
    }
    switch (el.classList[0]) {
      case 'selectedRoles':
        const pe = el.parentElement as HTMLElement;
        (pe.nextElementSibling as HTMLElement)?.classList.toggle('hidden');
        break;
      case 'role-list':
        (el.nextElementSibling as HTMLElement).classList.toggle('hidden');
        break;
      default: // Svelte cryptic class name
        const role = el.innerText.match(/(\w+)\s*$/)?.[0];
        if (role && !el.classList.contains('role-list')) {
          toggleRole(model as string, role);
        }
    }
  }
  function toggleRole(model: string, role: string) {
    let set = roles.get(model);

    if (!set) {
      set = new SvelteSet<string>();
      roles.set(model, set);
    }

    if (set.has(role)) {
      set.delete(role);
    } else {
      set.add(role);
    }
  }
  function dismiss(e: MouseEvent) {
    (e.target as HTMLElement)
      .querySelector('.dropdown')
      ?.classList.add('hidden');
  }
</script>

{#snippet multiSelect(model: string)}
  {@const selected = roles.get(model) ?? new SvelteSet<string>()}

  <div
    class="select-wrapper"
    aria-hidden={true}
    onclick={(e: MouseEvent) => roleSelected(e, model)}
    onmouseleave={dismiss}
  >
    <!-- selected roles -->
    <div class="role-list" aria-hidden={true}>
      {#if selected.size}
        {#each [...selected] as role}
          <span class="badge">
            {role[0]}
          </span>
        {/each}
      {:else}
        <span class="selectedRoles">none selected</span>
      {/if}
    </div>

    <!-- dropdown -->
    <div class="dropdown hidden">
      {#each allRoles as role}
        <p class:selected={selected.has(role)}>
          <span class="letter">
            {role[0]}
          </span>
          {role}
        </p>
      {/each}
    </div>
  </div>
{/snippet}

{@render multiSelect('User')}

<style lang="scss">
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
  .select-wrapper {
    width: 8rem;
    margin-left: 2rem;
    .dropdown {
      width: 100%;
      padding: 2px 1rem;
      border: 1px solid gray;
      border-radius: 6px;
      cursor: pointer;
      p {
        font-size: 10px;
        margin: 0;
        padding: 1px 0;
      }
      .letter {
        color: skyblue;
        font-size: 11px;
        border: 1px solid gray;
        border-radius: 4px;
        padding: 0 4px;
        // margin: 0 4px;
      }
    }
    .role-list {
      display: flex;
      gap: 0.4rem;

      border: 1px solid gray;
      width: 100%;
      border-radius: 4px;
      .badge {
        display: inline-block;
        color: skyblue;
        font-size: 11px;
        border: 1px solid gray;
        border-radius: 4px;
        padding: 0 2px !important;
      }
      .selectedRoles {
        display: inline-block;
        text-align: center;
        width: 8rem;
        cursor: pointer;
      }
    }

    .selected {
      opacity: 0.6;
    }
    .hidden {
      display: none;
    }
  }
</style>
