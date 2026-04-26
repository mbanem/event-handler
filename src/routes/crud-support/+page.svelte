<script lang="ts">
	import { onMount } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity'; // get(key), set(key,value), delete(key), clear ()
	import { createEventHandler, isEmpty, sleep } from '$lib/utils';
	import type { Field, Model, Models } from './parse-prisma-schema';
	import ClickableLine from '$lib/components/ClickableLine.svelte'
	import type { PageProps } from './$types';

	// type Getter<T> = () => T;

	// const noop = () => {};
	const log = console.log;
	let { data }: PageProps = $props();
	function data_() {
		return data;
	}
	let models: Models = $state<Models>({}) as Models;
	// snippet renders Prisma ORM models from schema.prisma but when user select checkbox
	// for including Register and Login routes we add to registerLoginModels for user to
	// add fields from Prisma ORM models to them by click/shift-click/ctrl-click on fields
	let crComponents: string[] = $state([]);
	let appFeatures: string[] = $state([]);
	let includeCheched: Record<string, boolean> = $state({ Login: false, Register: false });
	function toggleCheckboxes(e: MouseEvent) {
		const el = e.target as HTMLParagraphElement;
		const newState = el.innerText.includes('select all') ? true : false;
		el.innerText = newState ? '(clear all)' : '(select all)';

		(document.querySelectorAll('.model-checkboxes') as unknown as Array<HTMLInputElement>).forEach(async (chkbox) => {
			console.log(chkbox);
			// chkbox.checked = newState;
			chkbox.click();
			await sleep(100);
		});
	}
	let modelName = $state<string>('');
	let isLoading = $state(true);

