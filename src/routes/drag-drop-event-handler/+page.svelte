<script lang="ts">
	export const ssr = false;
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { enableDragReorder } from './dd-provider';
	import { createEventHandler } from '$lib/utils/event-handler';
	// const fieldName = 'firstName: string';
	const eh = createEventHandler();
	// console.log('createEventHandler done')
	let dd = null;
	let contEl: HTMLDivElement | null = null;
	const fieldNames = [
		'id: string',
		'firstName: string',
		'lastName: string',
		'email: string',
		'role: Role',
		'updatedAt: Date'
	];
	function onMouseOver(e: MouseEvent) {
		console.log('page mouseover', e.target.innerText);
	}
	function onMouseOut(e: MouseEvent) {
		console.log('page mouseout', e.target.innerText);
	}
	function onClick(e: MouseEvent) {
		console.log('page click', e.target.innerText);
	}
	// let paragraphs: HTMLDivElement | null = null;
	onMount(() => {
		if (!browser) return;
		contEl = document.getElementById('cont') as HTMLDivElement;
		// const divEl = document.createElement('div');
		// document.body.appendChild(divEl);
		const container = document.getElementById('fieldsListId');
		if (container) {
			// dd = enableDragReorder(container, '.cr-fields-list > div');
			// console.log('+page onMount eh', eh)
			// cleanup = enableDragReorder(container, '.cr-fields-list > div');
			// eh.setup(container, 'dragstart', dd.handleDragStart, 'x');
			// eh.setup(container, 'dragover', dd.handleDragOver, 'x');
			// eh.setup(container, 'dragend', dd.handleDragEnd, 'x');
			// eh.setup(container, 'drop', dd.handleDrop, 'x');
		}
		if (eh) {
			eh.setup(contEl, 'mouseover', onMouseOver, 'three');
			eh.setup(contEl, 'click', onClick, 'two');
			eh.setup(contEl, 'mouseout', (event: MouseEvent) => onMouseOut(event), 'three');
		}
	});
</script>

<div class="cr-fields-list" id="fieldsListId">
	{#each fieldNames as fieldName (fieldName)}
		<div class="x" draggable="true">
			<span>{fieldName}</span>
		</div>
	{/each}
</div>
<div class="wrapper" id="cont">
	<div class="one">Paragraph One</div>
	<div class="two">Paragraph Two</div>
	<div class="three">Paragraph Three</div>
	<div class="one">Paragraph Four</div>
</div>

<style lang="scss">
	:global(.cr-fields-list) {
		display: grid;
		grid-template-rows: 1.3rem;
		grid-auto-rows: 1.3rem;
		cursor: pointer;
		text-align: center;
		padding: 0;
		margin: 0 0 2rem 0;
		color: navy;
		:global(div) {
			background-color: #f0f8ff;
			border: 1px solid #ccc;
			display: flex;
			align-items: center;
			justify-content: center;
			width: 10rem;
		}
		:global(div:first-child) {
			border-top-left-radius: 10px;
			border-top-right-radius: 10px;
		}
		:global(div:last-child) {
			border-bottom-left-radius: 10px;
			border-bottom-right-radius: 10px;
		}
	}
	:global(.x) {
		font-style: italic;
	}
	.two {
		font-style: italic;
	}
	.one {
		color: red;
	}
	.three {
		text-transform: uppercase;
	}
	.wrapper {
		div {
			padding: 3px 1rem;
			margin: 0.5rem 1.5rem;
		}
	}
</style>
