<script lang="ts">
	import FlakyComponent from './FlakyComponent.svelte';
</script>

<svelte:boundary>
	<FlakyComponent />

	{#snippet failed(error: unknown, reset: () => void)}
		<!-- safe extraction -->
		<p>
			{error instanceof Error
				? error.message
				: typeof error === 'string'
					? error
					: JSON.stringify(error)}
		</p>

		<button onclick={reset}>oops! try again</button>
	{/snippet}
</svelte:boundary>
