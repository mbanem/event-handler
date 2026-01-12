// lib/utils/event-helper.ts
// import { browser } from '$app/environment'
import * as utils from '$lib/utils'
import type { TEventType, TMap } from '$lib/utils'
// ✅ Keep type definitions
export const TEvent = {
  click: 'click',
  mouseover: 'mouseover',
  mouseout: 'mouseout',
  dragstart: 'dragstart',
  dragover: 'dragover',
  dragend: 'dragend',
  drop: 'drop',
} as const

export type TEventHandlerReturnValue = () => {
  setup(element: string | HTMLElement, eventType: TEventType, callback: (event: MouseEvent) => void, querySelector?: string): void
  remove(element: HTMLElement | string, eventType: TEventType): void
  destroy(): void
}

// ✅ Pure factory function 
export const createEventHandler = () => {
  const managedElements = new Set<HTMLElement>()
  const elementListeners = new WeakMap<HTMLElement, TMap>()

  function findMatchingChild(target: HTMLElement, querySelector: string) {

    for (const el of Array.from(target.children)) {
      if (el.classList.contains(querySelector)) {
        return el
      }
    }
    return null
  }
  return {
    setup(
      element: HTMLElement | string,
      eventType: TEventType,
      callback: (event: Event) => void,
      querySelector?: string
    ) {
      const hostEl = utils.resolveElement(element)
      if (!hostEl) {
        throw new Error(`eh Element not found: ${element}`)
      }

      if (!elementListeners.has(hostEl)) {
        elementListeners.set(hostEl, new Map())
        managedElements.add(hostEl)
      }
      const eventMap = elementListeners.get(hostEl)!

      if (eventMap.has(eventType)) {
        return
      }
      const listener = (event: Event) => {
        let target = event.target as HTMLElement
        if (querySelector) {
          if (target.matches(querySelector)) {
            callback(event)
          } else {
            const child = findMatchingChild(target, querySelector)
            if (child) {
              target = child as HTMLElement
            }
          }
        } else {
          console.log('eh call anyhow')
          callback(event)
        }
      }

      eventMap.set(eventType, { callback, listener, querySelector })
      hostEl.addEventListener(eventType, listener)
    },

    remove(element: HTMLElement | string, eventType: TEventType) {
      const hostEl = utils.resolveElement(element)
      const map = elementListeners.get(hostEl as HTMLElement)

      if (!map || !map.has(eventType)) {
        console.log(`No handler found for event "${eventType}" on`, hostEl)
        return
      }

      const { listener } = map.get(eventType)!;
      (hostEl as HTMLElement).removeEventListener(eventType, listener)
      map.delete(eventType)

      if (map.size === 0) {
        managedElements.delete(hostEl as HTMLElement)
        elementListeners.delete(hostEl as HTMLElement)
      }
    },

    destroy() {
      managedElements.forEach((element) => {
        const eventMap = elementListeners.get(element)
        if (eventMap) {
          eventMap.forEach(({ listener }, eventType) => {
            element.removeEventListener(eventType, listener)
          })
        }
      })
      managedElements.clear()
    }
  }
}