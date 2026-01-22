<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';

	// -------- toggle theme begin ---------
	import { browser } from '$app/environment';

	// Theme type & state
	type Theme = 'light' | 'dark';

	let currentTheme: Theme = $state('light'); // Svelte 5 runes syntax
	let mounted = $state(false);

	// Get saved preference or system preference
	function getInitialTheme(): Theme {
		if (!browser) return 'light';

		const saved = localStorage.getItem('theme') as Theme | null;
		if (saved) return saved;

		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}

	// Apply theme to document
	function applyTheme() {
		document.documentElement.classList.toggle('dark');
	}

	// Toggle theme
	function toggleTheme() {
		currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
		localStorage.setItem('theme', currentTheme);
		applyTheme();
	}

	// Initialize on client
	onMount(() => {
		currentTheme = getInitialTheme();
		applyTheme();
		toggleTheme();
		mounted = true;
	});

	// Listen for system theme changes
	$effect(() => {
		if (!browser || !mounted) return;
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const handleChange = (e: MediaQueryListEvent) => {
			// Only auto-change if user hasn't manually selected a theme
			if (!localStorage.getItem('theme')) {
				currentTheme = e.matches ? 'dark' : 'light';
				applyTheme();
			}
		};

		mediaQuery.addEventListener('change', handleChange);
		return () => mediaQuery.removeEventListener('change', handleChange);
	});
	function getIcon() {
		return currentTheme === 'dark' ? '☀️' : '🌙';
	}
	// -------- toggle theme end ---------

	let { children } = $props();
	// let navbar: HTMLDivElement | null = null;
	// onMount(() => {
	// 	navbar = document.querySelector('.nav-bar');
	// 	setContext('navbar', navbar);
	// });
</script>

<main class="theme-container">
	<div class="nav-bar">
		<a href={resolve('/weak-map')}>Weak Map</a>
		<a href={resolve('/crud-support')}>CRUD Support</a>
		<a href={resolve('/static-class-model')}>Static Class Model</a>
		<a href={resolve('/sort-record')}>Sort Record</a>
		<a href={resolve('/regex-model')}>RegExp Model</a>
		<a href={resolve('/handle-model')}>Handle Model</a>
		<a href={resolve('/types')}>Types</a>
		<a href={resolve('/parse-prisma')}>Parse Prisma</a>
		<a href={resolve('/dots-on-click')}>Dots on Click</a>
		<a href={resolve('/boundary')}>Boundary</a>
		<a href={resolve('/drag-drop')}>Drag-Drop</a>
		<a href={resolve('/')}>Home</a>
		<p onclick={toggleTheme} class="icon" aria-hidden={true}>
			{getIcon()}
		</p>
	</div>
	{@render children()}
</main>

<style lang="scss">
	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box; /* Another common reset property */
	}
	.nav-bar {
		padding: 0 0 5px 0;
		margin: 0 0 5px 0;
	}
	a {
		display: inline-block;
		// border: 1px solid gray;
		border-radius: 5px;
		outline: none;
		padding: 3px 0.5rem;
		color: navy;
		background-color: skyblue;
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
	/*  applying theme  */

	.theme-container {
		min-height: 100vh;
		background: var(--bg);
		color: var(--text);
		transition:
			background 0.4s ease,
			color 0.4s ease;
	}
	.icon {
		display: inline-block;
		padding: 0;
		margin: 0;
		height: 25px;
		background-color: var(--btn-bg);
		outline: none;
		border-radius: 5px;
		cursor: pointer;
	}
</style>
