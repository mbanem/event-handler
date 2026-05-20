<script lang="ts">
	import { onMount } from 'svelte';
	import { createEventHandler, isEmpty, sleep, capitalize } from '$lib/utils';
	import type { Field, Model, Models } from './parse-prisma-schema';
	import CRRBTooltip, { type SelectedModels } from '$lib/components/CRRBTooltip.svelte';
	import type { PageProps } from './$types';
	import type { Models } from '$lib/utils';
	import type { AnyARecord } from 'node:dns';

	type Payload = Record<string, SelectedModels | Model | string[] | string>; // { route: string | null } = { route: null };
	const log = console.log;
	let { data }: PageProps = $props();

	let models = data.models as Models; // avoid $derived
	console.log('component models', models);

	let isLoading = $state(true); // TODO set to true
	setTimeout(() => {
		isLoading = false;
	}, 1000);
	// selectedModels are bound $props() mutated by component
	// when any checkbox on a model list is updated
	// filling selectedModels with SelectedModels from the list
	let selectedModels = $state<SelectedModels>({});
	// snippet renders Prisma ORM models from schema.prisma but when user clicks on line
	// for including Register and Login routes we add to registerLoginModels for user to
	// add fields from Prisma ORM models to them by click/shift-click/ctrl-click on fields
	let crComponents: string[] = $state(['CRInput', 'CRSpinner', 'CRActivity', 'CRTooltip', 'CRSummaryDetails']);
	let appFeatures: string[] = $state([]);

	// onclick Create CRUD Support sends models to extension to
	// create individual pages or part of the application
	function getPayload() {
		// console.log($state.snapshot([...candidates]));
		if (Object.keys(selectedModels).length === 0) {
			// return JSON.stringify($state.snapshot(candidates));
			return selectedModels;
		}

		let payload: Payload = {};
		// candidateModels.forEach((modelName) => {
		// 	payload[modelName] = $state.snapshot(models[modelName]) as Model;
		// });
		if (crComponents.length) {
			payload['crComponents'] = crComponents;
		}
		for (const key of ['authorization', 'authentication']) {
			const el = document.querySelector(`input[name=${key}]:checked`) as HTMLInputElement;
			if (el) {
				payload[key] = el.value;
			}
		}

		if (appFeatures.length) {
			payload['features'] = appFeatures;
		}
		payload['selectedModels'] = selectedModels;
		// return JSON.stringify($state.snapshot(payload));
		return $state.snapshot(payload);
	}
	// imitate getting model from Webview extension
	// fake part for Extension
	const vscode =
		// @ts-expect-error  not an extension content
		typeof acquireVsCodeApi !== 'undefined'
			? // @ts-expect-error not an extenson coontent
				acquireVsCodeApi()
			: {
					postMessage: (msg: { command: string; payload: Payload }) => {
						log(`[DEV] ${msg.command} in progress...`);
						setTimeout(() => {
							log(`${msg.command} is done`, msg.payload ?? 'with no payload');
						}, 2000);
					},
				};

	// Webview sends message to the extensioin
	function createCRUDSupport() {
		vscode.postMessage({
			command: 'CreateCrudSupport',
			payload: getPayload(),
		});
	}

	// Make a reactive local copy that you can safely bind to
	// let uiFields = new SvelteMap<string, Field>();
	// let candidates = new SvelteMap<string, Model>();

	// debugger;

	const eh = createEventHandler();

	function setButtonAvailability() {
		return !isEmpty(selectedModels);
	}

	onMount(() => {
		return () => {
			eh.destroy();
		};
	});

	let buttonNotAllowed = $derived(Object.keys(selectedModels).length === 0);
</script>

<!-- <p>Is include Register Model Selected? {isSelected}</p> -->
<svelte:head>
	<title>CRUD Support</title>
</svelte:head>

