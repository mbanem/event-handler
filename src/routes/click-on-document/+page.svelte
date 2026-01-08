<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	let msgEl: HTMLParagraphElement | null = null;
	function mousePosition(event: MouseEvent) {
		// console.log(event.clientX, event.clientY);
		if (msgEl) {
			msgEl.innerText = `(Mouse(x,y) = (${event.clientX}, ${event.clientY})`;
		}
	}

	onMount(() => {
		document.addEventListener('click', mousePosition);

		if (browser) {
			msgEl = document.getElementById('msg') as HTMLParagraphElement;
		}
		return () => {
			document.removeEventListener('click', mousePosition);
		};
	});
</script>

<h4>Click on document enywhere to show the point coordinates</h4>
<p id="msg"></p>
