<!--
@component weak-map-handlers is a halper that manages event handlers by
adding or removing them from an individual HTMLElements or on an HTML
parent element that then handles events fired on its children.

An element could event handlers for several differen types and a
handler is bound to a single element.

Adding an Event Handler
To add an event handler to HTMLElement or a parent element we use
  setupEventHandler that accepts the following arguments
    element: HTMLElement | string,
    eventType: TEventType,
    querySelector: string,
    callback: () => void
1) The element could be an HTMLElement or its a query selector string
      by which the element is located,
2) The even type is |click|mouseover|mouseout|dblclick|
3) The querySelector is used in cases firing an event on an element
      should be further restricted based on this given query selector
      as an element can dynamically change a state that affect the
      query selector selection
4)  The callback is called whan event fired

Removing an Event Handler
removeEventHandler accepts two arguments
    element: HTMLElement | string,
    eventType: TEventType
-->

<script lang='ts'>
  import { onMount, onDestroy } from 'svelte';

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

  function setIsDisabled(e: KeyboardEvent) {
    const target = e.target as HTMLInputElement;
    eventType = target.value;
    disabled = !Object.values(TEventType).includes(eventType as any);
  }

  onDestroy(cleanup);
</script>