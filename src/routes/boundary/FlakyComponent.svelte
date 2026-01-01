<script lang="ts">
	let mouse = $state({ x: 0, y: 0 });
</script>

<svelte:window
	onmousemove={(e: MouseEvent) => {
		mouse = { x: e.clientX, y: e.clientY };
	}}
/>

<p>Mouse Position ({mouse.x} x {mouse.y})</p>
<!-- set mouse to unacceptable type to throw an error
		if error is not handled the app woulf crash
		but <svelte:boundary> could handle that
-->
<button onclick={() => (mouse = null)}> whatever you do, don't click this button </button>
