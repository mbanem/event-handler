<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Model } from '../model/function.svelte';
	import type { TEventType } from '$lib/utils';
	import type {
		TUI,
		Field,
		UIType,
		Model,
		Models,
		TEventHandler,
		TParseReturn,
		Model
	} from './schema-parser.ts-xxx';

	// Error: Failed to load url /home/mili/TEST/event-handler/src/routes/crud-extension/schema-parser/getPrismaModels (resolved id: /home/mili/TEST/event-handler/src/routes/crud-extension/schema-parser/getPrismaModels). Does the file exist?
	const { UI, uiModels, nuiModels, eventHandler } =
		(await import('./schema-parser/getPrismaModels')) as TParseReturn;

	let x1: TUI, x2: Field, x3: UIType, x4: Model, x5: Models, x6: TParseReturn;
	console.log(uiModels, nuiModels);
	let etypeEl: HTMLElement | null = null;
	let disabled = true;
	let eventType = ''; // track current value
	let blockParent: HTMLDivElement | null = null;
	let selectEl: HTMLSelectElement | null = null;
	let eventListEl: HTMLDivelement | null = null;
	let listLength = $state(0);
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
				els[0].eventHandler.remove(); // always delete the top one
			}
		}
		if (el.offsetHeight + el.scrollTop > el.getBoundingClientRect().height - 20) {
			setTimeout(() => {
				el.scrollTo(0, el.scrollHeight);
			}, 0);
		}
	};
	// Callbacks
	function onClick() {
		eventListEl.innerHTML += 'click!<br/>';
		scroll(eventListEl as HTMLDivElement);
	}
	function onMouseOver() {
		eventListEl.innerHTML += 'mouseover!<br/>';
		scroll(eventListEl as HTMLDivElement);
	}
	function onMouseOut() {
		eventListEl.innerHTML += 'mouseout!<br/>';
		scroll(eventListEl as HTMLDivElement);
	}
	function remove() {
		if (!blockParent) return;
		const eventType = selectEl?.options[selectEl?.selectedIndex].value as TEventType;
		const type = Object.keys(UI).find((t) => t === eventType);
		const regex = new RegExp(`\\/?${type}\\/?`, 'g');
		eventHandler.remove('#blockParent', eventType as TEventType);
		blockParent.innerHTML = blockParent.innerHTML.replace(regex, '');
		if (selectEl && selectEl.selectedIndex !== -1) {
			selectEl.remove(selectEl.selectedIndex);
		}
	}
	onMount(() => {
		eventListEl = document.getElementById('eventListId');
		blockParent = document.getElementById('blockParent') as HTMLDivElement;
		// handlerManager.setup('#blockParent', 'click', '.pp', onClick);
		// etypeEl = document.getElementById('etype')
		eventHandler.setup('#blockParent', 'click', onClick, '.pp');
		eventHandler.setup('#blockParent', 'mouseover', onMouseOver, '.tt');
		eventHandler.setup('#blockParent', 'mouseout', onMouseOut, '.tt');
	});
	onDestroy(eventHandler.destroy);
</script>

<div class="main"></div>
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

<style lang="scss">
	.main {
		margin: 3rem 0 0 1rem;
		border: 1px solid gray;
		border-radius: 10px;
	}
</style>
