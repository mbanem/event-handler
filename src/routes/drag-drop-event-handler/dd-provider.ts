// utils/dragReorder.ts
import { browser } from '$app/environment'
/**
 * Enables drag-to-reorder for direct children of a container
 * @param container The parent element (e.g., #fieldsListId)
 * @param element/parent class name to qualify it as target
*/
let targets: Iterable<Element> | ArrayLike<Element>
type THandler = (() => void) | ((event: DragEvent) => void)
type THandlers = Record<string, THandler>
const handler: THandlers = {}
export function enableDragReorder(
  container: HTMLElement,
  querySelector: string
) {
  let draggedEl: HTMLElement | null = null

  const handleDragStart = (e: DragEvent) => {
    if (!browser) {
      return
    }
    console.log('dd handleDragStart', e.target.tagName)
    const target = e.target as HTMLElement as Element
    const el = document.querySelector(querySelector) as HTMLDivElement
    const targets = el.children
    if (!Array.from(targets).includes(target)) {
      return
    }
    draggedEl = target as HTMLDivElement
    // Optional: add visual feedback
    draggedEl.style.opacity = '0.5'
    e.dataTransfer?.setData('text/plain', '') // required for Firefox
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault() // essential!
    console.log('dd handleDragStart')
  }

  const handleDrop = (e: DragEvent) => {
    console.log('dd handleDrop', e.target.tagName)
    // e.preventDefault();
    if (!draggedEl) return
    let dropTarget = e.target as HTMLElement as Element

    // if (!targets.includes(dropTarget)) {
    // @ts-expect-error already initialized above
    if (!Array.from(targets).includes(dropTarget as Element)) {
      // if (!targets.includes(dropTarget.parentElement)) {
      // @ts-expect-error already initialized above
      // if (!Array.from(targets).includes(dropTarget.parentElement as Element)) {
        // resetOpacity()
        // return
      // }
      // dropTarget = dropTarget as Element
    }
    // Move dragged element before drop target
    if (e.shiftKey) {
      dropTarget.after(draggedEl)
    } else {
      container.insertBefore(draggedEl, dropTarget)
    }

    resetOpacity()
  }

  const handleDragEnd = () => {
    resetOpacity()
    draggedEl = null
  }

  const resetOpacity = () => {
    if (draggedEl) draggedEl.style.opacity = ''
  }

  // // Attach listeners
  // container.addEventListener('dragstart', handleDragStart);
  // container.addEventListener('dragover', handleDragOver);
  // container.addEventListener('drop', handleDrop);
  // container.addEventListener('dragend', handleDragEnd); 

  // Return cleanup function
  // return () => { 
  //   container.removeEventListener('dragstart', handleDragStart);
  //   container.removeEventListener('dragover', handleDragOver);
  //   container.removeEventListener('drop', handleDrop);
  //   container.removeEventListener('dragend', handleDragEnd);
  // };
  handler.handleDragStart = handleDragStart
  handler.handleDragOver = handleDragOver
  handler.handleDragEnd = handleDragEnd
  handler.handleDrop = handleDrop
  handler.resetOpacity = resetOpacity
  return handler
}