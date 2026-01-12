<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { createEventHandler } from '$lib/utils';
	// import { createEventHandler } from '$lib/utils/event-handler'
	// const handlerManager = createEventHandler();
	const eh = createEventHandler();
	export const TEvent = {
		click: 'click',
		mouseover: 'mouseover',
		mouseout: 'mouseout',
		dragstart: 'dragstart',
		dragover: 'dragover',
		dragend: 'dragend',
		drop: 'drop'
	} as const;

	export type TEventType = (typeof TEvent)[keyof typeof TEvent];
	let etypeEl: HTMLElement | null = null;
	let disabled = true;
	let eventType = ''; // track current value
	let blockParent: HTMLDivElement | null = null;
	let selectEl: HTMLSelectElement | null = null;
	let eventListEl: HTMLDivElement | null = null;
	let listLength = $state(0);
	let contEl: HTMLDivElement | null = null;

	/**
	 * scrols fields list to show the last element
	 * @param el
	 */
	const scroll = (el: HTMLDivElement) => {
		const els = eventListEl.children;
		listLength = els.length;
		const max = 50;
		if (els.length > max) {
			for (let i = 0; i < max / 2; i++) {
				els[0].remove(); // always delete the top one
			}
		}
		if (el.offsetHeight + el.scrollTop > el.getBoundingClientRect().height - 20) {
			setTimeout(() => {
				el.scrollTo(0, el.scrollHeight);
			}, 0);
		}
	};

	// function setIsDisabled(e: KeyboardEvent | MouseEvent) {
	// 	event.preventDefault();
	// 	const target = e.target as HTMLInputElement;
	// 	eventType = target.value;
	// 	disabled = !Object.values(TEventType).includes(eventType as any);
	// }

	// Callbacks
	function onClick() {
		eventListEl.innerHTML += 'click!<br/>';
		scroll(eventListEl as HTMLDivElement);
	}
	function onClickA(e: MouseEvent) {
		console.log('onClickA', e.target.innerText);
	}
	function onMouseOver() {
		eventListEl.innerHTML += 'mouseover!<br/>';
		scroll(eventListEl as HTMLDivElement);
	}
	function onMouseOverA(e: MouseEvent) {
		console.log('onMouseOverA', e.target.innerText);
	}
	function onMouseOut() {
		eventListEl.innerHTML += 'mouseout!<br/>';
		scroll(eventListEl as HTMLDivElement);
	}
	function onMouseOutA(e: MouseEvent) {
		console.log('onMouseOutA', e.target.innerText);
	}

	// attach event handlers
	onMount(() => {
		eventListEl = document.getElementById('eventListId');
		blockParent = document.getElementById('blockParent') as HTMLDivElement;
		contEl = document.getElementById('cont') as HTMLDivElement;
		// handlerManager.setup('#blockParent', 'click', '.pp', onClick);
		// etypeEl = document.getElementById('etype')
		eh.setup('#blockParent', 'click', onClick, '.pp');
		eh.setup('#blockParent', 'mouseover', onMouseOver, '.tt');
		eh.setup('#blockParent', 'mouseout', onMouseOut, '.tt');

		eh.setup('.conta', 'mouseover', onMouseOverA, '.three');
		eh.setup('.conta', 'click', onClickA, '.one,.three');
		eh.setup('.conta', 'mouseout', (event: MouseEvent) => onMouseOutA(event), '.three,.four');
	});
	onDestroy(eh.destroy);
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
		const type = Object.keys(TEvent).find((t) => t === eventType);
		const regex = new RegExp(`\\/?${type}\\/?`, 'g');
		eh.remove('#blockParent', eventType as TEventType);
		blockParent.innerHTML = blockParent.innerHTML.replace(regex, '');
		if (selectEl && selectEl.selectedIndex !== -1) {
			selectEl.remove(selectEl.selectedIndex);
		}
	}
</script>

<!-- dismantling the handlers is possible on demand -->
<button onclick={eh.destroy} style="margin-top:1rem;">kill WeakMap</button>

<!-- <input id="etype" onkeyup={setIsDisabled} placeholder="eventType" /> -->
<select bind:this={selectEl} onchange={remove}>
	<option value={undefined}>Select to clear event Handler</option>
	<option value="click">clear click handler</option>
	<option value="mouseover">clear mouseover handler</option>
	<option value="mouseout">clear mouseout handler</option>
</select>
<!-- <button {disabled} onclick={() => remove('#blockParent', eventType as TEventType)}>
	remove eventType handler
</button> -->
<!-- <button onclick={() => (disabled = !disabled)}>toggle disabled</button> -->

<!-- wrapper for elements to obtain event handlers -->
<div class="grid-wrapper">
	<div id="blockParent">
		<p class="tt">The First Paragraph mouseover/mouseout</p>
		<p class="tt">The Second Paragraph mouseover/mouseout</p>
		<p class="pp">The Third Paragraph click</p>
		<p class="tt">The Fourth Paragraph mouseover/mouseout</p>
	</div>
	<div class="right-column">
		<p>list length: {listLength}</p>
		<div id="eventListId" class="event-list"></div>
	</div>
</div>

<div class="conta" id="cont">
	<div class="one">Paragraph One -- click</div>
	<div class="two">Paragraph Two</div>
	<div class="three">Paragraph Three -- click, over, out</div>
	<div class="four">Paragraph Fourv -- out</div>
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
		color: navy;
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
	.pp {
		color: navy;
	}
	.tt {
		color: green;
	}
	.conta {
		color: red;
	}
</style>
