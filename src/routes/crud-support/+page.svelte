<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity'; // get(key), set(key,value), delete(key), clear ()
	import { createEventHandler, isEmpty } from '$lib/utils';
	import { type Field, type Models } from './parse-prisma-schema';
	import type { PageProps } from './$types';

	const noop = () => {};
	let { data }: PageProps = $props();
	function data_() {
		return data;
	}
	let models: Models = $state<Models>({}) as Models;
	let modelName = $state<string>('');

	// imitate getting model from Webview extension
	// fake part for Extension
	const vscode =
		// @ts-expect-error  not an extension content
		typeof acquireVsCodeApi !== 'undefined'
			? // @ts-expect-error not an extenson coontent
				acquireVsCodeApi()
			: {
					postMessage: (msg: any) => {
						console.log(`[DEV] ${msg.command} in progress...`);
						setTimeout(() => {
							console.log(`${msg.command} is done`, msg.payload ?? 'with no payload');
						}, 2000);
					},
				};

	function createCRUDSupport() {
		vscode.postMessage({
			command: 'CreateCrudSupport',
			payload: { route: routeNameEl.value, model: JSON.stringify([...candidates]) },
		});
	}
	let isLoading = $state(true);
	setTimeout(() => {
		models = data_().models;
		isLoading = false;
	}, 3000);
	// if (!isLoading) {
	// 	setTimeout(() => {
	// 		initialize();
	// 	}, 1000);
	// }
	// Make a reactive local copy that you can safely bind to
	let uiFields = new SvelteMap<string, Field>();
	let candidates = new SvelteMap<string, Field>();

	// debugger;

	const eh = createEventHandler();
	// event handler wrappers for candidate fields list and details ORM model list
	let candidatesListEl = $state<HTMLDivElement>();
	let schemaContainerEl: HTMLDivElement;

	// associated <p>tooltip</p> event handler mouseover/out paragraphs
	// defined after @render and moved via event handler mouseover handler
	let candidateTooltipEl: HTMLParagraphElement;
	let ormModelTooltipEl: HTMLParagraphElement;

	// input for defning route folder for Svelte
	let routeNameEl: HTMLInputElement;

	// let timer: ReturnType<typeof setTimeout>;	// NOTE keep it as an example

	const contTitleDefault = 'click, add to candidates';
	const contSelected = 'already selected';

	function getUIField(el: HTMLElement) {
		const match = (el as HTMLElement).innerText.match(/(\w+)/);
		if (match && match[1]) {
			return uiFields.get(match[1]) as Field;
		}
		return null;
	}
	function prismaContainerTooltip(s: string) {
		ormModelTooltipEl.innerText = s;
		ormModelTooltipEl.style.color = s === contTitleDefault ? 'navy' : s === contSelected ? 'darkgreen' : 'tomato';
	}

	function onPrismaClick(e: MouseEvent) {
		const el = e.target as HTMLElement;
		const field = getUIField(el);
		if (field && !candidates.has(field.name)) {
			candidates.set(field.name, field);
		}
		ormModelTooltipEl!.style.opacity = '0';
		setButtonAvailability();
	}

	let schemaContainerRect: DOMRect | null = null;
	function onPrismaMouseOver(e: MouseEvent) {
		if (!ormModelTooltipEl) {
			ormModelTooltipEl = document.getElementById('ormModelTooltipId') as HTMLParagraphElement;
		}
		const et = e.target as HTMLParagraphElement;
		if (et.innerText.slice(0, 5) === 'type:') {
			return;
		}
		const field = getUIField(et);
		if (field) {
			if (candidates.has(field.name)) {
				prismaContainerTooltip(contSelected);
			} else if (field.isDataEntry) {
				prismaContainerTooltip(contTitleDefault);
			}
		} else {
			prismaContainerTooltip('Not a data-entry field');
		}
		if (!schemaContainerRect) {
			schemaContainerRect = (
				document.getElementById('schemaContainerId') as HTMLParagraphElement
			).getBoundingClientRect();
		}
		ormModelTooltipEl.style.top = String(et.offsetTop - et.offsetHeight) + 'px';
		ormModelTooltipEl.style.left = String(et.offsetLeft + 12) + 'px';
		ormModelTooltipEl.style.opacity = '1';
	}

	function onPrismaMouseOut(e: MouseEvent) {
		ormModelTooltipEl.style.opacity = '0';
	}

	let candidatesRect: DOMRect | null = null;
	function onMouseOver(e: MouseEvent) {
		if (!candidatesRect) {
			candidatesRect = (document.getElementById('middleColumnId') as HTMLParagraphElement).getBoundingClientRect();
		}
		const et = e.target as HTMLParagraphElement;
		candidateTooltipEl.style.top = String(et.offsetTop - et.offsetHeight) + 'px';
		candidateTooltipEl.style.left = String(et.offsetLeft + 12) + 'px';
		candidateTooltipEl.style.opacity = '1';
	}

	function onMouseOut(_: MouseEvent) {
		candidateTooltipEl.style.opacity = '0';
	}

	// drag-drop works silently but if we want to handle some
	// events like onDrop we set on a wrapper w.ondrop = onDrop
	// function onDrop(_: MouseEvent) {	// NOTE keep it as an example
	// 	console.log('onDrop');
	// }

	function setButtonAvailability() {
		return !isEmpty(candidates);
	}

	// candidate fields handlers
	function onClick(e: MouseEvent) {
		const el = e.target as HTMLElement;
		const match = (el as HTMLElement).innerText.match(/(\w+)/);
		if (match) {
			candidates.delete(match[1]);
		}
		candidateTooltipEl.style.opacity = '0';
		el.remove();
		setButtonAvailability();
	}

	function setCandidateHandlers() {
		eh.destroy();
		if (!candidatesListEl) {
			return;
		}
		// NOTE drag drop will work without this setting, but if we want
		// to handle this event we should set the handler, like onDrop here
		// candidatesListEl.ondrop = onDrop;	// NOTE keep it as an example
		// bind candidates fields to event-handler
		eh.setup(candidatesListEl, {
			click: onClick,
			mouseover: onMouseOver,
			// mouseout: onMouseOut,
		});
		// bind prisma model fields to event-handler for every <summary>
		// separately based on fake class name X-<modelName>
		const className = `.X-${modelName}`;
		const prismaList = document.querySelector(className) as HTMLDivElement;
		eh.setup(prismaList, { click: onPrismaClick, mouseover: onPrismaMouseOver, mouseout: onPrismaMouseOut });

		// drag-drop to move fieldNames up and down the candidates list
		eh.setup(candidatesListEl);
		buttonNotAllowed = false;
	}

	// function initialize() {
	onMount(() => {
		candidatesListEl = document.getElementById('candidatesListId') as HTMLDivElement;
		candidateTooltipEl = document.getElementById('candidateTooltipId') as HTMLParagraphElement;
		schemaContainerEl = document.getElementById('schemaContainerId') as HTMLDivElement;
		routeNameEl = document.getElementById('routeNameId') as HTMLInputElement;
		if (schemaContainerEl) {
			// listener for <summary/details> blocks
			schemaContainerEl.addEventListener('click', async (event: MouseEvent) => {
				if ((event.target as HTMLElement).tagName === 'SUMMARY') {
					modelName = (event.target as HTMLElement).innerText;
					const details = (event.target as HTMLElement).closest('details');
					if (details && details.open) {
						setTimeout(() => {
							// has to use setTimeout as the element is still in opening
							details.removeAttribute('open');
						}, 200);
						closeSchemaModels();
						eh.destroy();
						return;
					}

					closeSchemaModels();

					routeNameEl.value = modelName.toLowerCase();
					candidates.clear();
					// make current uiFields and put them in candidate fields list
					try {
						models[modelName].fields.forEach((fld) => {
							if (fld.isDataEntry) {
								uiFields.set(fld.name, fld);
								candidates.set(fld.name, fld);
							}
						});
					} catch (err: unknown) {
						const msg = err instanceof Error ? err.message : String(err);
						console.log('models[modelName].fields', msg);
					}

					// now we have prisma models revealed in details and candidate fields list
					// so call event-handler setup to handle tooltips and clicks on the lists
					setCandidateHandlers();
				}
			});
		}

		return () => {
			eh.destroy();
		};
	});
	// }
	// onDestroy(() => {
	// 	eh.destroy();
	// });
	function closeDetails(dets: HTMLCollection) {
		for (const child of Object.entries(dets)) {
			const el = child[1].children[0] as HTMLElement;
			if (el && el.hasAttribute('open')) {
				el.removeAttribute('open');
			}
		}
	}
	function closeSchemaModels() {
		routeNameEl.value = '';
		if (!schemaContainerEl) {
			schemaContainerEl = document.getElementById('schemaContainerId') as HTMLDivElement;
		}
		const children = schemaContainerEl?.children as HTMLCollection;
		closeDetails(children);
		candidates.clear();
		buttonNotAllowed = true;
	}
	let buttonNotAllowed = $state<boolean>(true);

	const nuiRegex = new RegExp(`\\b@id|@defaults|@updatedAt|@unique\\b`, 'g');
	function fieldAttrsTag(field: Field) {
		return nuiRegex.test(field.attrs as string) ? 'attr-id' : '';
	}
	// let buildingApp = $state(true);
	let candidateModules = $state<string[]>([]);
	// let save: string[] = [];
	// function toggleBuildingApp() {
	// 	buildingApp = !buildingApp;
	// 	if (buildingApp) {
	// 		save = candidateModules;
	// 		candidateModules = [];
	// 	} else {
	// 		candidateModules = [...save];
	// 	}
	// }