{#snippet appIncludes()}
	<label for="Navbar" class="app-labels">
		<input type="checkbox" id="Navbar" value="NavBar" bind:group={appFeatures} />
		Include navbar in app root +layout.svelte</label
	>
	<label for="ThemeIcon" class="app-labels">
		<input type="checkbox" id="ThemeIcon" value="ThemeIcon" bind:group={appFeatures} />
		Include dark/light/system theme icon</label
	>

	<div class="radio-check-groups">
		<div class="authentication">
			{#each ['pasword-based', 'multi-factor MFA', 'certificate-based', 'token-based JWT'] as auth (auth.slice(0, 4))}
				<label>
					<input type="radio" name="authentication" value={auth} checked={auth === 'token-based JWT'} />
					{auth}
				</label>
			{/each}
		</div>
		<div class="authorization">
			{#each ['JSON Web Tokens JWT', 'API Keys', 'Bearer Tokens', 'Digest Authentication', 'Mutual TLS'] as auth (auth.slice(0, 4))}
				<label>
					<input type="radio" name="authorization" value={auth} checked={auth === 'Bearer Tokens'} />
					{auth}
				</label>
			{/each}
		</div>
	</div>
{/snippet}
{#snippet pageByPageMiddleColumn()}
	<div class="cr-left-column">
		{@render appIncludes()}
		<div class="embellishments">
			<div class="checkbox-item">
				<label for="CRInput"
					><input id="CRInput" type="checkbox" value="CRInput" bind:group={crComponents} />
					CRInput component</label
				>
			</div>
			<div class="checkbox-item">
				<label for="CRSpinner">
					<input id="CRSpinner" type="checkbox" value="CRSpinner" bind:group={crComponents} />
					CRSpinner component</label
				>
			</div>
			<div class="checkbox-item">
				<label for="CRActivity"
					><input id="CRActivity" type="checkbox" value="CRActivity" bind:group={crComponents} />
					CRActivity component</label
				>
			</div>
			<div class="checkbox-item">
				<label for="CRTooltip"
					><input id="CRTooltip" type="checkbox" value="CRTooltip" bind:group={crComponents} />
					CRTooltip component</label
				>
			</div>
			<div class="checkbox-item">
				<label for="CRSummaryDetails"
					><input id="CRSummaryDetails" type="checkbox" value="CRSummaryDetails" bind:group={crComponents} />
					CRSummaryDetails component</label
				>
			</div>
		</div>
		<div
			id="createBtnId"
			onclick={createCRUDSupport}
			style="font-size: 14px !important;cursor:pointer;"
			class:notallowed={buttonNotAllowed}
			aria-hidden={true}
		>
			Create CRUD Support
		</div>
	</div>
{/snippet}
{#snippet pageByPageNote()}
	<cr-pre>
		This extension creates full CRUD functional TypeScript client side +page.svelte and supporting server side
		+page.server.ts that allow communication with Prisma ORM (Object-Relational Mapping) with PostgreSQL db. For every
		route name and selected checkbox model from summary/details block the extension would build a set of a TypeScript
		data entry +page.svelte with accompanying +page.server.ts for communicating with Prisma ORM local PostgreSQL
		database -- based on a connection string set in the .env file in the app root folder.
	</cr-pre>
	{@render pageByPageMiddleColumn()}
{/snippet}
<div id="crudUIBlockId" class="cr-main-grid">
	<div class="application-settings">
		{@render pageByPageNote()}
	</div>
	<CRRBTooltip {models} bind:selectedModels></CRRBTooltip>
</div>

<style lang="scss">
	*,
	*::before,
	*::after {
		box-sizing: border-box;
		user-select: none;
	}
	.cr-main-grid {
		position: relative;
		display: grid;
		grid-template-columns: 30rem 30rem;
		// padding: 0.6rem 0 0 0.6rem;
		column-gap: 1rem;
		margin: 0.5rem 0 0 1rem;
		width: max-content;
		height: auto;
		align-items: start;
	}
	.application-settings {
		width: 30rem;
		align-items: start;
		height: 100%;
	}
	.cr-left-column {
		@include container($head: 'Application Settings', $head-color: navy);
		position: relative;
		border: 1px solid gray;
		border-radius: 8px;
		height: 68vh;
		width: 30rem;
		margin-top: 1rem;
		padding: 1rem 0 0 0.7rem;
		background-color: var(--panel-bg-color);

		label {
			display: block;
			color: var(--candidate-color);
			cursor: pointer;
		}
		button,
		div {
			display: block;
		}
	}
	.cr-right-column {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		// @include container($head: 'Select UI Fields from ORM', $head-color: navy);
		/*color: var(--field-type-color);*/
		background-color: var(--panel-bg-color);
		height: 84.2vh;
		width: 30.5rem;
		border: 1px solid gray;
		border-radius: 10px;
		padding: 1.6rem 0 1rem 0;
		.red-type {
			color: var(--red-type) !important;
		}
	}

	:global(.cr-fields-list) {
		display: grid;
		grid-template-rows: 1.4rem;
		grid-auto-rows: 1.4rem;
		cursor: pointer;
		text-align: center;
		padding: 0;
		margin: 0 0 2rem 0;
		color: navy;
	}
	:global(.cr-list-el) {
		background-color: var(--candidate-bg-color);
		color: var(--candidate-color);
		border: 1px solid var(--border-color);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	:global(.cr-list-el:first-child) {
		border-top-left-radius: 10px;
		border-top-right-radius: 10px;
	}
	:global(.cr-list-el:nth-last-child(2)) {
		border-bottom-left-radius: 10px;
		border-bottom-right-radius: 10px;
	}
	// }
	.cr-remove-hint,
	.cr-prisma-remove-hint {
		position: absolute;
		left: 1.5rem !important;
		z-index: 10;
		font-size: 12px;
		color: var(--tooltip-color);
		background-color: var(--tooltip-background-color);
		width: max-content;
		padding: 0 0.5rem 1px 0.5rem;
		background-color: cornsilk;
		opacity: 0;
		text-align: center;
		border: 1px solid lightgray;
		border-radius: 5px;
		transition: opacity 0.2s;
		pointer-events: none;
		white-space: nowrap;
	}
	cr-prisma-remove-hint {
		top: 3rem;
		left: 20rem;
	}
	.cr-span-two,
	cr-pre {
		grid-column: 1 / span 2;
		text-align: justify;
		font-size: 12px;
		color: var(--pre-color);
		align-items: start;
	}
	input[type='text'] {
		width: 93%;
		height: 20px;
		padding: 6px 0 8px 1rem;
		outline: none;
		font-size: 16px;
		border: 1px solid gray;
		border-radius: 4px;
		outline: 1px solid transparent;
		margin-top: 8px;
		margin-bottom: 10px;
		&::placeholder {
			font-size: 13px;
		}
		&:focus {
			outline: 1px solid gray;
		}
	}

	#schemaContainerId {
		height: auto;
		/* could not make overflow scroll-bar hidden */
		overflow-y: auto;
	}

	.orm-models-caption,
	.select-all {
		position: absolute;
		top: -0.9rem;
		left: 34rem;
		z-index: 15;
		padding: 0 5px;
		width: 20rem;
		color: var(--candidate-color);
		background-color: var(--panel-bg-color);
	}
	.select-all {
		left: 55rem;
		width: 5rem;
		cursor: pointer;
		&:hover {
			border: 1px solid var(--candidate-color);
			border-radius: 4px;
		}
	}
	.embellishments {
		@include container($head: 'Include Components', $head-color: navy);
		background-color: var(--panel-bg-color);

		position: relative;
		// grid-column: span 2;
		display: grid;
		grid-template-columns: 1rem 7rem;
		width: 97.2%;
		column-gap: 0.5rem;
		row-gap: 0.1rem;
		align-items: center;
		padding: 8px 1rem;
		// margin-top: 2rem;
		border: 1px solid gray;
		border-radius: 6px;
		user-select: none;
	}

	.checkbox-item {
		display: inline-block;
		color: var(--candidate-color);
	}

	.checkbox-item input[type='checkbox'] {
		display: inline-block;
		grid-column: 1;
		justify-self: start;
		align-self: center;
		margin: 0 0.6rem 0 0;
	}

	.checkbox-item label {
		display: inline-block;
		grid-column: 2;
		justify-self: start;
		align-self: center;
		cursor: pointer;
		line-height: 1;
		// width: 23.6rem !important;
	}

	.checkbox-item label:hover {
		background-color: cornsilk;
		cursor: pointer;
		width: 25rem !important;
	}
	:global(.cr-model-attr) {
		grid-column: span 2;
		width: 18rem;
		padding: 0;
		margin: 0 0 0 2rem;
		text-wrap: wrap;
		color: tomato;
		font-size: 13px;
	}
	:global(.cr-model-name) {
		color: var(--summary-color);
		background-color: var(--summary-bg-color);
		margin: 3px 9px 0 0;
		width: 26rem;
		border-radius: 6px;
		padding-left: 8rem;
		height: 1.6rem;
		cursor: pointer;
		.checkbox-model {
			display: none;
		}
	}

	:global(.cr-fields-column) {
		// position: relative;
		display: grid;
		grid-template-columns: 7rem 9.5rem;
		column-gap: 5px;
		width: 26rem;
		padding: 6px 0 6px 1rem;
		height: auto;
		/*font-family: Georgia, 'Times New Roman', Times, serif;*/
		font-size: 15px;
		font-weight: 500;
		color: var(--candidate-color);
		background-color: var(--candidate-bg-color);
	}

	:global(.cr-fields-column p) {
		margin: 4px 0 0 0;
		padding: 2px 0 4px 6px;
		border-bottom: 1px solid lightgray;
		text-wrap: wrap;
	}

	:global(.cr-fields-column p:nth-child(odd)) {
		cursor: pointer;
		width: max-content;
		padding: 4px 1rem;
	}

	:global(.cr-fields-column p:nth-child(even)) {
		font-weight: 400 !important;
		font-size: 12px !important; /* prisma attrs column */
		color: var(--model-name);
		span {
			display: block;
			margin-left: 1rem;
			color: var(--pink-tomato);
		}
	}
	#createBtnId {
		position: absolute;
		top: 20rem;
		left: 1.2rem;
		outline: none;
		border: 1px solid gray;
		border-radius: 5px;
		font-weight: 400;
		padding: 4px 1rem;
		color: var(--candidate-color);
		margin: 6rem 6.5rem;
		width: max-content;
		cursor: pointer;
	}
	.notallowed {
		opacity: 0.3;
		cursor: not-allowed;
	}
	:global(.field-name) {
		color: var(--field-name) !important;
	}
	:global(.green-type) {
		color: var(--green-type) !important;
	}
	:global(.red-type) {
		color: var(--red-type) !important;
	}
	:global(.pink-tomato) {
		color: var(--pink-tomato);
	}
	:global(.attr-id) {
		color: var(--attr-id);
	}
	.spinner-wrapper {
		display: grid;
		grid-template-columns: 1em 10rem;
		column-gap: 1rem;
		.spinner {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 0.8em;
			height: 0.8em;
			border: 3px solid #e2e8f0;
			border-top-color: #3b82f6;
			border-radius: 50%;
			animation: spin 900ms linear infinite;
			span {
				display: inline-block;
			}
		}
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.app-labels {
		color: var(--checkbox-label-color);
		margin: 3px 0 3px 1rem;

		&:last-of-type {
			margin-bottom: 1rem;
		}
	}

	.authentication,
	.authorization {
		@include container(
			$head: 'Authentication',
			$head-color: navy,
			$padding: 0.5rem 1rem,
			$left: 1rem,
			$width: max-content
		);
		label {
			cursor: pointer;
		}
		margin: 0.5rem 0 1rem 0;
	}
	.authorization {
		@include container($head: 'Authorization', $left: 0.5rem);
		width: 16rem;
	}
	.radio-check-groups {
		display: grid !important;
		grid-template-columns: 11rem 14rem;
		column-gap: 0.5rem;
		// justify-content: flex-start;
	}
</style>
