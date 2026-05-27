<script lang="ts">
	import ShowMessage from '$lib/components/CRShowMessage.svelte';
	let sm: ShowMessage;
	function getVal() {
		return Math.floor(Math.random() * 300 + 50);
	}
	let x = 0;
	let y = 0;
</script>

<ShowMessage bind:this={sm} />
<div
	onclick={(e: MouseEvent) =>
		sm?.showMessage(e, `Random Position at (x: ${(x = getVal())}, y: ${(y = getVal())})`, {
			x: `${x}`,
			y: `${y}`,
			color: 'navy',
		})}
	class="div-button"
	aria-hidden={true}
>
	show message
</div>

<div onclick={(e: MouseEvent) => sm.showMessage(e, 'Login model deleted')} class="div-button" aria-hidden={true}>
	show another message
</div>
<div
	onclick={(e: MouseEvent) => sm.showMessage(e, 'Turn the engine off, please')}
	class="div-button"
	aria-hidden={true}
>
	turning engine off
</div>

<style lang="scss">
	.msg {
		transition: opacity 0.5s ease-in;
	}
	.div-button {
		margin: 10rem 0 0 10rem;
		border: 1px solid gray;
		border-radius: 5px;
		background-color: aliceblue;
		color: navy;
		width: max-content;
		padding: 2px 1rem;
		text-align: center;
		cursor: pointer;
	}
</style>
