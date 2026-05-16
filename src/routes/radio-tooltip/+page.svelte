<script lang="ts">
	import CRRBTooltip from '../../lib/components/CRRBTooltip.svelte';
	import type { PageProps } from './$types';
	import type { Models } from '$lib/utils';
	let { data }: PageProps = $props();
	const data_ = () => {
		// let isLoading = false;
		return data;
	};

	let models = data_().models as Models;
	// let tooltipBlockEl: HTMLDivElement;
</script>

<CRRBTooltip {models}></CRRBTooltip>

<style lang="scss">
	/* 
		list container firstName, lastName,...
	*/

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
