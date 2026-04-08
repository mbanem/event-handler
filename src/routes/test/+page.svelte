<script lang='ts'>
	import {Paginator} from '@dflare/svelte-page-navigation';
	type TValue = number|boolean;
	type TProps = Record<string, TValue>;
	// let pages = 20;
  // let currentPage = 6; // It can be omitted if you want to use the default value of 0 
  // let initChunkSize = 10;
  // let initShowFirstButton = true; // It can be omitted if you want to use the default value of true 
  // let initShowLastButton = true; // It can be omitted if you want to use the default value of true
	// let showCurrentPageLabel = true; // It can be omitted if you want to use the default value of false
	let props:TProps={
		pages:20,
		currentPage:6, 
		initChunkSize:10,
		initShowFirstButton:true,
		initShowLastButton:true, 
		showCurrentPageLabel:true
	}
	function pageChangeHandler(event:MouseEvent) {
		props.currentPage = event.detail.page;
	}

</script>

<div>
	Current Page: {(props.currentPage as number) + 1}
</div>

<Paginator 
	props
	onchange={pageChangeHandler} />

<div>
	Try resizing the width of the window
</div>

<style>
	div {
		text-align: center;
		font-size: 2.5rem;
		margin: 2rem auto;
	}
</style>

