<script lang="ts">
	type TProps = {
		labelText: string;
		isChecked?: boolean;
		lineClicked?: (newState: boolean) => void;
	};

	let { labelText, isChecked, lineClicked } = $props<TProps>();

	// Better validation — runs after the component is mounted
	// $effect(() => {
	if (isChecked === undefined && !lineClicked) {
		console.error(
			`[ClickableLine] "${labelText}" → At least one of these is required:\n`,
			`   bind:isChecked={...}   or   lineClicked={(state) => ...}`
		);
	}
	// });

	function handleToggle(checked: boolean) {
		lineClicked?.(checked);
	}
</script>

<label class="toggler-label">
	<input type="checkbox" bind:checked={isChecked} onchange={(e) => handleToggle(e.currentTarget.checked)} />
	<span class="toggler">{labelText}</span>
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
