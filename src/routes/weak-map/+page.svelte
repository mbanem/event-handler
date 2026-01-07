<script lang='ts'>
  import { onMount, onDestroy } from 'svelte';
  // import { createEventHandlerManager } from '$lib/weakmap-delegation'
  // const handlerManager = createEventHandlerManager();

  const TEventType = {
    click: 'click',
    mouseover: 'mouseover',
    mouseout: 'mouseout'
  } as const;

  type TEventType = typeof TEventType[keyof typeof TEventType];
  let etypeEl: HTMLElement | null = null;
  let disabled = true;
  let eventType = ''; // track current value

	// Track all elements we've attached listeners to
  const managedElements = new Set<HTMLElement>();

	// Store per-element listeners
  const elementListeners = new WeakMap<
    HTMLElement,
    Map<string, { listener: (e: Event) => void }>
  >();

  /**
   * returns the event handler for a given element and event type
  */
  function getEventHandler(element:HTMLElement|string, eventType:string){
    const target = resolveElement(element)
    const map = elementListeners.get(target)
    return map.get(eventType).callback
  }
  /**
   * resolve element arg if given query selector string or return it if object
  */
  function resolveElement(element:HTMLElement | string){
    if (typeof element === 'string'){
      return document.querySelector(element)
    }
    return  element
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
    const hostEl =resolveElement(element)

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
  function removeEventHandler( 
    element: HTMLElement | string,
    eventType: TEventType
  ){
    const hostEl = resolveElement(element)
    const map = elementListeners.get(hostEl)

    if (!map || !map.has(eventType)) {
      console.warn(`No handler found for event "${eventType}" on`, hostEl);
      return;
    }
    const { listener } = map.get(eventType)!;
    hostEl.removeEventListener(eventType, listener);
    map.delete(eventType);
		console.log('map.delete map.length:', map.size)
		if (map.size===0){
			console.log('and do map.clear()')
			map.clear()
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

  function setIsDisabled(e: KeyboardEvent|MouseEvent) {
    event.preventDefault();
    const target = e.target as HTMLInputElement;
    eventType = target.value;
    disabled = !Object.values(TEventType).includes(eventType as any);
  }

  // Callbacks
  function onClick() { console.log('click!'); }
  function onMouseOver() { console.log('mouseover!'); }
  function onMouseOut() { console.log('mouseout!'); }

	// attach event handlers
  onMount(() => {
    // handlerManager.setup('#theList', 'click', '.pp', onClick);
    // etypeEl = document.getElementById('etype')
    setupEventHandler('#theList', 'click', '.pp', onClick);
    setupEventHandler('#theList', 'mouseover', '.tt', onMouseOver);
    setupEventHandler('#theList', 'mouseout', '.tt', onMouseOut);
  });
  onDestroy(cleanup);
  // onDestroy(() => {
  //   handlerManager.destroy(); // ← runs cleanup
  // });

  // function removeClick() {
  //   handlerManager.remove('#theList', 'click');
  // }
</script>

<!-- dismantling the handlers is possible on demand -->
<button onclick={cleanup}>kill WeakMap</button>

<input id='etype' onkeyup={setIsDisabled} placeholder='eventType'/>
<button disabled={disabled} onclick={() => removeEventHandler('#theList', eventType)}>remove eventType handler</button>
<button onclick={()=> disabled=!disabled}>toggle disabled</button>

<!-- wrapper for elements to obtain event handlers -->
<div id='theList'>
  <p class='tt'>The First Paragraph</p>
  <p class='tt'>The Second Paragraph</p>
  <p class='pp'>The Third Paragraph</p>
  <p class='tt'>The Fourth Paragraph</p>
</div>

<style>
  p { cursor: pointer; }
  .pp { color: navy; }
  .tt { color: green; }
</style>