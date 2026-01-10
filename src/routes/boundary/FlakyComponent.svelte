<script lang="ts">
	let position = $state({ x: 0, y: 0 });
</script>

<svelte:window
	onmousemove={(e) => {
		position.x = e.clientX;
		position.y = e.clientY;
	}}
/>

<p>
	defined as: let position = $state(&lcub; x: 0, y: 0 &rcub;); current $state = (&lcub;x:{position.x},
	y:{position.y}&rcub;)
</p>

<button onclick={() => (position = null)} style="margin:2rem 0 0 6rem;">
	clicking this button sets position to
</button>
