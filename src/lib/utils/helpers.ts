// import { browser } from '$app/environment'
export const handleTryCatch = (err: unknown, info?: string) => {
  const msg = err instanceof Error ? err.message : String(err)
  console.log(info, msg)
}

export const sleep = async (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // ms here is a dummy but required by
      // resolve to send out some value
      resolve(ms)
    }, ms)
  })
}
// utils/dragReorder.ts

/**
 * Enables drag-to-reorder for direct children of a container
 * @param container The parent element (e.g., #fieldsListId)
 * @param querySelector is element draggable
 */
export function enableDragDrop(
  container: HTMLElement,

) {
  let draggedEl: HTMLElement | null = null

  const handleDragStart = (e: DragEvent) => {
    const target = e.target as HTMLElement
    if (!target.classList.contains(querySelector)) return

    draggedEl = target
    // Optional: add visual feedback
    target.style.opacity = '0.5'
    e.dataTransfer?.setData('text/plain', '') // required for Firefox
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault() // essential!
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    if (!draggedEl) return

    const dropTarget = e.target as HTMLElement
    const validTarget = dropTarget.classList.contains(quaerySelector)
      ? dropTarget
      : dropTarget.closest(querySelector)

    if (!validTarget || validTarget === draggedEl) {
      resetOpacity()
      return
    }

    // Move dragged element before drop target
    container.insertBefore(draggedEl, validTarget)

    resetOpacity()
  }

  const handleDragEnd = () => {
    resetOpacity()
    draggedEl = null
  }

  const resetOpacity = () => {
    if (draggedEl) draggedEl.style.opacity = ''
  }

  // Attach listeners
  container.addEventListener('dragstart', handleDragStart)
  container.addEventListener('dragover', handleDragOver)
  container.addEventListener('drop', handleDrop)
  container.addEventListener('dragend', handleDragEnd)

  // Return cleanup function
  return () => {
    container.removeEventListener('dragstart', handleDragStart)
    container.removeEventListener('dragover', handleDragOver)
    container.removeEventListener('drop', handleDrop)
    container.removeEventListener('dragend', handleDragEnd)
  }
}