<!--
@component
Component acts on a list of elements sent as a $props() to component
displaying as a tooltip an HTML container element, defined in parent,
whose reference is sent to compoonent as $props(). The tooltip holds 
a block of radio button group, which on select adds the selected list 
element to an additional model whouse modelName is a value of selected
radio button
-->

<script lang="ts">
	import { tick, onMount } from 'svelte';
	import { sleep } from '$lib/utils';
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
		tooltipBlockEl: HTMLDivElement;
	};
	let { models, tooltipBlockEl }: TProps = $props();

	let candidateModels = $state<string[]>([]);
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
	let hoveredEl: HTMLElement | null = null;
	let modelName = '';
	let det: HTMLDetailsElement;

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
	function addFieldToModel(e: Event) {
		const modelName = (e.target as HTMLInputElement).value;
		const fieldName = hoveredEl?.innerText as string;
		models[modelName].fields.push(getUIField(fieldName));
		// after adding the field to a model clear selected
		// radio button and hide the radio button block
		(e.target as HTMLInputElement).checked = false;
		tooltipBlockEl.style.opacity = '0';
		// console.log(models.Login, models.Register);
	}
	let busy = false;
	let timer: ReturnType<typeof setTimeout>;
	function outOfBound(e: MouseEvent) {
		const rect = modelWrapperEl.getBoundingClientRect();
		return e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom;
	}
	async function showTBTooltip(e: MouseEvent) {
		if (outOfBound(e)) {
			clearTimeout(timer);
			tooltipBlockEl.style.opacity = '0';
		}
		if ((e.target as HTMLElement).tagName !== 'SECTION') {
			return;
		}
		if (e.type === 'mouseover') {
			timer = setTimeout(() => {
				busy = false;
			}, 2000);
			busy = true;
			const { x, y } = (e.target as HTMLElement).getBoundingClientRect();
			tooltipBlockEl.style.opacity = '1';
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
			if (busy) {
				return;
			}
			tooltipBlockEl.style.opacity = '0';
			hoveredEl = null;
		}
	}
	let modelWrapperEl: HTMLDivElement;
	async function expandModelFields(e: MouseEvent) {
		await tick();
		det = (e.target as HTMLElement).parentElement as HTMLDetailsElement;
		modelName = det.innerText?.match(/^\S+/)?.[0] as string;
		Object.values(modelWrapperEl.children).forEach((el) => {
			if (det.open) {
				tooltipBlockEl.classList.remove('hidden');
				if (det !== el.children[2]) {
					(el as HTMLElement).classList.add('hidden');
				}
			} else {
				tooltipBlockEl.classList.add('hidden');
				(el as HTMLElement).classList.remove('hidden');
			}
		});
		// add on hover event litener
		if (det.open) {
			modelWrapperEl.addEventListener('mouseover', showTBTooltip);
			modelWrapperEl.addEventListener('mouseout', showTBTooltip);
		} else {
			modelWrapperEl.removeEventListener('mouseover', showTBTooltip);
			modelWrapperEl.removeEventListener('mouseout', showTBTooltip);
		}
	}
	function hideTooltipBlock() {
		clearTimeout(timer);
		tooltipBlockEl.style.opacity = '0';
	}
	function addNewMOdels() {
		Object.values(tooltipBlockEl.children)
			.slice(0, -1)
			.forEach((el) => {
				models[(el as HTMLElement).innerText] = { fields: [], attrs: [] };
			});
	}
	onMount(() => {
		tooltipBlockEl.style.opacity = '0';
		addNewMOdels();
		tooltipBlockEl.addEventListener('change', addFieldToModel);
		tooltipBlockEl.addEventListener('mouseleave', hideTooltipBlock);
		return () => {
			modelWrapperEl.removeEventListener('change', addFieldToModel);
			tooltipBlockEl.removeEventListener('mouseleave', hideTooltipBlock);
		};
	});
</script>

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

				<div class="X-{modelName} cr-fields-column" data-event-list="click mouseover mouseout">
					{#each model.fields as field (field.name)}
						{@const attrClass = fieldAttrsClass(field) as string}
						<section>{field.name}</section>
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
{/snippet}
<div class="container">
	<div id="schemaContainerId" onclick={expandModelFields} aria-hidden={true}>
		<p class="orm-models-caption">Route Names and ORM Models</p>
		<p class="select-all" onclick={toggleCheckboxes} aria-hidden={true}>(select all)</p>
		<div bind:this={modelWrapperEl} style="padding:0;margin:0;overflow-y:auto;">
			{@render summaryPrismaModel()}
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
	.snippet-wrapper {
		width: max-content;
		// overflow-y: auto;
		border: 1px solid red;
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
		position: relative;
		width: 22rem;
		height: 88vh;
		border: 1px solid gray;
		border-radius: 6px;
		padding-top: 1rem;
	}
	.model-details {
		width: 21.5rem;
	}
	.container {
		width: 22rem;
		margin-top: 1rem;
	}
	details {
		width: 22rem;
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

	details:last-of-type[open]::details-content {
		width: 21.5rem;
		background-color: #f0f0f0;
		border-bottom-left-radius: 8px;
		border-bottom-right-radius: 8px;
	}
	details:last-of-type[open] summary {
		background-color: var(--summary-bg-color);
	}
	.hidden {
		display: none;
	}
</style>
