<script lang="ts">
	import RBHandler from './RBHandler.svelte';
	import type { PageProps } from './$types';
	import type { Models } from '$lib/utils';
	let { data }: PageProps = $props();
	const data_ = () => {
		return data;
	};

	let models = data_().models as Models;
	let tooltipBlockEl: HTMLDivElement;
</script>

{#snippet tooltipBlock()}
	<div bind:this={tooltipBlockEl} class="radio-button-block hidden">
		<label><input type="radio" name="LRB" value="Login" />Login</label>
		<label><input type="radio" name="LRB" value="Register" />Register</label>
		<label><input type="radio" name="LRB" value="Both" />Both</label>
	</div>
{/snippet}

{@render tooltipBlock()}
<RBHandler {models} {tooltipBlockEl}></RBHandler>

<style lang="scss">
	:root {
		--hover-color: navy;
		--hover-off-color: navy;
	}
	/* test */
	.summary {
		cursor: pointer;
		// list-style: none;
		width: max-content;
		padding: 4px 1rem;
		border: 1px solid lightgray;
		border-radius: 5px;
		color: var(--candidate-color);
		background-color: var(--candidate-bg-color);
	}

	.not-data-entry {
		position: absolute;
		top: -0.6rem;
		left: 0;
		color: tomato;
		width: max-content;
		border: 1px solid lightgray;
		border-radius: 5px;
		padding: 1px 1rem;
		background-color: white;
	}

	/* send CSS class names to contMenu action
		as actions are in the app scope and can
		access classes by name
	*/

	/* 
		list container firstName, lastName,...
	*/
	.list-container,
	.details {
		--back-color: skyblue;
		margin-left: 5rem;

		position: absolute;
		margin: 1rem 0 0 3rem;
		width: max-content;
		padding: 0;
		background-color: transparent;
		cursor: default;
		p {
			// display: inline-block;
			width: max-content;
			padding: 1px 0.5rem;
			margin: 0 0 0 1rem;
			color: var(--candidate-color);
			background-color: var(--candidate-bg-color);
			&:first-child {
				margin-top: 0.2rem;
			}
		}
		.to-add-where,
		.to-add-where2 {
			// position: relative;
			display: flex;
			flex-direction: column;
			/* width: max-content; */
			height: auto;
			padding: 0; /*1px 0.4rem 1rem 0.1rem;*/
			/* border: 1px solid gray; */
			// opacity: var(--opacity);
			color: var(--candidate-color);
			background-color: var(--candidate-bg-color);
			p {
				color: var(--candidate--color);
				background-color: var(--candidate-bg-color);
			}
			transition: opacity ease 1s;
		}
	}
	#tooltipBlockEl {
		position: absolute; // I tried fixed as well
		top: 5rem;
		left: 30rem;
		justify-content: center;
		align-items: center;
		display: flex;
		flex-direction: row;
		width: max-content;
		color: var(--candidate-color);
		border: 1px solid lightgray;
		border-radius: 5px;
		background-color: var(--candidate-bg-color);
		padding: 3px 0.5rem;
		outline: 4rem solid transparent;
		opacity: 0; // should be opacity '0', '1' is left for test
		transition: opacity 150ms ease;
		z-index: 10;

		label,
		input {
			display: inline;
			height: auto;
			cursor: pointer;
			background-color: rgb(128, 204, 234);
			&:first-of-type {
				padding-left: 0.2rem;
			}
			&:last-of-type {
				padding-right: 0.5rem !important;
			}
			border-radius: 5px;
			label {
				width: max-content;
				padding: 0;
				margin: 0;
			}
		}
	}
	.radio-button-block {
		opacity: 0;
		position: fixed;
		top: 176.4px;
		left: 16.8px;
		z-index: 9999;
		pointer-events: auto;
		border-radius: 6px;
		padding: 4px 0.5rem 1px 5px;
		color: var(--candidate-color);
		background-color: skyblue;
		cursor: pointer;
	}
	.hidden {
		display: none;
	}
</style>
