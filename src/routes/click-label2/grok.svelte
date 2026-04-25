<script lang="ts">
	type TProps = {
		labelText: string;
		/** Two-way binding for checkbox state */
		isChecked?: boolean | undefined;
		/** Alternative: callback when toggled */
		lineClicked?: (newState: boolean) => void;
	};

	// No default on $bindable → isChecked stays undefined if not passed
	let { labelText, isChecked = $bindable<boolean>(), lineClicked }: TProps = $props();

	console.log('isChecked', isChecked);
	console.log('lineClicked', lineClicked);
	// Runtime validation: at least one control method must be provided
	// $effect(() => {
	if (isChecked === undefined && lineClicked === undefined) {
		console.error(
			`[ClickableLine] ERROR: "${labelText}"\n` +
				`At least one of these props is required:\n` +
				`   • bind:isChecked={yourState}\n` +
				`   • lineClicked={(state) => ...}\n` +
				`The line will not respond to clicks otherwise.`
		);
	}
	// });

	function handleChange(checked: boolean) {
		// Call callback if provided
		lineClicked?.(checked);
		// isChecked updates automatically via binding when used
	}
</script>

<label class="toggler-label">
	<input type="checkbox" bind:checked={isChecked} onchange={(e) => handleChange(e.currentTarget.checked)} />
	<span class="toggler">
		{labelText}
	</span>
</label>

<style>
	.toggler-label {
		display: block;
		cursor: pointer;
		user-select: none;
	}

	.toggler {
		font-size: 14px;
		color: navy;
		transition: color 0.2s ease;
	}

	.toggler-label input[type='checkbox'] {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
	}

	.toggler-label input[type='checkbox']:checked + .toggler {
		color: tomato;
	}
</style>
