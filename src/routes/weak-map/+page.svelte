<script lang="ts">
	import { onMount } from 'svelte';
	import { CEvent, type TEventType } from '$lib/utils';
	import { createEventHandler } from '$lib/utils';
	let eventListEl: HTMLDivElement;
	let blockParent: HTMLDivElement;
	let contEl: HTMLSelectElement | null = null;
	let count = $state(0);
	let selectEl: HTMLSelectElement | null = null;
	const eh = createEventHandler();

	const scroll = (el: HTMLDivElement) => {
		const els = el.children;
		const max = 50;
		if (els.length > max) {
			for (let i = 0; i < max / 2; i++) {
				els[0].remove(); // always delete the top one
			}
			eventListEl.style.color = eventListEl.style.color === 'navy' ? 'green' : 'navy';
		}
		count = listLength = els.length;
		if (el.offsetHeight + el.scrollTop > el.getBoundingClientRect().height - 20) {
			setTimeout(() => {
				el.scrollTo(0, el.scrollHeight);
			}, 0);
		}
	};

	function handleList(e: MouseEvent) {
		(eventListEl as HTMLDivElement).innerHTML += `${e.type}!<br/>`;
		scroll(eventListEl);
	}
	// Callbacks
	function onClick(e: MouseEvent) {
		console.log('onClick Handler');
		handleList(e);
	}
	function onClickA(e: MouseEvent) {
		// console.log('onClickA', (e.target as HTMLDivElement).innerText);
		handleList(e);
	}
	function onMouseOver(e: MouseEvent) {
		handleList(e);
	}
	function onMouseOverA(e: MouseEvent) {
		// console.log('onMouseOverA', (e.target as HTMLDivElement).innerText);
		handleList(e);
	}
	function onMouseOut(e: MouseEvent) {
		handleList(e);
	}
	function onMouseOutA(e: MouseEvent) {
		// console.log('onMouseOutA', (e.target as HTMLDivElement).innerText);
		handleList(e);
	}
	let listLength = $state(0);
	const selectOptions = {
		null: 'Select Event to remove it handler',
		mouseout: 'Remove mouseout Handler',
		click: 'Remove click Handler',
		mouseover: 'Remove mouseover Handler'
	};

	// onDestroy(() => {
	//   handlerManager.destroy(); // ← runs cleanup
	// });

	// function removeClick() {
	//   handlerManager.remove('#blockParent', 'click');
	// }
	// let eventType:TEventType | '' = ''
	function remove() {
		if (!blockParent) return;
		const eventType = selectEl?.options[selectEl?.selectedIndex].value as TEventType;
		const type = Object.keys(CEvent as unknown as TEventType).find((t) => t === eventType);
		const regex = new RegExp(`\\/?${type}\\/?`, 'g');
		eh.remove('#blockParent', eventType as TEventType);
		blockParent.innerHTML = blockParent.innerHTML.replace(regex, '');
		if (selectEl && selectEl.selectedIndex !== -1) {
			selectEl.remove(selectEl.selectedIndex);
		}
	}
	// attach event handlers
	onMount(() => {
		eventListEl = document.getElementById('eventListId') as HTMLDivElement;
		eventListEl.style.color = 'navy';
		blockParent = document.getElementById('blockParent') as HTMLDivElement;
		contEl = document.getElementById('cont') as HTMLDivElement;
		// handlerManager.setup('#blockParent', 'click', '.pp', onClick);
		// etypeEl = document.getElementById('etype')
		eh.setup('#blockParent', { click: onClick, mouseover: onMouseOver, mouseout: onMouseOut });
		eh.setup('.conta', { click: onClickA, mouseover: onMouseOverA, mouseout: onMouseOutA });

		return () => {
			eh.destroy();
		};
	});
</script>

<!-- dismantling the handlers is possible on demand -->
<button onclick={eh.destroy} style="margin-top:1rem;">kill WeakMap</button>

<!-- <input id="etype" onkeyup={setIsDisabled} placeholder="eventType" /> -->
<select bind:this={selectEl} onchange={remove}>
	{#each Object.entries(selectOptions) as [key, value] (key)}
		<option value={key}>{value}</option>
	{/each}
</select>
<!-- <button {disabled} onclick={() => remove('#blockParent', eventType as TEventType)}>
	remove eventType handler
</button> -->
<!-- <button onclick={() => (disabled = !disabled)}>toggle disabled</button> -->

<!-- wrapper for elements to obtain event handlers -->
<div class="grid-wrapper">
	<div id="blockParent">
		<p data-event-list="mouseover mouseout">The First Paragraph mouseover mouseout</p>
		<p data-event-list="click mouseover">The Second Paragraph click mouseover</p>
		<p data-event-list="click">The Third Paragraph click</p>
		<p data-event-list="click mouseover mouseout">The Fourth Paragraph click mouseover mouseout</p>
	</div>
	<div class="right-column">
		<p>list length: {listLength}</p>
		<div id="eventListId" class="event-list"></div>
	</div>
</div>

<div class="conta" id="cont">
	<div data-event-list="click">Paragraph One -- click</div>
	<div data-event-list="mouseover">Paragraph Two -- mouseover</div>
	<div data-event-list="click mouseover mouseout">
		Paragraph Three -- click, mouseover, mouseout
	</div>
	<div data-event-list="mouseout">Paragraph Four -- mouseout</div>
</div>

<style>
	.grid-wrapper {
		display: grid;
		grid-template-columns: 20rem 10rem;
		gap: 1rem;
	}
	#blockParent,
	.right-column {
		border: 1px solid gray;
		border-radius: 10px;
	}
	.right-column {
		position: relative;
		p {
			position: absolute;
			top: -1.8rem;
			left: 0.5rem;
			padding: 3px 0.5rem;
			background-color: white;
			z-index: 3;
		}
	}
	.event-list {
		height: 10rem;
		overflow-y: auto;
		padding: 1rem;
		&::before {
			position: absolute;
			content: ' ';
			top: 0;
			left: 0;
			border-radius: 12px;
			height: 1rem;
			width: 100%;
			opacity: 1;
			background-color: white;
			z-index: 2;
		}
	}
	p {
		cursor: pointer;
	}
	.conta {
		color: green;
		padding: 1rem;
		border: 1px solid gray;
		border-radius: 6px;
		width: max-content;
		margin-top: 1rem;
		div {
			padding: 2px 0;
			cursor: pointer;
		}
	}
</style>