function callback(state:boolean){
	console.log(state)
}
	function setModel(modelName: string, state:boolean) {
		includeCheched[modelName] = state //(document.getElementById(`add${modelName}`) as HTMLInputElement).checked;
		if (includeCheched[modelName]) {
			if (modelName === 'Register') {
				models[modelName] = models.Login ?? { fields: [] };
				setTimeout(() => {
					Array.from(document.querySelectorAll('summary'))
						.find((s) => s.textContent?.trim() === 'Register')
						?.click();
				}, 300);
			} else {
				models[modelName] = { fields: [] };
			}
		} else {
			delete models[modelName];
		}
	}

	// onclick Create CRUD Support sends models to extension to
	// create individual pages or part of the application
	function getPayload() {
		if (candidateModels.length === 0) {
			// return JSON.stringify($state.snapshot(candidates));
			return $state.snapshot([...candidates]);
		}
		const payload: Record<string, Model> = {}; // { route: string | null } = { route: null };
		candidateModels.forEach((modelName) => {
			payload[modelName] = $state.snapshot(models[modelName]) as Model;
		});
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
					postMessage: (msg: any) => {
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
			payload: {
				// route: routeNameEl.value,
				payload: getPayload(),
			},
		});
	}

	setTimeout(() => {
		models = data_().models;
		isLoading = false;
	}, 1000);

	// Make a reactive local copy that you can safely bind to
	let uiFields = new SvelteMap<string, Field>();
	let candidates = new SvelteMap<string, Model>();

	// debugger;

	const eh = createEventHandler();
	// event handler wrappers for candidate fields list and details ORM model list
	// let candidatesListEl = $state<HTMLDivElement>();
	let schemaContainerEl: HTMLDivElement;

	// associated <p>tooltip</p> event handler mouseover/out paragraphs
	// defined after @render and moved via event handler mouseover handler
	// let candidateTooltipEl: HTMLParagraphElement;
	let ormModelTooltipEl: HTMLParagraphElement;
	function tooltipEl() {
		if (!ormModelTooltipEl) {
			ormModelTooltipEl = document.getElementById('ormModelTooltipId') as HTMLParagraphElement;
		}
		return ormModelTooltipEl;
	}
	// input for defining route folder for Svelte
	// let routeNameEl: HTMLInputElement;

	// let timer: ReturnType<typeof setTimeout>;	// NOTE keep it as an example

	const fieldTitleDefault = 'Click, add to Login & Register\nShift + click, add to Register';
	const fieldSelected = 'already selected';

	function getUIField(el: HTMLElement) {
		let fieldName = (el as HTMLElement).innerText;
		if (/password/i.test(fieldName)) {
			return {
				name: 'password',
				isDataEntry: true,
				isOptional: false,
				isArray: false,
				attrs: 'saved excrypted',
			} as Field;
		}

		const match = fieldName.match(/(\w+)/);
		if (match && match[1]) {
			return uiFields.get(match[1]) as Field;
		}
		return null;
	}
	function prismaContainerTooltip(s: string) {
		ormModelTooltipEl.innerText = s;
		tooltipEl().style.color = s === fieldTitleDefault ? 'navy' : s === fieldSelected ? 'darkgreen' : 'tomato';
	}

	function onPrismaClick(e: MouseEvent) {
		if (e.ctrlKey) {
			return;
		}
		const el = e.target as HTMLElement;
		const field = getUIField(el) as Field;
		if (includeCheched.Login && !e.shiftKey) {
			if (models.Login.fields.includes(field)) {
				prismaContainerTooltip(fieldSelected);
			} else {
				models.Login.fields.push(field);
			}
		}
		// Register model must have all Login model fields
		if (includeCheched.Register) {
			if (!models.Register.fields.includes(field)) {
				models.Register.fields.push(field);
			}
		}

		tooltipEl().style.opacity = '0';
		setButtonAvailability();
	}

	let schemaContainerRect: DOMRect | null = null;
	function onPrismaMouseOver(e: MouseEvent) {
		const et = e.target as HTMLParagraphElement;
		if (et.innerText.slice(0, 5) === 'type:') {
			return;
		}
		if (!includeCheched.Login && !includeCheched.Register) {
			prismaContainerTooltip('check ReLogin or Register');
		} else {
			const field = getUIField(et);
			if (field) {
				if (models.Login.fields.includes(field)) {
					prismaContainerTooltip(fieldSelected);
				} else if (field.isDataEntry) {
					prismaContainerTooltip(fieldTitleDefault);
				}
			} else {
				prismaContainerTooltip('Not a data-entry field');
			}
			if (!schemaContainerRect) {
				schemaContainerRect = (
					document.getElementById('schemaContainerId') as HTMLParagraphElement
				).getBoundingClientRect();
			}
		}
		tooltipEl().style.top = String(et.offsetTop - et.offsetHeight) + 'px';
		ormModelTooltipEl.style.left = String(et.offsetLeft + 12) + 'px';
		ormModelTooltipEl.style.opacity = '1';
	}

	function onPrismaMouseOut(e: MouseEvent) {
		tooltipEl().style.opacity = '0';
	}

	// let candidatesRect: DOMRect | null = null;
	// function onMouseOver(e: MouseEvent) {
	// 	if (!candidatesRect) {
	// 		candidatesRect = (document.getElementById('middleColumnId') as HTMLParagraphElement).getBoundingClientRect();
	// 	}
	// 	const et = e.target as HTMLParagraphElement;
	// 	candidateTooltipEl.style.top = String(et.offsetTop - et.offsetHeight) + 'px';
	// 	candidateTooltipEl.style.left = String(et.offsetLeft + 12) + 'px';
	// 	candidateTooltipEl.style.opacity = '1';
	// }

	// function onMouseOut(_: MouseEvent) {
	// 	candidateTooltipEl.style.opacity = '0';
	// }

	// drag-drop works silently but if we want to handle some
	// events like onDrop we set on a wrapper w.ondrop = onDrop
	// function onDrop(_: MouseEvent) {	// NOTE keep it as an example
	// 	log('onDrop');
	// }

	function setButtonAvailability() {
		return !isEmpty(candidates);
	}

	// candidate fields handlers
	// function onClick(e: MouseEvent) {
	// 	const el = e.target as HTMLElement;
	// 	const match = (el as HTMLElement).innerText.match(/(\w+)/);
	// 	if (match) {
	// 		candidates.delete(match[1]);
	// 	}
	// 	candidateTooltipEl.style.opacity = '0';
	// 	el.remove();
	// 	setButtonAvailability();
	// }

	function setHandlers() {
		// 	eh.destroy();
		// 	if (!candidatesListEl) {
		// 		return;
		// 	}
		// 	// NOTE drag drop will work without this setting, but if we want
		// 	// to handle this event we should set the handler, like onDrop here
		// 	// candidatesListEl.ondrop = onDrop;	// NOTE keep it as an example
		// 	// bind candidates fields to event-handler
		// 	eh.setup(candidatesListEl, {
		// 		click: onClick,
		// 		mouseover: onMouseOver,
		// 		// mouseout: onMouseOut,
		// 	});
		// bind prisma model fields to event-handler for every <summary>
		// separately based on fake class name X-<modelName>
		const className = `.X-${modelName}`;
		const prismaList = document.querySelector(className) as HTMLDivElement;
		eh.setup(prismaList, { click: onPrismaClick, mouseover: onPrismaMouseOver, mouseout: onPrismaMouseOut });

		// 	// drag-drop to move fieldNames up and down the candidates list
		// 	eh.setup(candidatesListEl);
	}

	// function initialize() {
	onMount(() => {
		// candidatesListEl = document.getElementById('candidatesListId') as HTMLDivElement;
		// candidateTooltipEl = document.getElementById('candidateTooltipId') as HTMLParagraphElement;
		schemaContainerEl = document.getElementById('schemaContainerId') as HTMLDivElement;
		ormModelTooltipEl = document.getElementById('ormModelTooltipId') as HTMLParagraphElement;
		if (schemaContainerEl) {
			// listener for <summary/details> blocks
			schemaContainerEl.addEventListener('click', async (event: MouseEvent) => {
				if ((event.target as HTMLElement).tagName === 'SUMMARY') {
					modelName = (event.target as HTMLElement).innerText;
					const details = (event.target as HTMLElement).closest('details');
					if (details && details.open) {
						setTimeout(() => {
							details?.removeAttribute('open');
							// has to use setTimeout as the element is still in opening
						}, 200);
						closeSchemaModels();
						closeDetails();
						eh.destroy();
						setButtonAvailability();
						return; // here is return
					}

					closeSchemaModels();

					// routeNameEl.value = modelName.toLowerCase();
					candidates.clear();
					// make current uiFields and put them in candidate fields list
					try {
						candidates.set(modelName, models[modelName]);
						models[modelName].fields.forEach((fld) => {
							if (fld.isDataEntry) {
								uiFields.set(fld.name, fld);
							}
						});

						summaryOpen = true;
						setButtonAvailability();
					} catch (err: unknown) {
						const msg = err instanceof Error ? err.message : String(err);
						log('models[modelName].fields', msg);
					}

					// now we have prisma models revealed in details and candidate fields list
					// so call event-handler setup to handle tooltips and clicks on the lists
					setHandlers();
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
	// function closeDetails(dets: HTMLCollection) {
	function closeDetails() {
		// for (const child of Object.entries(dets)) {
		// 	const el = child[1].children[0] as HTMLElement;
		// 	if (el && el.hasAttribute('open')) {
		// 		el.removeAttribute('open');
		// 	}
		// }
		document.querySelectorAll('.cr-model-name').forEach((el) => {
			const det = el.closest('details');
			if (det?.hasAttribute('open')) {
				det.removeAttribute('open');
			}
		});
		setButtonAvailability();
	}
	function closeSchemaModels() {
		if (!schemaContainerEl) {
			schemaContainerEl = document.getElementById('schemaContainerId') as HTMLDivElement;
		}
		// const children = schemaContainerEl?.children as HTMLCollection;
		closeDetails();
		candidates.clear();
		summaryOpen = false;
		setButtonAvailability();
		// buttonNotAllowed = candidateModels.length === 0;
	}
	let candidateModels = $state<string[]>([]);
	let summaryOpen = $state(false);
	let buttonNotAllowed = $derived(candidateModels.length === 0 && !summaryOpen);

	const nuiRegex = new RegExp(`\\b@id|@defaults|@updatedAt|@unique\\b`, 'g');
	function fieldAttrsClass(field: Field) {
		return nuiRegex.test(field.attrs as string) ? 'attr-id' : '';
	}
	function fieldAttrs(field: Field) {
		return field.attrs ?? 'no attributes';
	}
	// let save: string[] = [];
	// function toggleBuildingApp() {
	// 	buildingApp = !buildingApp;
	// 	if (buildingApp) {
	// 		save = candidateModels;
	// 		candidateModels = [];
	// 	} else {
	// 		candidateModels = [...save];
	// 	}
	// }
</script>

<svelte:head>
	<title>CRUD Support</title>
</svelte:head>
<!-- {#snippet candidateFields(model: Getter<Model>)}
	{@const modex = model()}
	<p>model {modex}</p>
	<p>model {$state.snapshot(model.fields)}</p>
	{#each model.fields as field (field.name)}
		{#if field.isDataEntry}
			<div class="cr-list-el" data-event-list="click mouseover mouseout" draggable="true">
				<span style="pointer-events: none;">
					{field.name}: {field.type}{field.isOptional ? '?' : ''}
				</span>
			</div>
		{/if}
	{/each}
	<p id="candidateTooltipId" class="cr-remove-hint">click to remove</p>
{/snippet} -->

{#snippet summaryPrismaModel()}
	{#each Object.entries(models) as [modelName, model] (modelName)}
		<div style="position:relative;">
			<input
				type="text"
				id="route{modelName}"
				value={modelName}
				style="position:absolute;top:0;left:4px;color:var(--candidate-color);background-color:var(--candidate-bg-color);width:5rem;height:1rem;padding:0 0 0 5px;margin:4px 0 0 0;border:none;font-size:14px;"
			/>
			<input
				type="checkbox"
				style="position:absolute;top:0;left:6rem;"
				value={modelName}
				bind:group={candidateModels}
				class="model-checkboxes"
			/>
			<details class="model-details">
				<summary class="cr-model-name">
					{modelName}
				</summary>
				<!-- X-modelName to find element by modelName and use eh.setup on it
to handle prisma model fields on mouse events
				-->
				<div class="X-{modelName} cr-fields-column" data-event-list="click mouseover mouseout">
					{#each model.fields as field (field.name)}
						{@const attrClass = fieldAttrsClass(field) as string}
						<p>{field.name}</p>
						<p>type:{field.type} <span class={attrClass}>{fieldAttrs(field)}</span></p>
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
	<!-- <p id="ormModelTooltipId" class="cr-prisma-remove-hint">click, add to candidates</p> -->
{/snippet}

{#snippet appIncludes()}
	<label for="addNavbar" class="app-labels">
		<input type="checkbox" id="addNavbar" value="Navbar" bind:group={appFeatures} />
		Include navbar in app root +layout.svelte</label
	>
	<label for="addThemeIcon" class="app-labels">
		<input type="checkbox" id="addThemeIcon" value="ThemeIcon" bind:group={appFeatures} />
		Include dark/light/system theme icon</label
	>
	<ClickableLine cssclass='clickable-line' labelText='Include Login module to add Login Page' callback={{callback:setModel,arg:'Login'}} />
	<ClickableLine cssclass='clickable-line' labelText='Include Register module to add Register Page' callback={{callback:setModel,arg:'Register'}} />

	<div class="radio-check-groups">
		<div class="authentication">
			{#each ['pasword-based', 'multi-factor MFA', 'certificate-based', 'token-based JWT'] as auth (auth.slice(0, 4))}
				<label>
					<input type="radio" name="auths" value={auth} />
					{auth}
				</label>
			{/each}
		</div>
		<div class="authorization">
			{#each ['JSON Web Tokens JWT', 'API Keys', 'Bearer Tokens', 'Digest Authentication', 'Mutual TLS'] as auth (auth.slice(0, 4))}
				<label>
					<input type="radio" name="author" value={auth} />
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
					Tooltip component</label
				>
			</div>
			<div class="checkbox-item">
				<label for="CRSummaryDetail"
					><input id="CRSummaryDetail" type="checkbox" value="CRSummaryDetail" bind:group={crComponents} />
					Summary/Details component</label
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
	<div class="cr-grid-wrapper">
		{@render pageByPageNote()}
	</div>
	<div id="rightColumnId" class="cr-right-column">
		<div id="schemaContainerId">
			{#if isLoading}
				<div class="spinner-wrapper"><span class="spinner"></span><span>Loading models...</span></div>
			{:else}
				{@render summaryPrismaModel()}
				<p id="ormModelTooltipId" class="cr-prisma-remove-hint">click, add to candidates</p>
			{/if}
		</div>
	</div>
	<p class="orm-models-caption">Route Names and ORM Models</p>
	<p class="select-all" onclick={toggleCheckboxes} aria-hidden={true}>(select all)</p>
</div>

<style lang="scss">
	:root {
		--login: 'Include Login module to add Login Page';
		--register: 'Include Register module to add Register Page';
	}
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
		padding: 0.6rem 0 0 0.6rem;
		column-gap: 1rem;
		margin-top: 0.5rem;
		width: 100vw;
		height: 90vh;
		align-items: start;
		// border-bottom: 1px solid gray;
	}

	.cr-grid-wrapper {
		// display: grid;
		// grid-template-columns: 27rem 12rem;
		// column-gap: 0.5rem;
		// row-gap: 1rem;
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
	// .cr-middle-column {
	// 	@include container($head: 'Data-Entry Fields', $head-color: navy);
	// 	position: relative;
	// 	border: 1px solid gray;
	// 	border-radius: 5px;
	// 	padding: 1rem 6px 0 6px;
	// 	height: 76vh;
	// 	width: 12rem;
	// 	background-color: var(--panel-bg-color);
	// 	/* overflow-y: auto;	 */ /* cuts container's header */
	// }

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
		width: 13.6rem;
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
	.model-checkboxes {
		color: navy;
	}
	.app-labels {
		color: var(--checkbox-label-color);
		margin: 3px 0 3px 1rem;

		&:last-of-type {
			margin-bottom: 1rem;
		}
	}

	details:last-of-type[open]::details-content {
		width: 25.9rem;
		background-color: #f0f0f0;
		border-bottom-left-radius: 8px;
		border-bottom-right-radius: 8px;
	}
	details:last-of-type[open] summary {
		background-color: var(--summary-bg-color);
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
	:global(.clickable-line){
		margin-left:2.6rem;
		font-size:15px!important;
	}
</style>
