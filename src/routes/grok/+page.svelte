<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { createEventHandler } from './event-handler.ts';

	const eventHandler = createEventHandler();

	function handleClick(e: MouseEvent) {
		console.log('Clicked!', (e.target as HTMLElement).innerText);
	}
	function handleMouseOver(e: MouseEvent) {
		console.log('Over!', (e.target as HTMLElement).innerText);
	}
	function handleMouseOut(e: MouseEvent) {
		console.log('Out!', (e.target as HTMLElement).innerText);
	}
	onMount(() => {
		eventHandler.setup('.middle-column', {
			click: handleClick,
			mouseover: handleMouseOver,
			mouseout: handleMouseOut
		});
		eventHandler.setup('.right-column', {
			click: handleClick,
			// mouseover: handleMouseOver,
			mouseout: handleMouseOut
		});
		eventHandler.setup('.drag-drop');
		eventHandler.setup('.first-drop');

		// if (typeof window !== 'undefined') {
		// 	console.log(localStorage.getItem('on destroy'));
		// 	console.log(localStorage.getItem('drag-drop'));
		// 	for (let i = 1; i < 3; i++) {
		// 		console.log(`drag-drop-${i}`, localStorage.getItem(`drag-drop-${i}`));
		// 	}
		// }
	});
	onDestroy(() => {
		eventHandler.destroy();
	});
</script>

<div class="grid-wrapper">
	<div class="first-drop">
		<p>SECTION One</p>
		<p>SECTION Two</p>
		<p>SECTION Three</p>
		<p>SECTION Four</p>
		<p>SECTION Five</p>
	</div>
	<div class="middle-column">
		<div data-event-list="click mouseout">Click & mouseout</div>
		<div data-event-list="click">Only clickable</div>
		<div data-event-list="click mouseover mouseout">click mouseover mouseout</div>
	</div>
	<div class="right-column">
		<div data-event-list="click ">Click</div>
		<div data-event-list="click mouseout">click mouseout</div>
		<div data-event-list="click mouseover">click mouseover</div>
	</div>
	<div class="drag-drop">
		<p>Paragraph One</p>
		<p>Paragraph Two</p>
		<p>Paragraph Three</p>
		<p>Paragraph Four</p>
		<p>Paragraph Five</p>
	</div>
</div>

<style lang="scss">
	.grid-wrapper {
		display: grid;
		grid-template-columns: repeat(4, 14rem);
		gap: 1rem;
	}
	.middle-column,
	.right-column,
	.drag-drop,
	.first-drop {
		padding: 1rem;
		width: max-content;
		border: 1px solid gray;
		border-radius: 8px;
		background-color: cornsilk;
		width: 12rem;
		div,
		p {
			padding: 1px 0;
			margin-top: 5px;
			cursor: pointer;
			&:hover {
				background-color: yellow;
			}
		}
	}
	.right-column {
		background-color: skyblue;
	}
	.drag-drop {
		background-color: lightgreen;
	}
	.first-drop {
		background-color: aqua;
	}
</style>
