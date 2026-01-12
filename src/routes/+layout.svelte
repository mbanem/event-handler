<script lang="ts">
	import { onMount } from 'svelte';
	import { setContext } from 'svelte';
	let { children } = $props();
	// let navbar: HTMLDivElement | null = null;
	// onMount(() => {
	// 	navbar = document.querySelector('.nav-bar');
	// 	setContext('navbar', navbar);
	// });
</script>

<div class="nav-bar">
	<a href="/weak-map">Weak Map</a>
	<a href="/crud-support">CRUD Support</a>
	<a href="/static-class-model">Static Class Model</a>
	<a href="/sort-record">Sort Record</a>
	<a href="/regex-model">RegExp Model</a>
	<a href="/handle-model">Handle Model</a>
	<a href="/types">Types</a>
	<a href="/parse-prisma">Parse Prisma</a>
	<a href="/dots-on-click">Dots on Click</a>
	<a href="/boundary">Boundary</a>
	<a href="/drag-drop-event-handler">Drag-Drop-Event-Handler</a>
	<a href="/">Home</a>
</div>
{@render children()}

<style lang="scss">
	.nav-bar {
		padding: 0 0 5px 0;
		margin: 0 0 5px 0;
	}
	a {
		display: inline-block;
		// border: 1px solid gray;
		// border-radius: 5px;
		padding: 3px 0.5rem;
		color: navy;
		text-decoration: none;
		text-align: center;
		user-select: none;
		cursor: pointer;

		&:hover,
		&:focus-visible {
			color: blue;
		}

		&:active {
			color: tomato;
		}
	}
</style>
