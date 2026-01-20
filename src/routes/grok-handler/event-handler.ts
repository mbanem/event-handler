// event-handler.ts (updated version)
type SupportedMouseEvent =
  | 'click'
  | 'dblclick'
  | 'mousedown'
  | 'mouseup'
  | 'mousemove'
  | 'mouseover'
  | 'mouseout'
  | 'mouseenter'
  | 'mouseleave'
  | 'contextmenu'

type THandlers = Partial<Record<SupportedMouseEvent, (e: MouseEvent) => void>>

type TWrapper = HTMLElement | string

interface EventConfig {
  element: HTMLElement
  events: Set<SupportedMouseEvent>
}

class EventHandler {
  private wrapper: HTMLElement | null = null;
  private supportedHandlers: THandlers = {};
  private childConfigs: Map<HTMLElement, EventConfig> = new Map();
  private boundHandlers: Map<SupportedMouseEvent, EventListener> = new Map();  // NEW: to store bound functions for proper removal

  /**
   * Set up event delegation
   * @param wrapper - container element or CSS selector
   * @param handlers - event handlers for supported mouse events
   */
  setup(wrapper: TWrapper, handlers: THandlers): void {
    // Resolve wrapper element
    this.wrapper = this.resolveWrapper(wrapper)
    if (!this.wrapper) {
      console.warn('EventHandler: Could not resolve wrapper element')
      return
    }

    // Remove any previous listeners (using stored bound handlers)
    this.removeAllListeners()

    // Clear previous registrations
    this.childConfigs.clear()
    this.boundHandlers.clear()

    // Store only the handlers we actually support
    this.supportedHandlers = this.filterSupportedHandlers(handlers)

    // Find all children that want event delegation
    this.registerInterestedChildren()

    // Attach delegation listeners
    this.attachDelegationListeners()
  }

  private resolveWrapper(wrapper: TWrapper): HTMLElement | null {
    if (wrapper instanceof HTMLElement) {
      return wrapper
    }
    if (typeof wrapper === 'string') {
      return document.querySelector(wrapper) as HTMLElement | null
    }
    return null
  }

  private filterSupportedHandlers(handlers: THandlers): THandlers {
    const result: THandlers = {}
    for (const [event, handler] of Object.entries(handlers)) {
      if (this.isSupportedEvent(event)) {
        result[event as SupportedMouseEvent] = handler
      }
    }
    return result
  }

  private isSupportedEvent(event: string): event is SupportedMouseEvent {
    return [
      'click', 'dblclick', 'mousedown', 'mouseup', 'mousemove',
      'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'contextmenu'
    ].includes(event)
  }

  private registerInterestedChildren(): void {
    if (!this.wrapper) return

    // Use Array.from for iterable HTMLCollection + type safety
    const children = Array.from(this.wrapper.children)
    for (const child of children) {
      if (!(child instanceof HTMLElement)) continue

      const eventListStr = child.dataset.eventList
      if (!eventListStr) continue

      const requestedEvents = new Set(
        eventListStr
          .split(/\s+/)
          .map(e => e.trim())
          .filter(e => e.length > 0)
      )

      // Only keep events we actually support and have handlers for
      const supportedEvents = new Set<SupportedMouseEvent>()
      for (const ev of requestedEvents) {
        if (this.isSupportedEvent(ev) && this.supportedHandlers[ev]) {
          supportedEvents.add(ev)
        }
      }

      if (supportedEvents.size > 0) {
        this.childConfigs.set(child, {
          element: child,
          events: supportedEvents
        })
      }
    }
  }

  private getBoundHandler(eventName: SupportedMouseEvent): EventListener {
    if (!this.boundHandlers.has(eventName)) {
      this.boundHandlers.set(eventName, this.handleEvent.bind(this) as EventListener)
    }
    return this.boundHandlers.get(eventName)!
  }

  private attachDelegationListeners(): void {
    if (!this.wrapper) return

    // We attach listeners only for events we actually have handlers for
    for (const eventName of Object.keys(this.supportedHandlers) as SupportedMouseEvent[]) {
      this.wrapper.addEventListener(eventName, this.getBoundHandler(eventName))
    }
  }

  private removeAllListeners(): void {
    if (!this.wrapper) return

    for (const [eventName, boundHandler] of this.boundHandlers) {
      this.wrapper.removeEventListener(eventName, boundHandler)
    }
    this.boundHandlers.clear()  // Clear after removal
  }

  private handleEvent(e: MouseEvent): void {
    // console.log('handleEvent called for type:', e.type)  // DEBUG: add this to confirm firing

    if (!this.wrapper) return

    const target = e.target
    if (!(target instanceof HTMLElement)) return

    // Find the closest registered child (including target itself)
    let current: HTMLElement | null = target
    while (current && current !== this.wrapper) {
      const config = this.childConfigs.get(current)
      if (config && config.events.has(e.type as SupportedMouseEvent)) {
        // console.log('Found matching child:', current)  // DEBUG
        const handler = this.supportedHandlers[e.type as SupportedMouseEvent]
        if (handler) {
          handler(e)
        }
        return // We handled it - stop bubbling up
      }
      current = current.parentElement
    }
  }

  // Optional: cleanup method
  destroy(): void {
    this.removeAllListeners()

    this.childConfigs.clear()
    this.supportedHandlers = {}
    this.wrapper = null
  }
}

export function createEventHandler(): EventHandler {
  return new EventHandler()
}

export type { SupportedMouseEvent, THandlers, TWrapper }