<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	// import { createEventHandler } from '$lib/utils/event-handler'
	// const handlerManager = createEventHandler();

	const TEventType = {
		click: 'click',
		mouseover: 'mouseover',
		mouseout: 'mouseout'
	} as const;

	type TEventType = (typeof TEventType)[keyof typeof TEventType];
	let etypeEl: HTMLElement | null = null;
	let disabled = true;
	let eventType = ''; // track current value
	let blockParent: HTMLDivElement | null = null;
	let selectEl: HTMLSelectElement | null = null;
	let eventListEl: HTMLDivelement | null = null;
	let listLength = $state(0);
	// Track all elements we've attached listeners to
	const managedElements = new Set<HTMLElement>();
	// Store per-element listeners
	const elementListeners = new WeakMap<
		HTMLElement,
		Map<string, { listener: (e: Event) => void }>
	>();

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

	/**
	 * returns the event handler for a given element and event type
	 */
	function getEventHandler(element: HTMLElement | string, eventType: string) {
		const target = resolveElement(element);
		const map = elementListeners.get(target);
		return map.get(eventType).callback;
	}
	/**
	 * resolve element arg if given query selector string or return it if object
	 */
	function resolveElement(element: HTMLElement | string) {
		if (typeof element === 'string') {
			return document.querySelector(element);
		}
		return element;
	}

	/**
	 * set event handler for a given element, eventType, callback
	 * and restricts to only element for a given query selector
	 */
	function setupEventHandler(
		element: HTMLElement | string,
		eventType: TEventType,
		querySelector: string,
		callback: () => void
	) {
		// Resolve element
		const hostEl = resolveElement(element);

		if (!hostEl) {
			throw new Error(`Element not found: ${element}`);
		}

		// Ensure map exists for this element
		if (!elementListeners.has(hostEl)) {
			elementListeners.set(hostEl, new Map());
			managedElements.add(hostEl); // 👈 track for cleanup
		}
		const eventMap = elementListeners.get(hostEl)!;

		// If already listening for this event on this element, skip
		if (eventMap.has(eventType)) {
			console.warn(`Event "${eventType}" already registered on`, hostEl);
			return;
		}

		// Create listener
		const listener = (e: Event) => {
			const target = e.target as HTMLElement;
			if (target.matches(querySelector)) {
				callback();
			}
		};

		// Store and attach
		eventMap.set(eventType, { querySelector, callback, listener });
		hostEl.addEventListener(eventType, listener);
	}

	/**
	 * remove event handler for a given element and eventType
	 */
	function removeEventHandler(element: HTMLElement | string, eventType: TEventType) {
		const hostEl = resolveElement(element);
		const map = elementListeners.get(hostEl);

		if (!map || !map.has(eventType)) {
			console.warn(`No handler found for event "${eventType}" on`, hostEl);
			return;
		}
		const { listener } = map.get(eventType)!;
		hostEl.removeEventListener(eventType, listener);
		map.delete(eventType);
		if (map.size === 0) {
			map.clear();
		}
	}
	// Cleanup function (called on destroy)
	function cleanup() {
		managedElements.forEach((element) => {
			const eventMap = elementListeners.get(element);
			if (eventMap) {
				eventMap.forEach(({ listener }, eventType) => {
					element.removeEventListener(eventType, listener);
				});
			}
		});
		managedElements.clear();
	}

	function setIsDisabled(e: KeyboardEvent | MouseEvent) {
		event.preventDefault();
		const target = e.target as HTMLInputElement;
		eventType = target.value;
		disabled = !Object.values(TEventType).includes(eventType as any);
	}

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

	// attach event handlers
	onMount(() => {
		eventListEl = document.getElementById('eventListId');
		blockParent = document.getElementById('blockParent') as HTMLDivElement;
		// handlerManager.setup('#blockParent', 'click', '.pp', onClick);
		// etypeEl = document.getElementById('etype')
		setupEventHandler('#blockParent', 'click', '.pp', onClick);
		setupEventHandler('#blockParent', 'mouseover', '.tt', onMouseOver);
		setupEventHandler('#blockParent', 'mouseout', '.tt', onMouseOut);
	});
	onDestroy(cleanup);
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
		const type = Object.keys(TEventType).find((t) => t === eventType);
		const regex = new RegExp(`\\/?${type}\\/?`, 'g');
		removeEventHandler('#blockParent', eventType as TEventType);
		blockParent.innerHTML = blockParent.innerHTML.replace(regex, '');
		if (selectEl && selectEl.selectedIndex !== -1) {
			selectEl.remove(selectEl.selectedIndex);
		}
	}
</script>

<!-- dismantling the handlers is possible on demand -->
<button onclick={cleanup} style="margin-top:1rem;">kill WeakMap</button>

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
</style>
