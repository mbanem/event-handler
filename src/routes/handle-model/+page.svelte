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
