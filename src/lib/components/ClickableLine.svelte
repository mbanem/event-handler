<script lang="ts">
	type TProps = {
		labelText: string;
		/** Two-way binding for checkbox state */
		isChecked?: boolean;
		/** Alternative: callback when toggled */
		callback?: { callback: typeof function; arg: string };
		cssclass?: string;
	};

	// No default on $bindable → isChecked stays undefined if not passed
	let { labelText, isChecked = $bindable<boolean>(), callback, cssclass } = $props<TProps>();

	// console.log('isChecked', isChecked);
	// console.log('callback', callback);
	// Runtime validation: at least one control method must be provided
	// $effect(() => {
	if (isChecked === undefined && callback === undefined) {
		console.error(
			`[ClickableLine] ERROR: "${labelText}"\n` +
				`At least one of these props is required:\n` +
				`   • bind:isChecked={your $tate variable}\n` +
				`   • callback={(state:boolean) => void}\n` +
				`The line will not respond to clicks otherwise.`
		);
	}
	// });

	function handleChange(checked: boolean) {
		// Call callback if provided
		callback?.callback(callback?.arg, checked);
		// isChecked updates automatically via binding when used
	}
</script>

<label class="toggler-label">
	<input type="checkbox" bind:checked={isChecked} onchange={(e) => handleChange(e.currentTarget.checked)} />
	<span class="toggler {cssclass}">
		{labelText}
	</span>
</label>

<style lang="scss">
	.toggler-label {
		position: relative;
		display: block;
		cursor: pointer;
		user-select: none;
	}

	.toggler {
		font-size: 14px;
		color: navy;
		transition: color 0.2s ease;
	}

	/* only input checkbox under ,toggle-label make hidden */
	.toggler-label input[type='checkbox'] {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
	}

	/* high specificity all the way down to the .toggler */
	.toggler-label input[type='checkbox'] {
		&:checked + .toggler {
			color: tomato;
		}
	}
	.toggler:hover::after {
		position: absolute;
		content: 'click to toggle add';
		top: -1.5rem;
		left: 3rem;
		// z-index: 12;
		padding: 0 1rem;
		background-color: cornsilk;
		border: 1px solid gray;
		border-radius: 5px;
	}
</style>
