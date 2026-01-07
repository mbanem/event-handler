// lib/weakmap-delegation.ts

// ✅ Keep type definitions
export const TEventType = {  
  click: 'click',
  mouseover: 'mouseover',
  mouseout: 'mouseout'
} as const;

export type TEventTypeType = typeof TEventType[keyof typeof TEventType];

// ✅ Pure factory function
export const createEventHandlerManager = () => {
  const managedElements = new Set<HTMLElement>();
  const elementListeners = new WeakMap<
    HTMLElement,
    Map<string, { querySelector: string; callback: () => void; listener: (e: Event) => void }>
  >();

  // ✅ Helper function (no state, pure)
  function resolveElement(element: HTMLElement | string): HTMLElement | null {
    if (typeof element === 'string') {
      return document.querySelector(element);
    }
    return element;
  }
  return {
    setup(
      element: HTMLElement | string,
      eventType: TEventTypeType,
      querySelector: string,
      callback: () => void
    ) {
      const hostEl = resolveElement(element);
      if (!hostEl) {
        throw new Error(`Element not found: ${element}`);
      }

      if (!elementListeners.has(hostEl)) {
        elementListeners.set(hostEl, new Map());
        managedElements.add(hostEl);
      }
      const eventMap = elementListeners.get(hostEl)!;

      if (eventMap.has(eventType)) {
        console.warn(`Event "${eventType}" already registered on`, hostEl);
        return;
      }

      const listener = (e: Event) => {
        const target = e.target as HTMLElement;
        if (target.matches(querySelector)) {
          callback();
        }
      };

      eventMap.set(eventType, { querySelector, callback, listener });
      hostEl.addEventListener(eventType, listener);
    },

    remove(element: HTMLElement | string, eventType: TEventTypeType) {
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
        managedElements.delete(hostEl);
        elementListeners.delete(hostEl);
      }
    },

    destroy() {
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
};