// lib/weakmap-delegation.ts
export const ssr = false;
const TEventType = {
  click: 'click',
  mouseover: 'mouseover',
  mouseout: 'mouseout',
} as const;
type TEventType = typeof TEventType[keyof typeof TEventType];

let etypeEl: HTMLElement | null = null;
let disabled = true;
let eventType = ''; // track current value
/**
 * resolve element arg if given query selector string or return it if object
*/
function resolveElement(element:HTMLElement | string){
  if (typeof element === 'string'){
    return document.querySelector(element)
  }
  return  element
}

// Pure functions — no Svelte runes!
export const createEventHandlerManager = () => {
  const managedElements = new Set<HTMLElement>();
 // Store per-element listeners
  const elementListeners = new WeakMap<
    HTMLElement,
    Map<string, { listener: (e: Event) => void }>
  >();

  return {
    setup: (
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
    },
    remove: ( 
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

      if (map.size === 0) {
        managedElements.delete(hostEl);
        elementListeners.delete(hostEl); // optional: clean up WeakMap too
      }
    },
    destroy: () => {
      // cleanup logic (no onDestroy here!)
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
  };
}