<script lang="ts">
	import { onMount } from 'svelte';
	import { getCSSValue, setCSSValue } from '$lib/utils';
	let count = $state(0);
	let LRB = $state('');
	let toAddWhereEl: HTMLDivElement | null = null;
	const changeColorPseudoEle = () => {
		const root = document.querySelector(':root') as HTMLElement; //grabbing the root element
		let color = root.style.getPropertyValue('--before-background-color');
		root.style.setProperty('--before-background-color', color === 'blue' ? 'darkcyan' : 'blue');
		color = root.style.getPropertyValue('--after-background-color');
		root.style.setProperty('--after-background-color', color === 'orangered' ? 'rebeccapurple' : 'orangered');
		// Selecting the "#box::after" CSS
		// rule from rule list.

		// Change the styles of the pseudo element.
		// st1.style.backgroundColor = st1.style.backgroundColor === 'blue' ? 'orangered' : 'blue';
		// st2.style.backgroundColor = st2.style.backgroundColor == 'crimson' ? 'darkcyan' : 'crimson';
	};

	function toggleOpacity(e: MouseEvent) {
		const target = e.target as HTMLElement;
		const related = e.relatedTarget as HTMLElement | null;

		const p = target.closest('p');
		if (!p) return;
		// Ignore moves within the same <p>
		if (related && p.contains(related)) return;

		if (!toAddWhereEl) {
			toAddWhereEl = document.getElementById('ormModelTooltipId') as HTMLDivElement;
		}
		toAddWhereEl.style.top = String(p.offsetTop - p.offsetHeight) + 'px';
		toAddWhereEl.style.left = String(p.offsetLeft + 12) + 'px';
		// toAddWhereEl.style.opacity = '1';
		setCSSValue('--opacity', '1');
		console.log('toggleOpacity', p.innerText, getCSSValue('--opacity'));
	}
	function onChangeLRB() {
		console.log('onChangeLRB');
		const el = document.querySelector('input[name=LRB]:checked');
		setTimeout(async () => {
			setCSSValue('--opacity', '0');
		}, 300);
		setTimeout(async () => {
			document.querySelectorAll('input[name=LRB]').forEach((rb) => {
				(rb as HTMLInputElement).checked = false;
			});
		}, 1000);
		LRB = (el as HTMLInputElement)?.value;
	}
	onMount(() => {
		toAddWhereEl = document.querySelector('.to-add-where') as HTMLDivElement;
	});
</script>

<p>opacity {getCSSValue('--opacity')}</p>
<h2 style="color: green;">GeeksforGeeks</h2>

<h3>How to update the CSS properties of pseudo element ::after and ::before using javascript</h3>

<div id="box">Hello Geek!</div>

<br />
<button onclick={changeColorPseudoEle} style="display:block;margin-left:2rem;padding:0 1.5rem;">
	change color
</button><br />
<div class="count" style="--before-count: '{String(count)}';margin-left:2rem;">Count as ::before element</div>
<button
	onclick={() => {
		return count > 0 ? count-- : count;
	}}
	style="margin:0.2rem 0 0 2rem;padding:0;"
>
	decreament
</button>
<button onclick={() => count++} style="margin-left:10px;padding:0;"> increment </button>
<div id="schemaContainerId" onmouseover={toggleOpacity} role="status" onfocus={() => {}}>
	{#each Array(5) as _, i (10 * i)}
		<p>field number {i + 10}</p>
	{/each}
	<div class="to-add-where">
		<div class="radio-wrapper">
			<label><input type="radio" name="LRB" value="L" onchange={onChangeLRB} />Login</label>
			<label><input type="radio" name="LRB" value="R" onchange={onChangeLRB} />Register</label>
			<label><input type="radio" name="LRB" value="LR" onchange={onChangeLRB} />Both</label>
		</div>
	</div>
</div>

<style>
	:root {
		--before-background-color: darkcyan;
		--before-color: white;
		--after-background-color: orangered;
		--after-color: white;
		--opacity: '0';
	}
	#schemaContainerId {
		position: relative;
		margin-left: 3rem;
		p {
			width: max-content;
		}
		.to-add-where {
			position: absolute;
			top: -1.5rem;
			left: -2rem !important;
			width: max-content;
			height: 2rem;
			padding: 1px 0.5rem;
			border-bottom: 6px solid transparent;
			color: var(--model-name);
			opacity: var(--opacity);
			.radio-wrapper {
				background-color: skyblue;
				padding: 1px 0.3rem;
				border-radius: 5px !important;
				cursor: pointer;
				label,
				input {
					margin: 0;
					padding: 0;
					/* opacity: var(--opacity); */
				}
			}
			/* opacity: var(--opacity); */
			transition: opacity ease 1s;
		}
		&:hover .to-add-where {
			/* opacity: var(--opacity); */
			cursor: pointer;
			user-select: none;
		}
	}
	#box {
		width: max-content;
		height: auto;
		background-color: green;
		padding: 40px;
		color: white;
		font-size: 20px;
		font-weight: 200;
		position: relative;
		margin-left: 300px;
	}

	#box::after {
		position: absolute;
		content: '::after pseudo element';
		top: 0;
		left: 100%;
		padding: 40px;
		color: white;
		width: max-content;
		height: auto;
		background-color: var(--after-background-color);
		font-size: 20px;
		font-weight: 200;
	}

	#box::before {
		position: absolute;
		content: '::before pseudo element';
		top: 0%;
		right: 100%;
		padding: 40px;
		color: white;
		width: max-content;
		height: auto;
		background-color: var(--before-background-color);
		font-size: 20px;
		font-weight: 200;
	}
	.count {
		position: relative;
		margin-top: 2rem;
		&::before {
			position: absolute;
			top: -1.8rem;
			left: 4rem;
			content: var(--before-count);
			font-size: 24px;
			color: navy;
		}
	}
</style>