</script>

<svelte:head>
	<title>CRUD Support</title>
</svelte:head>
<!-- <p>candidateModulesNumber {candidateModules.length} : {candidateModules}</p>
<button onclick={toggleBuildingApp}>toggle building app</button> -->
{#snippet candidateFields()}
	{#each candidates as [name, field] (name)}
		{#if field.isDataEntry}
			<div class="cr-list-el" data-event-list="click mouseover mouseout" draggable="true">
				<span style="pointer-events: none;">
					{name}: {field.type}{field.isOptional ? '?' : ''}
				</span>
			</div>
		{/if}
	{/each}
	<p id="candidateTooltipId" class="cr-remove-hint">click to remove</p>
{/snippet}
{#snippet summaryPrismaModel()}
	{#each Object.entries(models) as [modelName, model] (modelName)}
		<div>
			<details>
				<summary class="cr-model-name">
					{modelName}
				</summary>
				<div class="X-{modelName} cr-fields-column" data-event-list="click mouseover mouseout">
					{#each model.fields as field (field.name)}
						{@const attrClass = fieldAttrsTag(field) as string}
						<p>{field.name}</p>
						<p>type:{field.type} <span class={attrClass}>{field.attrs ?? 'na'}</span></p>
					{/each}
				</div>
				<div>
					{#each model.attrs as attr (attr)}
						<p class="cr-model-attr">{attr}</p>
					{/each}
				</div>
			</details>
		</div>
	{/each}
	<p id="ormModelTooltipId" class="cr-prisma-remove-hint">click, add to candidates</p>
{/snippet}

<div id="crudUIBlockId" class="cr-main-grid">
	<div class="cr-grid-wrapper">
		<cr-pre>
			This extension creates full CRUD functional TypeScript client side +page.svelte and supporting server side
			+page.server.ts that allow communication with Prisma ORM (Object-Relational Mapping) with PostgreSQL db. By
			selecting a model from summary/details block, the extension fills up the Candidate Fields list with data-entry
			fields (which values are enter via UI of +page.svelte). Clicking on a candidate field would remove it from the
			list, but could be added again by clicking it from the details block. The extension uses Route Name value,
			initially filled with model name from summary title, and creates the pages under src/routes/Route Name value by
			clicking on the Create CRUD Support button.
		</cr-pre>
		<div class="cr-left-column">
			<label for="routeNameId"> Route Name </label>
			<input id="routeNameId" type="text" placeholder="app name as routes folder name" />

			<div class="cr-crud-support-done cr-hidden"></div>
			<div class="embellishments">
				<div class="checkbox-item">
					<input id="CRInput" type="checkbox" checked />
					<label for="CRInput">CRInput component</label>
				</div>
				<div class="checkbox-item">
					<input id="CRSpinner" type="checkbox" checked />
					<label for="CRSpinner">CRSpinner component</label>
				</div>
				<div class="checkbox-item">
					<input id="CRActivity" type="checkbox" checked />
					<label for="CRActivity">CRActivity component</label>
				</div>
				<div class="checkbox-item">
					<input id="CRTooltip" type="checkbox" checked />
					<label for="CRTooltip">Tooltip component</label>
				</div>
				<div class="checkbox-item">
					<input id="CRSummaryDetail" type="checkbox" checked />
					<label for="CRSummaryDetail">Summary/Details component</label>
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

		<div id="middleColumnId" class="cr-middle-column">
			<div id="candidatesListId" class="cr-fields-list" onmouseout={onMouseOut} onblur={noop} aria-hidden={true}>
				{@render candidateFields()}
			</div>
			<p id="candidateTooltipId" class="cr-remove-hint">click to remove</p>
		</div>
	</div>
	<div id="rightColumnId" class="cr-right-column">
		<div id="schemaContainerId">
			{#if isLoading}
				<div class="spinner-wrapper"><span class="spinner"></span><span>Loading models...</span></div>
			{:else}
				{@render summaryPrismaModel()}
			{/if}
		</div>
	</div>
	<p class="orm-models-caption">Select UI Fields from ORM</p>
</div>

<style lang="scss">
	.cr-main-grid {
		position: relative;
		display: grid;
		grid-template-columns: 40rem 20rem;
		padding: 0.6rem 0 0 0.6rem;
		margin-top: 0.5rem;
		width: 100vw;
		height: 90vh;
		align-items: start;
		// border-bottom: 1px solid gray;
	}

	.cr-grid-wrapper {
		display: grid;
		grid-template-columns: 27rem 12rem;
		column-gap: 0.5rem;
		row-gap: 1rem;
		align-items: start;
		height: 100%;
	}
	.cr-crud-support-done {
		width: max-content;
		padding: 5px 2rem;
		margin: 1rem 0 0 0;
		color: lightgreen;
		font-size: 14px;
		border: 1px solid gray;
		border-radius: 5px;
		cursor: pointer;
		text-align: center;
	}

	.cr-hidden {
		display: none;
		border: none;
	}

	.cr-left-column {
		@include container($head: 'Application Settings', $head-color: navy);
		position: relative;
		border: 1px solid gray;
		border-radius: 8px;
		height: 76vh;
		width: 27.2rem;
		padding: 1rem 0 0 0.7rem;
		background-color: var(--panel-bg-color);

		label {
			display: block;
			color: var(--candidate-color);
		}
		button,
		div {
			display: block;
		}
	}

	.cr-middle-column {
		@include container($head: 'Candidate Fields', $head-color: navy);
		position: relative;
		border: 1px solid gray;
		border-radius: 5px;
		padding: 1rem 6px 0 6px;
		height: 76vh;
		width: 12rem;
		background-color: var(--panel-bg-color);
		/* overflow-y: auto;	 */ /* cuts container's header */
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
	.cr-right-column {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		// @include container($head: 'Select UI Fields from ORM', $head-color: navy);
		/*color: var(--field-type-color);*/
		background-color: var(--panel-bg-color);
		height: 84.2vh;
		width: 23.5rem;
		border: 1px solid gray;
		border-radius: 10px;
		padding: 1.6rem 0 1rem 0;
		.red-type {
			color: var(--red-type) !important;
		}
	}
	.orm-models-caption {
		position: absolute;
		top: -0.8rem;
		left: 43rem;
		z-index: 15;
		padding: 0 5px;
		color: var(--candidate-color);
		background-color: var(--panel-bg-color);
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
		margin: 0 0 0 1rem;
		text-wrap: wrap;
		color: tomato;
		font-size: 13px;
	}
	// :global(.cr-model-block) {
	// 	// max-height: auto;
	// 	// overflow-y: overlay;
	// 	// .no-scrollbar::-webkit-scrollbar {
	// 	// 	display: none; /* Chrome, Safari, and Opera */
	// 	// }
	// }
	:global(.cr-model-name) {
		color: var(--summary-color);
		background-color: var(--summary-bg-color);
		margin-top: 3px;
		width: 20rem;
		border-radius: 6px;
		padding-left: 1rem;
		height: auto;
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
		width: max-content;
		padding: 6px 0 6px 1rem;
		height: auto;
		/*font-family: Georgia, 'Times New Roman', Times, serif;*/
		font-size: 15px !important;
		font-weight: 500 !important;
	}

	:global(.cr-fields-column p) {
		margin: 4px 0 0 0;
		padding: 2px 0 4px 6px;
		border-bottom: 1px solid lightgray;
		text-wrap: wrap;
	}

	:global(.cr-fields-column p:nth-child(odd)) {
		color: var(--model-name);
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
		top: 26rem;
		left: 1.2rem;
		outline: none;
		border: 1px solid gray;
		border-radius: 5px;
		font-weight: 400;
		padding: 4px 1rem;
		color: var(--candidate-color);
		margin: 8rem 6.5rem;
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
</style>
