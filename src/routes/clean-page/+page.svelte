<script lang="ts">
	import { onMount } from 'svelte';
	import { schema } from './schema_prisma';
	import { handleTryCatch } from '$lib/utils/index';
	type Field = { name: string; type: string; attrs?: string };
	type Model = {
		fields: { name: string; type: string; attrs?: string }[];
		attrs?: string[];
	};
	type Models = Record<string, Model>;
	let models: Models = {};
	let uiModels: Models = {};
	let nuiModels: Models = {};

	const UI = {
		ui: 'ui',
		namesOnly: 'namesOnly',
		nonUI: 'nonUI',
		all: 'all'
	} as const;
	type UIType = (typeof UI)[keyof typeof UI];

	const ordered = [
		'id',
		'authorId',
		'userId',
		'employeeId',
		'customerId',
		'ownerId',
		'firstName',
		'lastName',
		'middleName',
		'name',
		'completed',
		'profileId',
		'dob',
		'dateOfBirth',
		'email',
		'password',
		'bio',
		'biography',
		'address',
		'city',
		'state',
		'title',
		'content',
		'category',
		'role',
		'priority',
		'price',
		'updatedAt'
	];
	let strModelNames = '|';
	const modelRegex = /model\s+(\w+)\s*{([^}]*)}/gms;

	// FIELDS
	let msgEl: HTMLDivElement;
	let fieldsListEl: HTMLDivElement;
	let fieldNameEl: HTMLInputElement;
	let removeHintEl: HTMLParagraphElement;
	let schemaContainerEl: HTMLDivElement;
	let rightColumnEl: HTMLDivElement;
	let middleColumnEl: HTMLDivElement;
	let routeLabelNode: HTMLElement;
	let routeNameEl: HTMLInputElement;
	let labelEl: HTMLLabelElement;
	let timer: NodeJS.Timeout | string | number | undefined; //ReturnValue<typeof setTimeout>;

	const sleep = async (ms: number) => {
		return new Promise((resolve) => {
			setTimeout(() => {
				// ms here is a dummy but required by
				// resolve to send out some value
				resolve(ms);
			}, ms);
		});
	};
	/**
	 * check if field is UI/data-entry field
	 * @param field: type Field= { name: string; type: string; attrs?: string }
	 */
	function isUICandidate({ name, type, attrs }: Field): boolean {
		type = type.toLowerCase().trim();
		attrs = attrs ?? '';
		if (strModelNames.indexOf(`|${type}|`) !== -1 || strModelNames.indexOf(`|${name}|`) !== -1) {
			return false;
		}
		if (
			/[\|\|]/.test(type) ||
			name.includes('@@') ||
			(type === 'Date' && /createdAt/i.test(name)) ||
			/hash|token/i.test(name)
		) {
			return false;
		}
		const ui =
			/\b@id @default(uuid())\b/i.test(attrs) ||
			['string', 'number', 'boolean', 'role'].includes(type);

		return ui;
	}

	/**
	 * makes list od model name |User|Profile|Todo|...
	 * @param schema.prisma
	 */
	function makeStrModelNames(schemaContent: string) {
		let modelMatch = null;
		while ((modelMatch = modelRegex.exec(schemaContent)) !== null) {
			strModelNames += modelMatch[1] + '|';
		}
	}

	/**
	 *  leading array part sorted by orderd followed by leftowers
	 */
	function sortModelsByOrdered(models: Models, kind: UIType = UI.all) {
		let orderedFields: { name: string; type: string; attrs?: string }[] = [];
		let leftoverFields: { name: string; type: string; attrs?: string }[] = [];
		// const uiModels:Models = {}
		// const nuiModels:Models = {}
		for (const [modelName, model] of Object.entries(models)) {
			// must create entry for model name as uiModels[modelName].fields
			// as two step deep does not exists yet
			uiModels[modelName] = { fields: [], attrs: [] };
			nuiModels[modelName] = { fields: [], attrs: [] };
			if (kind === UI.ui || kind === UI.all) {
				for (const key of ordered) {
					// ordered array holds UI/data-entry field names
					orderedFields.push(model.fields.find((field) => field.name === key) as Field);
				}
				for (const field of model.fields) {
					// for rest of fields not selected by ordered test if they are UI candidates
					if (!orderedFields.includes(field) && isUICandidate(field)) {
						orderedFields.push(field);
					}
				}
			}
			for (const field of model.fields) {
				if (!orderedFields.includes(field)) {
					leftoverFields.push(field);
				}
			}
			orderedFields = orderedFields.filter(Boolean);
			uiModels[modelName].fields = orderedFields;
			nuiModels[modelName].fields = leftoverFields;
			nuiModels[modelName].attrs = models[modelName].attrs;
			// prepare for next model
			orderedFields = [];
			leftoverFields = [];
		}
		return [uiModels, nuiModels];
	}

	/**
	 * build const models:RMNameMInfo = Record<ModelName, ModelInfo>
	 * @param (schemaContent) from schema.prisma
	 */
	function parsePrismaSchema(schemaContent: string): void {
		models = {};
		type Fields = { name: string; type: string; attrs?: string }[];
		let fields: Fields = [];
		makeStrModelNames(schemaContent);
		let modelMatch = null;

		try {
			while ((modelMatch = modelRegex.exec(schemaContent)) !== null) {
				const [, modelName, body] = modelMatch;
				const modelAttrs: string[] = [];

				// // Remove block comments first
				let bodyWithoutBlocks = body.replace(/\/\*[\s\S]*?\*\//g, '');

				let lines = bodyWithoutBlocks
					.split('\n')
					.map((line) => line.trim().replace(/\s{2,}|\t/gm, ' '))
					.filter(Boolean);

				for (let line of lines) {
					line = line
						.trim()
						.replace(/String/g, 'string')
						.replace(/DateTime/g, 'Date')
						.replace(/Int/g, 'number')
						.replace(/Boolean/g, 'boolean')
						.replace(/[?]/g, '');

					if (line.startsWith('//')) {
						continue;
					}

					const parts = line.split(/\s+/); // split on whitespace

					if (line.startsWith('@@')) {
						// Block attribute
						modelAttrs.push(line);
					} else if (parts.length >= 2) {
						// build fields incrementally
						fields.push({
							name: parts[0],
							type: parts[1],
							attrs: parts.slice(2).join(' ')
						});
					}
				}
				models[modelName] = {
					fields: fields, //: sortObjectKeys(fields),
					attrs: modelAttrs
				};

				fields = [];
			}
		} catch (err) {
			console.log('Again!');
			handleTryCatch(err);
		}
		[uiModels, nuiModels] = sortModelsByOrdered(models, UI.all);
		models = {};
	}

	parsePrismaSchema(schema);
	let pmSD = ``;
	// models = uiModels another reference to tht same uiModel
	// so we must deep copy to models
	models = {};
	for (const [modelName, model] of Object.entries(uiModels)) {
		models[modelName] = { fields: [], attrs: [] };
		models[modelName].fields = model.fields;
	}
	for (const [modelName, model] of Object.entries(models)) {
		// console.log(modelName, model);
		model.fields = [...model.fields, ...nuiModels[modelName].fields];
		model.attrs = nuiModels[modelName].attrs;
	}
	// console.log('models', models)

	// Object.entries() return [key,value] key is modelName, value is model
	// fields cannot be deeply destructured as it is an array, whic is not destructurable
	for (const [modelName, model] of Object.entries(models)) {
		// console.log(modelName, model)
		pmSD += `<div class='prisma-model-block>'>
		<details>
			<summary class='model-name'>${modelName}</summary>
				<div  class='fields-column'>
				`;
		// console.log(model.fields, model.attrs)
		for (const field of model.fields) {
			// console.log('RR', field);
			const { name, type, attrs } = field;
			if (
				attrs?.includes('@id') ||
				attrs?.includes('@default') ||
				attrs?.includes('@updatedAt') ||
				attrs?.includes('@unique')
			) {
				const color = attrs.includes('@id') ? 'lightgreen' : 'pink';
				pmSD += `<p>${name}</p><p>type:${type} <span style='color:${color}'>${attrs ?? 'na'}</span></p>`;
			} else {
				pmSD += `<p>${name}</p><p>type:${type} ${attrs ?? 'na'}</p>`;
			}
		}
		pmSD += `</div>
		`;
		for (const attr of model.attrs as string[]) {
			pmSD += `<p class='model-attr'>${attr}</p>
			`;
		}
		pmSD += `</details>
		</div>
		`;
	}
	// for removing element from the fields list every fieldName is given short id
	// as data-field-index HTML attribute and received on click event and read
	const getUniqueId = () => {
		// convert to a string of an integer from base 36
		return Math.random().toString(36).slice(2);
	};
	// FieldsList elements use inline style for high specificity as they are created dynamically
	// by inserting innerHTML, so the inline style is in the listElCSS variable
	// const listElCSS = `color:black; font-size:16px; font-weight: 400;color:navy;
	// background-color: skyblue; margin: 1px 0 0 0;line-height:20px;
	// `;

	// we do not clear all the entries and rebuild from the fields
	// but just add a newly entered in the Field Name fieldNameId
	let fields: string[] = [];
	function closeDetails(dets: HTMLCollection) {
		for (const child of Object.entries(dets)) {
			(child[1].children[0] as HTMLElement).removeAttribute('open');
		}
	}
	function getListEls() {
		return (fieldsListEl as HTMLDivElement).querySelectorAll(
			'.list-el'
		) as NodeListOf<HTMLDivElement>;
	}
	function clearListEls() {
		(fieldsListEl as HTMLDivElement).innerHTML = '';
	}
	function isInListEls(field: Field) {
		let found = false;
		// check if field is already in the candidates list
		const regex = new RegExp(`\\b${field.name}\\b`);
		getListEls().forEach((listEl) => {
			if (regex.test((listEl.firstElementChild as HTMLSpanElement).innerText)) {
				found = true;
			}
		});
		return found;
	}
	function renderField(fieldName: string) {
		const listEls = getListEls();
		const fieldNameFromIndex = (index: string) => {
			let name = '';
			listEls.forEach((listEl) => {
				if (listEl.dataset.fieldIndex === index) {
					name = (listEl.firstChild as HTMLDivElement)?.innerText;
				}
			});
			return name;
		};
		// Create elements
		const span = document.createElement('span');
		span.className = 'field-text';
		span.textContent = fieldName;

		const div = document.createElement('div');
		div.className = 'list-el';
		div.dataset.fieldIndex = getUniqueId();
		// div.style.cssText = listElCSS;

		// Append span to div
		div.appendChild(span);
		// append div to the fieldsListEl
		(fieldsListEl as HTMLDivElement).appendChild(div);

		// so getBoundingClientRect() can be destructured
		// const { x, y } = (fieldsListEl as HTMLDivElement).getBoundingClientRect()
		setTimeout(() => {
			const listEls = (fieldsListEl as HTMLDivElement).querySelectorAll(
				'.list-el'
			) as NodeListOf<HTMLDivElement>;
			listEls.forEach((el) => {
				el.addEventListener('mouseenter', () => {
					// if (noRemoveHint) return;
					removeHintEl.style.top = String(el.offsetTop - el.offsetHeight) + 'px';
					removeHintEl.style.left = String(el.offsetLeft + 12) + 'px';
					removeHintEl.style.opacity = '1';
				});

				el.addEventListener('mouseleave', () => {
					removeHintEl.style.opacity = '0';
				});

				el.addEventListener('click', () => {
					removeHintEl.style.opacity = '0';

					if (fieldNameEl.value === '') {
						fieldNameEl.value = el.innerText;
						fieldNameEl.focus();
					}
					const index = el.dataset.fieldIndex;
					const fieldName = fieldNameFromIndex(index as string);
					fields = fields.filter((fname) => fname !== fieldName);
					el.remove();
				});
			});
		}, 400);
	}

	const scroll = (el: HTMLDivElement) => {
		if (el.offsetHeight + el.scrollTop > el.getBoundingClientRect().height - 20) {
			setTimeout(() => {
				el.scrollTo(0, el.scrollHeight);
			}, 0);
		}
	};
	function adjustFiledNameAndType(val: string) {
		val = val.replace(/\\s+/g, '');

		const m = val.match(/\s*([a-zA-z0-9_]+)\s*:?\s*([a-zA-z0-9_]+)?$/);
		if (!m) return val;
		if (m[2]) {
			val = `${m[1]}: ${m[2]}`;
		} else {
			val = `${m[1]}: string`;
		}
		return val;
	}
	function clearLabelText() {
		clearTimeout(timer);

		labelEl.style.color = '';
		routeLabelNode.textContent = 'Route Name';
	}
	function changeLabelText(color: string, text: string, duration: number) {
		// Update the first (and likely only) text node
		const nodeText = routeLabelNode.textContent;
		// vscode.postMessage({command:'log', text: 'found textNode '+ nodeText})
		routeLabelNode.textContent = text;
		labelEl.style.color = color;
		timer = setTimeout(() => {
			routeLabelNode.textContent = nodeText;
			labelEl.style.color = '';
		}, duration);
	}
	setTimeout(() => {
		if (fieldNameEl!) {
			(fieldNameEl as HTMLInputElement).addEventListener('change', (event: Event) => {
				const value = (event.target as HTMLInputElement).value.trim().replace(/:\s*?/, ': ');
				if (fields.includes(value)) {
					setTimeout(() => {
						(fieldNameEl as HTMLInputElement).style.color = 'red';
					}, 0);
				} else {
					(fieldNameEl as HTMLInputElement).style.color = 'black';
				}
			});
			(fieldNameEl as HTMLInputElement).addEventListener('keyup', (event) => {
				// vscode.postMessage({command: 'log',  text: 'fieldNameEl.addEventListener created' });
				let value = (fieldNameEl as HTMLInputElement).value
					.trim()
					.replace(/\\bstring\\b/, 'String');
				if (!value) {
					// vscode.postMessage({command: 'log',  text: 'field is empty' });
					return;
				}
				value = adjustFiledNameAndType(value);
				if (fields.includes(value)) {
					setTimeout(() => {
						(fieldNameEl as HTMLInputElement).style.color = 'red';
					}, 0);
					return;
				}
				if ((fieldNameEl as HTMLInputElement).style.color === 'red') {
					(fieldNameEl as HTMLInputElement).style.color = 'black';
				}
				if (event.key !== 'Enter') return;
				fields.push(value);
				// disableCreateButton();
				renderField(value);
				(fieldNameEl as HTMLInputElement).value = '';
				scroll(fieldsListEl as HTMLDivElement as HTMLDivElement);
			});
		} else {
			console.log('NO keyup on fieldNameEl');
		}
	}, 200);
	// let fields: string[] = [];

	onMount(() => {
		fieldNameEl = document.getElementById('fieldNameId') as HTMLInputElement;
		msgEl = document.getElementById('msgId') as HTMLDivElement;
		schemaContainerEl = document.getElementById('schemaContainerId') as HTMLDivElement;
		fieldsListEl = document.getElementById('fieldsListId') as HTMLDivElement;
		middleColumnEl = document.getElementById('middleColumnId') as HTMLDivElement;
		rightColumnEl = document.getElementById('rightColumnId') as HTMLDivElement;
		removeHintEl = document.getElementById('removeHintId') as HTMLParagraphElement;
		routeNameEl = document.getElementById('routeNameId') as HTMLInputElement;
		removeHintEl.style.opacity = '0'; // make it as a hidden tooltip
		labelEl = document.querySelector("label[for='routeNameId']") as HTMLLabelElement;
		routeLabelNode = labelEl.firstElementChild as HTMLElement;
		schemaContainerEl.innerHTML = pmSD;
		const enterKeyEvent = new KeyboardEvent('keyup', {
			key: 'Enter',
			code: 'Enter',
			keyCode: 13,
			which: 13,
			bubbles: true
		});
		schemaContainerEl!.addEventListener('click', async (event: MouseEvent) => {
			if ((event.target as HTMLElement).tagName === 'SUMMARY') {
				middleColumnEl.classList.toggle('middle-column-height');
				modelName = (event.target as HTMLElement).innerText;
				const details = (event.target as HTMLElement).closest('details');
				if (details && details.open) {
					stopRenderField = true;
					setTimeout(() => {
						// has to use setTimeout as the element is still in opening
						details.removeAttribute('open');
						stopRenderField = false;
						(fieldsListEl as HTMLDivElement).innerHTML = '';
					}, 200);
					clearLabelText();
					return;
				}
				routeNameEl.value = modelName.toLowerCase();
				//    routeNameEl.focus()
				//    routeNameEl.click()
				// console.log('uiModels[modelName].fields', uiModels[modelName].fields);
				// let candidates = ``;
				fields = [];
				clearListEls();
				for (const field of uiModels[modelName].fields) {
					if (stopRenderField) {
						break;
					}
					fields.push(`${field.name}: ${field.type}`);
					if (fieldNameEl) {
						fieldNameEl.value = field.name;
						fieldNameEl.dispatchEvent(enterKeyEvent);
						await sleep(100);
					}
					renderField(`${field.name}: ${field.type}`);
				}

				changeLabelText('pink', 'Change Route Name if necessary', 4000);
				//----------------
			} else {
				// clicked on a field name in details section
				const fieldName = (event.target as HTMLDivElement).innerText;
				const { type } = uiModels[modelName].fields.filter(
					(field) => field.name === fieldName
				)[0] as Field;
				if (isInListEls({ name: `${fieldName}`, type: `${type}` })) {
					return;
				}
				renderField(`${fieldName}: ${type}`);
			}
		});
	});
	// -----------------------------------
	// for Wevschema Extension
	let modelName = '';
	let stopRenderField = false;
	function closeSchemaModels() {
		stopRenderField = true;
		fields = [];
		routeNameEl.value = '';
		fieldNameEl.value = '';
		const children = schemaContainerEl?.children as HTMLCollection;
		closeDetails(children);
		setTimeout(() => {
			fieldsListEl.innerHTML = '';
			stopRenderField = false;
		}, 100);
	}
</script>

<div id="crudUIBlockId" class="main-grid">
	<div class="grid-wrapper">
		<pre class="span-two">
To create a UI Form for CRUD operations against the underlying ORM fill
out the <i>Candidate Fields</i> by entering field names in the <i>Field Name</i> input
box with its datatype, e.g. firstName: string,  and pressing the Enter key
or expand a table from the <i>Select Fields from ORM</i> block and click on
a field name avoiding the auto-generating fields usually colored in pink.
The UI Form +page.svelte with accompanying +page.server.ts will be 
created in the route specified in the Route Name input box.
      </pre>

		<div class="left-column">
			<label for="routeNameId">
				Route Name
				<input id="routeNameId" type="text" />
			</label>
			<label for="fieldNameId">
				Field Name
				<input id="fieldNameId" type="text" />
			</label>
			<button id="createBtnId" disabled>Create CRUD Support</button>
			<div class="crud-support-done hidden"></div>
			<div id="messagesId" style="z-index:10;width:20rem;">Messages:</div>
		</div>

		<div id="middleColumnId" class="middle-column middle-column-height">
			<span class="candidate-fields-caption">Candidate Fields</span>
			<div class="fields-list fields-list-height" id="fieldsListId"></div>
			<p id="removeHintId" class="remove-hint">click to remove</p>
		</div>

		<div style="display:flex;height:1.4re !important;margin:0;padding:0;">
			<input
				id="inputBoxWidthId"
				type="text"
				value="16rem"
				style="margin:0 1rem 0 0; padding:0 0 0 1rem;width:7rem;height:1.4rem !important;line-height:1.1rem;display:inline-block;"
				placeholder="CSS px, rem, ..."
			/>
			<label for="CRInput" style="display:inline-block;width:max-content"
				>All input boxes CSS width</label
			>
		</div>
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
	</div>

	<div id="rightColumnId" class="right-column">
		<span class="prisma-model-caption-one">Select Fields from ORM</span>
		<span
			class="prisma-model-caption-two"
			onclick={closeSchemaModels}
			onkeypress={closeSchemaModels}
			role="button"
			tabindex="0">(collapse all)</span
		>
		<div id="schemaContainerId"></div>
	</div>
</div>

<input type="text" id="fieldNameId" placeholder="fieldNameEl" />
<div id="msgId">
	Messages {strModelNames}
</div>

<!-- <pre>models {JSON.stringify(models, null, 2)}</pre> -->

<style lang="scss">
	.main-grid {
		display: grid;
		grid-template-columns: 33rem 20rem;
	}

	.grid-wrapper {
		display: grid;
		grid-template-columns: 20rem 12rem;
		column-gap: 0.5rem;
		row-gap: 1rem;
	}
	.crud-support-done {
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
	.left-column {
		border: 1px solid gray;
		border-radius: 8px;
		height: 75vh;
	}
	// .grid-wrapper {
	// 	display: grid;
	// 	grid-template-columns: 12rem 20rem;
	// 	gap: 0.5rem;
	// 	align-items: start;
	// 	border: 1px solid gray;
	// 	border-radius: 10px;
	// 	width: fit-content;
	// }

	.middle-column {
		position: relative;
		border: 1px solid gray;
		border-radius: 5px;
		padding: 1rem 6px 0 6px;
		margin-top: 1.45rem;
		height: auto;
	}
	.middle-column .middle-column-height {
		height: 30rem !important;
	}
	.middle-column .candidate-fields-caption {
		position: absolute;
		top: -1.5rem;
		left: 0.5rem;
		color: skyblue;
	}
	.fields-list {
		// position: relative;
		display: grid;
		grid-template-rows: 1.3rem;
		grid-auto-rows: 1.3rem;
		cursor: pointer;
		text-align: center;
		padding: 0;
		margin: 0 0 2rem 0;
		p {
			padding: 0;
			margin: 0;
			height: 1rem;
		}
	}
	.remove-hint {
		position: absolute;
		left: 1.5rem !important;
		z-index: 10;
		font-size: 12px;
		color: red;
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
	.right-column {
		position: relative;
		border: 1px solid gray;
		border-radius: 6px;
		padding: 6px 3px 8px 10px;
		margin-top: 1.5rem;
	}
	.span-two,
	pre {
		grid-column: 1 / span 2;
		text-align: justify;
		font-size: 12px;
		color: skyblue;
	}
	:global(.list-el) {
		// position: relative;
		width: 100%;
		height: 20px;
		text-align: center;
		font-size: 16px;
		font-weight: 400;
		color: navy;
		background-color: skyblue;
		margin: 1px 0 0 0;
		line-height: 20px;
		:global(p:first-child) {
			border-top-left-radius: 6px !important;
			border-top-right-radius: 6px !important;
			background-color: yellow;
		}
		:global(p:last-child) {
			border-bottom-left-radius: 6px !important;
			border-bottom-right-radius: 6px !important;
		}
	}

	.list-el:hover {
		cursor: pointer;
	}
	.field-text {
		// position: relative;
		display: block;
		height: 20px;
		text-align: center;
	}

	// .model-name {
	// 	color: #3e3e3e;
	// 	background-color: #e3e3e3;
	// 	margin-top: 3px;
	// 	width: calc(100% - (1rem));
	// 	border-radius: 6px;
	// 	padding-left: 1rem;
	// 	cursor: pointer;
	// }
	// .right-column {
	//   position: relative;
	//   grid-column: 2;
	//   border: 1px solid gray;
	//   border-radius: 5px;
	//   margin-top: 1.45rem;
	// }
	#schemaContainerId {
		height: 30rem;
		overflow-y: auto;
	}

	.right-column {
		.prisma-model-caption-one,
		.prisma-model-caption-two {
			position: absolute;
			top: -1.5rem;
			left: 0.5rem;
			display: inline-block;
			color: skyblue;
			cursor: pointer;
		}
		.prisma-model-caption-two {
			left: 15rem;
			font-size: 13px;
			line-height: 22px;
		}
	}
	.hidden {
		display: none;
	}
	:global(.model-attr) {
		grid-column: span 2;
		width: 18rem;
		padding: 0;
		margin: 0 0 0 1rem;
		text-wrap: wrap;
		color: tomato;
		font-size: 13px;
	}
	:global(.prisma-model-block) {
		height: 30rem;
		// width: 12rem;
		overflow-y: auto;
	}
	:global(.model-name) {
		color: #3e3e3e;
		background-color: #e3e3e3;
		margin-top: 3px;
		width: 18rem;
		border-radius: 6px;
		padding-left: 1rem;
		cursor: pointer;
	}

	:global(.fields-column) {
		display: grid;
		grid-template-columns: 7rem 9.5rem;
		column-gap: 5px;
		width: max-content;
		padding: 6px 0 6px 1rem;
		height: auto;
		font-family: Georgia, 'Times New Roman', Times, serif;
		font-size: 15px !important;
		font-weight: 500 !important;
	}

	:global(.fields-column p) {
		margin: 4px 0 0 0;
		padding: 2px 0 0 4px 6pc;
		border-bottom: 1px solid lightgray;
		text-wrap: wrap;
	}

	:global(.fields-column p:nth-child(odd)) {
		color: skyblue;
		cursor: pointer;
		width: 100%;
		padding: 2px 0 2px 0.5rem;
	}

	:global(.fields-column p:nth-child(even)) {
		font-weight: 400 !important;
		font-size: 12px !important;
	}
</style>
