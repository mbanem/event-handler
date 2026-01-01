<script lang="ts">
	import { schema } from './schema_prisma';
	console.log(schema);
	type FieldInfo = {
		type: string;
		prismaAttrs: string; // everything after the type
	};

	// every model/table has fieldName  and fieldInfo
	type ModelInfo = {
		fields: {
			[fieldName: string]: FieldInfo;
		};
		modelAttributes: string[]; // e.g. ["@@map(\"users\")", "@@index([email])"]
	};

	// there are many models/tables in schema.prisma
	type SchemaModels = {
		[modelName: string]: ModelInfo;
	};
	let strModelNames = ``;
	const models: SchemaModels = {};
	const modelRegex = /model\s+(\w+)\s*{([^}]*)}/gms;

	function sortObjectKeys<T>(obj: Record<string, T>): Record<string, T> {
		return Object.fromEntries(
			/*
      "base" ignores case and diacritics (so User, user, Úser, üser all sort together).
      "accent" would keep diacritics (ú vs u) but ignore case.
      "case" would respect case but ignore accents.
      "variant" is the strictest (default) and respects everything.
      numeric sorts asc f10, f2 as f2 f10 -- not as the ascii's f10 f2
    */
			Object.entries(obj).sort(([a], [b]) =>
				a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true })
			)
		);
	}
	parsePrismaSchema(schema);
	function parsePrismaSchema(schemaContent: string): SchemaModels {
		let modelMatch;
		while ((modelMatch = modelRegex.exec(schemaContent)) !== null) {
			const [, modelName, body] = modelMatch;
			const fields: Record<string, FieldInfo> = {};
			const modelAttributes: string[] = [];

			// Remove block comments first
			let bodyWithoutBlocks = body.replace(/\/\*[\s\S]*?\*\//g, '');

			const lines = bodyWithoutBlocks
				.split('\n')
				.map((line) => line.trim().replace(/\s{2,}|\t/gm, ' '))
				.filter(Boolean);

			for (const line of lines) {
				if (line.startsWith('//')) {
					continue; // skip single-line comment
				}

				if (line.startsWith('@@')) {
					modelAttributes.push(line);
					continue;
				}

				const [fieldName, fieldType, ...rest] = line.split(/\s+/);
				if (!fieldName || !fieldType) {
					continue;
				}

				fields[fieldName] = {
					type: fieldType,
					prismaAttrs: rest.join(' ')
				};
			}
			// models[modelName] = {
			// 	fields: sortObjectKeys(fields),
			// 	modelAttributes
			// };
		}

		/* 
    This function returns models as SchemaModels so use it to populate above Models
    for data entry fields avoid fieldNames that are
    models itself like Todo, Profile, containing @@ chars 
    and some of @unique, @default, @default(now(), modelName), @relation
  */
		// make a string-list of modelNames like '|Todo|User|Profile|'
		for (const [modelName, theFields] of Object.entries(models)) {
			strModelNames += modelName + '|';
		}
		/*
    modelsFieldNames['User'] holds
    email: String 
    firstName: String 
    id: String 
    lastName: String 
    password: String 
    profile: Profile?         -- incorrect as model name
    role: Role 
    updatedAt: DateTime? 
    userAuthToken: String     -- incorrect @unique

  */
		for (const [modelName, theFields] of Object.entries(models)) {
			let arrFields = [];
			const [, fields] = Object.entries(theFields)[0];
			for (let [fieldName, { type, prismaAttrs }] of Object.entries(fields)) {
				if ('0|1'.includes(fieldName)) {
					continue;
				}
				// type could be optional, so remove ? if any as it cannot match model name
				type = type.replace(/\?/g, '');
				if (fieldName.includes('password')) {
					// passwordHash or similar
					fieldName = 'password';
				}
				if (type === 'DateTime') {
					type = 'Date';
				}
				// exclude this field names
				const pattern = '@default\\((' + strModelNames + 'now\\(\\))\\)';
				let regex = new RegExp(pattern);
				let m = prismaAttrs.match(regex); // null if failed
				if (m && m[1]) {
					continue; // not data entry field name
				}

				// type cannot be a model name like Profile...
				regex = new RegExp('(' + strModelNames.slice(1, -1) + ')');
				m = type.match(regex); // null if failed
				if (m && m[1]) {
					continue;
				}

				m = prismaAttrs.match(/(@unique|@createdAt)/); // non-mutable
				if (m && m[1]) {
					continue;
				}

				const hasBrackets = type.includes('[]');
				const hasId = prismaAttrs.includes('@id');
				const hasRole = type === 'Role';
				const include = !hasBrackets || hasId || hasRole;
				if (include) {
					arrFields.push(fieldName + ': ' + type);
				}
			}
			try {
				modelsFieldNames[modelName] = arrFields;
			} catch (err: unknown) {
				const msg = err instanceof Error ? err.message : String(err);
				console.log('cannot add a model' + msg);
			}
		}

		return models;
	}
</script>

<pre>{JSON.stringify(models, null, 2)}</pre>
