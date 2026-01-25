<script lang="ts">
	import { onMount } from 'svelte';
	import { resolveElement, createEventHandler, type TEventType } from '$lib/utils';

	type THandler = (event: MouseEvent) => void;
	type THandlers = Record<string, THandler>;
	// type TParams = Record<string, THandlers>;
	let eventListEl: HTMLDivElement;
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
		listLength = els.length;
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
		handleList(e);
	}
	function onClickA(e: MouseEvent) {
		handleList(e);
	}
	function onMouseOver(e: MouseEvent) {
		handleList(e);
	}
	function onMouseOverA(e: MouseEvent) {
		handleList(e);
	}
	function onMouseOut(e: MouseEvent) {
		handleList(e);
	}
	function onMouseOutA(e: MouseEvent) {
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
	function getSelectedOptionDetails() {
		const selOption = (selectEl as HTMLSelectElement).options[
			(selectEl as HTMLSelectElement).selectedIndex
		] as HTMLOptionElement;
		const optionText = selOption.text;
		const groupText =
			((selOption as HTMLOptionElement).parentNode as HTMLOptGroupElement).label || 'No Group';
	}
	function removeSelected() {
		const selOption = (selectEl as HTMLSelectElement).options[
			(selectEl as HTMLSelectElement).selectedIndex
		] as HTMLOptionElement;
		const group = (selOption.parentElement as HTMLOptGroupElement).label || '';
		eh.remove(resolveElement(group) as HTMLElement, selOption.value as TEventType);
		const itemText = selOption.innerText;
		if (options[group]) {
			options[group] = options[group].filter((el) => el !== itemText);
			if (options[group].length === 0) {
				delete options[group];
			}
		} else {
			delete options[itemText];
		}
	}
	let options: Record<string, string[]> = $state({});
	function selectAndSetup(selector: HTMLElement | string, handlers: THandlers) {
		const wrapper = resolveElement(selector) as HTMLElement;
		let group = '';
		if (wrapper.id) {
			group = wrapper.id;
		} else if (wrapper.classList) {
			group = wrapper.classList[0];
		}
		const eventTypes = [];
		for (const eventType of Object.keys(handlers)) {
			eventTypes.push(eventType);
		}
		options[group] = eventTypes; //Object.keys(handler);
	}
	// attach event handlers
	onMount(() => {
		eventListEl = document.getElementById('eventListId') as HTMLDivElement;
		eventListEl.style.color = 'navy';
		// handlerManager.setup('#blockParent', 'click', '.pp', onClick);
		// etypeEl = document.getElementById('etype')
		selectAndSetup('#blockParent', {
			click: onClick,
			mouseover: onMouseOver,
			mouseout: onMouseOut
		});
		selectAndSetup('.conta', { click: onClickA, mouseover: onMouseOverA, mouseout: onMouseOutA });
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
<select bind:this={selectEl} class="select-list">
	{#each Object.entries(options) as [group, eventTypes] (group)}
		<optgroup label={group}>
			{#each eventTypes as eventType (eventType)}
				<option value={eventType}>{eventType}</option>
			{/each}
		</optgroup>
	{/each}
</select>
<button onclick={removeSelected}>remove selected</button>

<!-- wrapper for elements to obtain event handlers -->
<div class="grid-wrapper">
	<div id="blockParent" class="mass">
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
	.select-list {
		margin: 0;
		padding: 0;
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
