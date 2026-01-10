<script lang="ts">
	type Model = {
		fields: { name: string; type: string; attrs?: string }[]; // fixed the array syntax
		attrs?: string[]; // e.g. ["@@map(\"users\")", "@@index([email])"]
	};
	type Models = Record<string, Model>; // key is the model name
	const models: Models = {}; // No error! when ussing an empty object

	/* usage */
	const fn = 'id';
	const type = 'number';
	const attrs = 'SERIAL PRIMARY KEY';

	// using fn for name property, so entry should be: name: fn
	// but we use name equal prop nema for type and attrs
	models['Category'] = {
		fields: [{ name: fn, type, attrs }],
		attrs: ['@@map("category")']
	};
	models.Category.fields.push({ name: 'firstName', type: 'string' });
	models.Category.fields.push({ name: 'createdAt', type: 'Date', attrs: '@default(uuid())' });

	models['User'] = {
		fields: [
			{ name: 'id', type: 'string', attrs: '@id @default(uuid()' },
			{ name: 'firstName', type: 'string' },
			{ name: 'lastName', type: 'string' },
			{ name: 'createdAt', type: 'Date', attrs: '@default(now()) @map("created_at")' }
		],
		attrs: ['@@map("users")', '@@unique(name: "fullNameEmail", [firstName, lastName, email])']
	};
	models['Todo'] = {
		fields: [
			{ name: 'id', type: 'string', attrs: '@id @default(uuid()' },
			{ name: 'title', type: 'string' },
			{ name: 'content', type: 'string' },
			{ name: 'createdAt', type: 'Date', attrs: '@default(now()) @map("created_at")' }
		],
		attrs: ['@@map("todo")']
	};
	console.log(models);
	// type Models = Record<string, Model>;
	// Object.entries(models) returns [key, value] where key is the modelName value is the model
	// the value could be destructured further as { fields, attrs } without mantioning value
	for (const [modelName, { fields, attrs }] of Object.entries(models)) {
		console.log('modelName', modelName, 'modelAttrs', attrs);
		for (const { name, type, attrs } of fields) {
			console.log('fieldProps', name, type, attrs);
		}
		if (attrs) {
			for (const attr of attrs) {
				console.log('modelAttr', attr);
			}
		}
	}
</script>

<div class="main">
	<pre class="wrapper">
	{#each Object.entries(models) as [modelName, { fields, attrs }] (modelName)}
			<p class="model-name">{modelName}	</p>	
	{#each fields as field (field.name)}
				<p style="paddng0;margin:0;">{JSON.stringify(field, null, 2)}</p>
			{/each}
		{/each}
</pre>
</div>

<style lang="scss">
	pre {
		color: navy;
		font-size: 13px;
		tab-size: 16px;
		width: max-content;
		padding: 0;
		margin: 0;
		.model-name {
			width: calc(100% - 2rem);
			background-color: lightgray;
			font-size: 20px;
			font-family: 'Comic Sans MS', 'Comic Sans', cursive;
			padding: 3px 3px 3px 1rem;
			height: 1.5rem;
		}
	}
	.main {
		margin: 0 auto;
		border: 1px solid gray;
		border-radius: 10px;
		margin-left: 15rem;
		width: max-content;
		height: 80vh;
		overflow-y: auto;
		padding: 1rem;
	}
	.wrapper {
		display: grid;
		grid-template-rows: 3.5rem;
		grid-auto-rows: 3.5rem;
		gap: 0;
	}
</style>
