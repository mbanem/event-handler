<script lang='ts'>
  import { onMount, onDestroy } from 'svelte';
  import { createEventHandlerManager, TEventType } from '$lib/weakmap-helper'
  import type { TEventTypeType} from '$lib/weakmap-helper'

  // ✅ Define these!
  let disabled = true;
  let eventType = '';
  let etypeEl:TEventTypeType
  let wrapperEl:HTMLDivElement

  const handlerManager = createEventHandlerManager();
  console.log('handlerManager', handlerManager)
  
  function setIsDisabled(e: KeyboardEvent) {
    event.preventDefault();
    const target = e.target as HTMLInputElement;
    eventType = target.value;
    disabled = !Object.values(TEventType).includes(eventType as TEventTypeType);
  }

  // event handler calls those Callbacks when event fired
  function onClick() { console.log('click!'); }
  function onMouseOver() { console.log('mouseover!'); }
  function onMouseOut() { console.log('mouseout!'); }

	// attach event handlers
  onMount(() => {
    etypeEl = document.getElementById('etype')
    wrapperEl = document.querySelector('#wrapper')
    handlerManager.setup('#wrapper', 'click', '.pp', onClick);
    handlerManager.setup(wrapperEl, 'mouseover', '.tt', onMouseOver);
    handlerManager.setup(wrapperEl, 'mouseout', '.tt', onMouseOut);

    // console.log(Object.values(TEventType).includes('click' as TEventTypeType))
  });

  onDestroy(() => {
    handlerManager.destroy(); // ← runs cleanup
  });

</script>


<button onclick={cleanup}>kill WeakMap</button>

<input id='etype' onkeyup={setIsDisabled} placeholder='eventType'/>
<button disabled={disabled} onclick={() => handlerManager.remove('#wrapper', eventType)}>remove eventType handler</button>
<button onclick={()=> disabled=!disabled}>toggle disabled</button>

<!-- wrapper for elements to obtain event handlers -->
<div id='wrapper'>
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