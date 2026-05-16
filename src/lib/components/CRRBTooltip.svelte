<!--
@component
-->

<script lang="ts">
	import { tick, onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { sleep, capitalize } from '$lib/utils';
	type Model = {
		fields: Field[];
		attrs?: string[];
	};
	type Models = Record<string, Model>;
	type Field = {
		name: string;
		type: string;
		isArray: boolean;
		isOptional: boolean;
		isDataEntry: boolean;
		attrs?: string;
	};

	type TProps = {
		models: Models;
	};
	// Receive initial models from parent
	let { models: initialModels = {} }: TProps = $props();

	// Make it deeply reactive + owned by this component
	let models = $state<Models>(structuredClone(initialModels)); // or just { ...initialModels } if shallow is enough

	let isLoading = $state(true);
	let tooltipBlockEl: HTMLDivElement;
	let candidateModels = $state<string[]>([]);
	let emptyModel = $state({ fields: [], attrs: [] });
	let includeAll = ''; // last word for models in CRRBTooltip -- here is 'Both'
	let newModelName = $state('');
	let isSummaryOpen = $state(false);
	let extraModels = new SvelteSet<string>();
	let notDataEntryField: HTMLDivElement;
	let modelWrapperEl: HTMLDivElement;
	let hoveredEl: HTMLElement | null = null;
	let addExtraModelEl: HTMLDivElement;

	let det: HTMLDetailsElement;
	const defaultMessage = 'Add/Remove extra model like Login, Admin,...';
	const alreadyDefined = 'Module is already registered';
	const notRegistered = 'Module is not registered yet';
	const noModelName = 'Please enter model name';
	let modelName = '';
	let message = $state(defaultMessage);
	let msgClass = $state('navy');
	let busy = false;
	let timer: ReturnType<typeof setTimeout>;
	const nuiRegex = new RegExp(`\\b@id|@defaults|@updatedAt|@unique\\b`, 'g');
	let x = $state(100);
	let y = $state(100);
	function fieldAttrsClass(field: Field) {
		return nuiRegex.test(field.attrs as string) ? 'attr-id' : '';
	}
	function fieldAttrs(field: Field) {
		return field.attrs ?? 'no attributes';
	}
	function toggleCheckboxes(e: MouseEvent) {
		const el = e.target as HTMLParagraphElement;
		const newState = el.innerText.includes('select all') ? true : false;
		el.innerText = newState ? '(clear all)' : '(select all)';

		(document.querySelectorAll('.model-checkboxes') as unknown as Array<HTMLInputElement>).forEach(async (chkbox) => {
			chkbox.click();
			await sleep(100);
		});
	}

	function getUIField(fieldName: string) {
		if (/password/i.test(fieldName)) {
			return {
				name: 'password',
				isDataEntry: true,
				isOptional: false,
				isArray: false,
				attrs: 'saved excrypted',
			} as Field;
		}

		return models[modelName].fields.find((field) => field.name === fieldName) as Field;
	}

	// called from tooltipBlockEl when radio button fires change event
	function addFieldToModel(e: Event) {
		console.log('addFieldToModel entry');
		const fieldName = hoveredEl?.innerText as string;
		// const modelName = (e.target as HTMLInputElement).value;
		const mName = (tooltipBlockEl.querySelector(`input[type=radio]:checked`) as HTMLInputElement).value as string;
		if (mName === includeAll) {
			const field = getUIField(fieldName);
			for (const model of extraModels) {
				models[model].fields.push(field);
			}
		} else {
			models[mName].fields.push(getUIField(fieldName));
		}
		// after adding the field to a model clear selected
		// radio button and hide the radio button block
		(e.target as HTMLInputElement).checked = false;
		// tooltipBlockEl.style.opacity = '0';
	}

	function outOfBound(e: MouseEvent) {
		const rect = modelWrapperEl.getBoundingClientRect();
		return e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom;
	}
	async function showRBTooltip(e: MouseEvent) {
		e.preventDefault();
		if (outOfBound(e)) {
			console.log('out of bound');
			clearTimeout(timer);
			// tooltipBlockEl.style.opacity = '0';
		}
		if ((e.target as HTMLElement).tagName !== 'SECTION') {
			console.log('not a SECTION');
			return;
		}
		if (e.type === 'mouseover') {
			const rbTooltip = (e.currentTarget as HTMLDivElement).lastChild as HTMLDivElement;
			console.log('rbTooltip', rbTooltip);
			console.log('mouse is over');
			const de = (e.target as HTMLElement).dataset.entry;
			const { x, y } = (e.target as HTMLElement).getBoundingClientRect();
			if (de === 'false') {
				// tooltipBlockEl.style.opacity = '0';
				Object.assign(notDataEntryField.style, {
					position: 'fixed',
					top: `${y - 12}px`,
					left: `${x}px`,
					zIndex: '9999',
					pointerEvents: 'auto',
					opacity: '1',
				});
				return;
			}
			notDataEntryField.style.opacity = '0';
			timer = setTimeout(() => {
				busy = false;
			}, 2000);
			busy = true;
			// tooltipBlockEl.style.opacity = '1';
			await tick();
			Object.assign(tooltipBlockEl.style, {
				position: 'fixed',
				top: `${y - 12}px`,
				left: `${x}px`,
				zIndex: '9999',
				pointerEvents: 'auto',
				opacity: '1',
			});
			hoveredEl = e.target as HTMLElement;
		} else {
			console.log('mouse not over');
			if (busy) {
				return;
			}
			// tooltipBlockEl.style.opacity = '0';
			// notDataEntryField.style.opacity = '0';
			// hoveredEl = null;
		}
	}

	async function toggleSummary(e: MouseEvent) {
		const el = e.target as HTMLElement;
		switch (el.tagName) {
			case 'SUMMARY':
				// console.log('summary', el, modelWrapperEl);
				// modelWrapperEl.querySelectorAll('[data-det=""]');
				for (const item of modelWrapperEl.getElementsByTagName('DETAILS')) {
					if (item.firstChild !== el) {
						Object.assign((item.parentElement as HTMLElement).style, {
							opacity: `${isSummaryOpen ? '1' : '0'}`,
							position: `${isSummaryOpen ? 'relative' : 'absolute'}`,
							top: '0',
							left: '0',
						});
					}
				}
				if (isSummaryOpen) {
					addExtraModelEl.classList.remove('hidden');
				} else {
					addExtraModelEl.classList.add('hidden');
				}
				isSummaryOpen = !isSummaryOpen;
				return;
			case 'BUTTON':
				if (el.innerText === 'add') {
					// add new model
					console.log('add', el.innerText);
				} else if (el.innerText === 'remove') {
					console.log('remove', el.innerText);
				}
				break;
			case 'SECTION':
				console.log(el.innerText);
				break;
			default:
				break;
		}
		//console.log('summary', (el.parentElement as HTMLDetailsElement).open);
		return;
	}
	async function expandDetails(e: MouseEvent) {
		e.preventDefault();
		const el = e.target as HTMLElement;
		if (el.tagName === 'SUMMARY') {
			console.log('summary', (el.parentElement as HTMLDetailsElement).open);
			return;
		}
		console.log('expandDetails', (e.target as HTMLElement).tagName);
		await tick();
		det = (e.target as HTMLElement).parentElement as HTMLDetailsElement;
		modelName = det.innerText?.match(/^\S+/)?.[0] as string;
		Object.values(modelWrapperEl.children).forEach((el) => {
			if (det.open) {
				// tooltipBlockEl.classList.remove('hidden');
				if (det !== el.children[2]) {
					(el as HTMLElement).classList.add('hidden');
				}
			} else {
				// tooltipBlockEl.classList.add('hidden');
				(el as HTMLElement).classList.remove('hidden');
			}
		});
		// add on hover event litener
		if (det.open) {
			modelWrapperEl.addEventListener('mouseover', showRBTooltip);
			modelWrapperEl.addEventListener('mouseout', showRBTooltip);
		} else {
			modelWrapperEl.removeEventListener('mouseover', showRBTooltip);
			modelWrapperEl.removeEventListener('mouseout', showRBTooltip);
		}
	}
	function hideTooltipBlock(e: MouseEvent) {
		clearTimeout(timer);
		// tooltipBlockEl.style.opacity = '0';
	}

	function showMessage(msg: string, className: string = 'tomato', milisec: number = 2000) {
		message = msg;
		msgClass = className;
		setTimeout(() => {
			message = defaultMessage;
			msgClass = 'navy';
		}, milisec);
	}
	async function addNewModel(e: MouseEvent) {
		// console.log('addNewModel');
		// console.log('tooltipBlockEl', tooltipBlockEl.children);
		e.preventDefault();
		if (!newModelName) {
			showMessage(noModelName);
			return;
		}
		const model = capitalize(newModelName);

		if (models[model]) {
			showMessage(alreadyDefined);
			newModelName = '';
			return;
		} else {
			console.log(model, 'not registered');
		}
		await tick();
		// bound to input text box

		await tick();
		extraModels.add(model);
		models[model] = emptyModel;
		newModelName = '';
	}
	function removeModel() {
		if (!newModelName) {
			showMessage(noModelName);
			return;
		}
		const model = capitalize(newModelName);

		if (!models[model]) {
			showMessage(notRegistered);
			return;
		}
		if (models[model]) {
			if (confirm('To delete {model}?')) {
				delete models[model];
				extraModels.delete(model);
			}
		}
	}
	onMount(() => {
		setTimeout(() => {
			isLoading = false;
		}, 100);
		// tooltipBlockEl = document.getElementById('tooltipBlockId') as HTMLDivElement;
		// inside the snippet but rendered without any condition, so should be ready at onMount?
		// tooltipBlockEl.style.opacity = '0';
		tooltipBlockEl.classList.remove('hidden');
		tooltipBlockEl.addEventListener('change', addFieldToModel);
		tooltipBlockEl.addEventListener('mouseleave', hideTooltipBlock);
		notDataEntryField.classList.remove('hidden');

		return () => {
			modelWrapperEl.removeEventListener('change', addFieldToModel);
			tooltipBlockEl.removeEventListener('mouseleave', hideTooltipBlock);
		};
	});
</script>

<div bind:this={tooltipBlockEl} class="radio-tooltip hidden">
	{@render tooltipBlock()}
	<div bind:this={notDataEntryField} class="no-data-entry hidden">not data entry field</div>
</div>

{#snippet tooltipBlock()}
	{#each extraModels as model (model)}
		<label><input type="radio" name={model} value={model} />{model}</label>
	{/each}
	{#if extraModels.size > 1}
		<label><input type="radio" name="All" value="To All" />All</label>
	{/if}
{/snippet}
{#snippet summaryDetailsModel(modelName: string, model: Model)}
	<div style="position:relative;">
		<input
			type="text"
			id="route{modelName}"
			value={modelName.toLowerCase()}
			style="position:absolute;top:0;left:4px;color:var(--candidate-color);background-color:var(--candidate-bg-color);width:5rem;height:1rem;padding:0 0 0 5px;margin:4px 0 0 0;border:none;font-size:14px;"
		/>
		<input
			type="checkbox"
			style="position:absolute;top:0;left:6rem;"
			value={modelName.toLowerCase()}
			bind:group={candidateModels}
			class="model-checkboxes"
		/>
		<details data-det class="model-details" id="det-{modelName}">
			<summary class="cr-model-name">
				{capitalize(modelName)}
			</summary>

			<div class="cr-fields-column">
				{#each model.fields as field (field.name)}
					{@const attrClass = fieldAttrsClass(field) as string}
					<section data-entry={field.isDataEntry}>{field.name}</section>
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
{/snippet}

{#snippet summaryDetailsModels()}
	{#each Object.entries(models) as [modelName, model] (modelName)}
		{@render summaryDetailsModel(modelName, model)}
	{/each}
{/snippet}
<div class="container">
	<div class="schema-container" onclick={toggleSummary} aria-hidden={true}>
		<p class="orm-models-caption">Route folder name for ORM Model</p>
		<p class="select-all" onclick={toggleCheckboxes} aria-hidden={true}>(select all)</p>
		<div bind:this={modelWrapperEl} style="padding:0;margin:0;overflow-y:auto;">
			{#if isLoading}
				<div class="spinner-wrapper"><span class="spinner"></span><span>Loading models...</span></div>
			{:else}
				{@render summaryDetailsModels()}
				<div bind:this={addExtraModelEl} class="add-extra-model">
					<span class={msgClass}>{message}</span>
					<input type="text" bind:value={newModelName} placeholder="Add extra model" />
					<button onclick={addNewModel}>add</button><button onclick={removeModel}>remove</button>
				</div>
			{/if}
			<!-- <div bind:this={tooltipBlockEl} class="radio-tooltip hidden" onclick={copyFieldFrom} aria-hidden={true}> -->
			<!-- radio buttons already fire onchange event for adding field to rb selected model  -->
		</div>
	</div>
</div>

<style lang="scss">
	*,
	*::before,
	*::after {
		box-sizing: border-box;
		user-select: none;
	}

	input[type='text'] {
		width: 93%;
		height: 20px;
		padding: 6px 0 8px 1rem;
		outline: none;
		font-size: 16px;
		border: 1px solid gray;
		border-radius: 4px;
		outline: 1rem solid transparent;
		margin-top: 8px;
		margin-bottom: 10px;
		&::placeholder {
			font-size: 13px;
		}
		&:focus {
			outline: 1px solid gray;
		}
	}

	.schema-container {
		position: relative;
		width: 22rem;
		height: 88vh;
		border: 1px solid gray;
		border-radius: 6px;
		padding-top: 1rem;
	}
	.spinner-wrapper {
		display: grid;
		grid-template-columns: 1em 10rem;
		column-gap: 0.5rem;
		.spinner {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 0.8em;
			height: 0.8em;
			border: 3px solid #a1c1eb;
			border-top-color: #1b4891;
			border-radius: 50%;
			margin: 4px 0 0 0.5rem;
			animation: spin 900ms linear infinite;
			span {
				display: inline-block;
			}
		}
	}
	.add-extra-model {
		width: 97%;
		color: var(--candidate-color);
		background-color: var(--candidate-bg-color);
		margin: 6px 0 0 4px;
		input {
			width: 64% !important;
			font-size: 14px;
			color: var(--candidate-color);
			background-color: var(--candidate-bg-color);
		}
		button {
			width: 3.5rem;
			padding: 0;
			&:first-of-type {
				margin-right: 4px;
			}
		}
	}
	.tomato {
		color: tomato;
	}
	.navy {
		color: navy;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	.container {
		width: 22rem;
		margin-top: 1rem;
	}
	.model-details {
		width: 21.5rem;
	}

	.orm-models-caption,
	.select-all {
		position: absolute;
		top: -1.6rem;
		left: 1rem;
		z-index: 15;
		padding: 0 5px;
		color: var(--candidate-color);
		background-color: var(--panel-bg-color);
	}
	.select-all {
		left: 16rem;
		width: 5rem;
		cursor: pointer;
		&:hover {
			border: 1px solid var(--candidate-color);
			border-radius: 4px;
		}
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
		width: 21.5rem;
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
		width: 21.5rem;
		padding: 6px 0 6px 1rem;
		max-height: 75vh;
		/*font-family: Georgia, 'Times New Roman', Times, serif;*/
		font-size: 15px;
		font-weight: 500;
		color: var(--candidate-color);
		background-color: var(--candidate-bg-color);
		overflow-y: auto;
	}

	:global(.cr-fields-column p) {
		margin: 4px 0 0 0;
		padding: 1px 0 1px 6px;
		// border-bottom: 1px solid lightgray;
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

	:global(.pink-tomato) {
		color: var(--pink-tomato);
	}
	:global(.attr-id) {
		color: var(--attr-id);
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	.model-checkboxes {
		color: navy;
	}
	details {
		width: 22rem;
	}
	details:last-of-type[open]::details-content {
		width: 21.5rem;
		background-color: #f0f0f0;
		border-bottom-left-radius: 8px;
		border-bottom-right-radius: 8px;
	}
	details:last-of-type[open] summary {
		background-color: var(--summary-bg-color);
	}
	.radio-tooltip {
		opacity: 1;
		position: fixed;
		top: 30rem;
		left: 30rem;
		z-index: 9999;
		display: flex;
		column-gap: 2px;
		pointer-events: auto;
		border-radius: 6px;
		padding: 4px 0.5rem 1px 5px;
		color: var(--candidate-color);
		background-color: skyblue;
		cursor: pointer;
	}
	.no-data-entry {
		position: fixed;
		top: 0;
		left: 0;
		color: var(--pink-tomato);
		background-color: var(--candidate-bg-color);
		width: max-content;
		padding: 2px 0.5rem;
		border: 1px solid gray;
		border-radius: 5px;
		z-index: 100;
		opacity: 0;
	}
	.hidden {
		display: none;
	}
</style>
