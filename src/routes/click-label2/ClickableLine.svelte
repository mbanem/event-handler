<script lang="ts">
	type TProps = {
		labelText: string;
		isChecked?: boolean;
		lineClicked?: (state: boolean) => void;
	};
	let { labelText, isChecked = $bindable<boolean>(), lineClicked }: TProps = $props();

	function onChange(checked: boolean) {
		if (isChecked !== undefined) {
			isChecked = checked;
		}
	}
</script>

{#snippet clickableLine(labelText: string)}
	<label class="toggler-label">
		{#if lineClicked !== undefined}
			<input type="checkbox" bind:checked={isChecked} onchange={(e) => lineClicked(e.currentTarget.checked)} />
		{:else}
			<input type="checkbox" bind:checked={isChecked} onchange={(e) => onChange(e.currentTarget.checked)} />
		{/if}
		<span class="toggler">
			{labelText}
		</span>
	</label>
	<style>
		:root {
			--navy: navy;
			--tomato: tomato;
		}

		.toggler-label {
			display: block;
			cursor: pointer;
			user-select: none;
		}

		.toggler {
			/* display: inline; */
			padding: 0;
			margin: 0;
			font-size: 14px;
			color: var(--navy);
			/* background: #f8f9fa; */
			transition: all 0.2s ease;
		}

		.toggler-label input[type='checkbox'] {
			position: absolute;
			opacity: 0;
			width: 0;
			height: 0;
		}

		/* When checked */
		.toggler-label input[type='checkbox']:checked + .toggler {
			color: var(--tomato);
		}
	</style>
{/snippet}

<!-- <p>is checked? {isChecked}</p> -->
{@render clickableLine(labelText)}
