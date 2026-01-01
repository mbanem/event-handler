<script lang='ts'> 
	import { schema } from './schema'
	let regexIsModelName = new RegExp('');
	const modelRegex = /model\s+(\w+)\s*{([^}]*)}/gms;
	let strModelNames = '|';
	const models =  {
	  "User": {
	    "fields": [
	      {
	        "name": "id",
	        "type": "string",
	        "attrs": "@id @default(uuid())"
	      },
	      {
	        "name": "firstName",
	        "type": "string",
	        "attrs": "@map(\"first_name\")"
	      },
	      {
	        "name": "lastName",
	        "type": "string",
	        "attrs": "@map(\"last_name\")"
	      },
	      {
	        "name": "email",
	        "type": "string",
	        "attrs": ""
	      },
	      {
	        "name": "passwordHash",
	        "type": "string",
	        "attrs": "@map(\"password_hash\")"
	      },
	      {
	        "name": "userAuthToken",
	        "type": "string",
	        "attrs": "@unique @map(\"user_auth_token\")"
	      },
	      {
	        "name": "role",
	        "type": "Role",
	        "attrs": "@default(USER)"
	      },
	      {
	        "name": "posts",
	        "type": "Post[]",
	        "attrs": ""
	      },
	      {
	        "name": "profile",
	        "type": "Profile",
	        "attrs": ""
	      },
	      {
	        "name": "articles",
	        "type": "Article[]",
	        "attrs": ""
	      },
	      {
	        "name": "todos",
	        "type": "Todo[]",
	        "attrs": "// arrays are optional and could be empty"
	      },
	      {
	        "name": "createdAt",
	        "type": "Date",
	        "attrs": "@default(now()) @map(\"created_at\")"
	      },
	      {
	        "name": "updatedAt",
	        "type": "Date",
	        "attrs": "@updatedAt @map(\"updated_at\")"
	      }
	    ],
	    "attrs": [
	      "@@unique(name): \"fullNameEmail\", [firstName, lastName, email])",
	      "@@map(\"users\")"
	    ]
	  },
	  "Profile": {
	    "fields": [
	      {
	        "name": "id",
	        "type": "string",
	        "attrs": "@id @default(uuid())"
	      },
	      {
	        "name": "bio",
	        "type": "string",
	        "attrs": ""
	      },
	      {
	        "name": "user",
	        "type": "User",
	        "attrs": "@relation(fields: [userId], references: [id])"
	      },
	      {
	        "name": "userId",
	        "type": "string",
	        "attrs": "@unique @map(\"user_id\")"
	      },
	      {
	        "name": "createdAt",
	        "type": "Date",
	        "attrs": "@default(now()) @map(\"created_at\")"
	      },
	      {
	        "name": "updatedAt",
	        "type": "Date",
	        "attrs": "@updatedAt @map(\"updated_at\")"
	      }
	    ],
	    "attrs": [
	      "@@map(\"profile\")"
	    ]
	  },
	  "Article": {
	    "fields": [
	      {
	        "name": "id",
	        "type": "string",
	        "attrs": "@id @default(uuid())"
	      },
	      {
	        "name": "title",
	        "type": "string",
	        "attrs": ""
	      },
	      {
	        "name": "content",
	        "type": "string",
	        "attrs": ""
	      },
	      {
	        "name": "author",
	        "type": "User",
	        "attrs": "@relation(fields: [authorId], references: [id])"
	      },
	      {
	        "name": "authorId",
	        "type": "string",
	        "attrs": "@map(\"author_id\")"
	      }
	    ],
	    "attrs": [
	      "@@map(\"article\")"
	    ]
	  },
	  "Post": {
	    "fields": [
	      {
	        "name": "id",
	        "type": "string",
	        "attrs": "@id @default(uuid())"
	      },
	      {
	        "name": "title",
	        "type": "string",
	        "attrs": "@db.VarChar(255)"
	      },
	      {
	        "name": "content",
	        "type": "string",
	        "attrs": ""
	      },
	      {
	        "name": "published",
	        "type": "boolean",
	        "attrs": "@default(false)"
	      },
	      {
	        "name": "author",
	        "type": "User",
	        "attrs": "@relation(fields: [authorId], references: [id])"
	      },
	      {
	        "name": "authorId",
	        "type": "string",
	        "attrs": "@map(\"author_id\")"
	      },
	      {
	        "name": "categories",
	        "type": "Category[]",
	        "attrs": ""
	      },
	      {
	        "name": "createdAt",
	        "type": "Date",
	        "attrs": "@default(now()) @map(\"created_at\")"
	      },
	      {
	        "name": "updatedAt",
	        "type": "Date",
	        "attrs": "@updatedAt @map(\"updated_at\")"
	      }
	    ],
	    "attrs": [
	      "@@map(\"post\")"
	    ]
	  },
	  "Category": {
	    "fields": [
	      {
	        "name": "id",
	        "type": "number",
	        "attrs": "@id @default(autoincrement())"
	      },
	      {
	        "name": "name",
	        "type": "string",
	        "attrs": ""
	      },
	      {
	        "name": "posts",
	        "type": "Post[]",
	        "attrs": ""
	      }
	    ],
	    "attrs": [
	      "@@map(\"category\")"
	    ]
	  },
	  "Todo": {
	    "fields": [
	      {
	        "name": "id",
	        "type": "string",
	        "attrs": "@id @default(uuid())"
	      },
	      {
	        "name": "title",
	        "type": "string",
	        "attrs": ""
	      },
	      {
	        "name": "content",
	        "type": "string",
	        "attrs": ""
	      },
	      {
	        "name": "priority",
	        "type": "number",
	        "attrs": "@default(0)"
	      },
	      {
	        "name": "completed",
	        "type": "boolean",
	        "attrs": "@default(false)"
	      },
	      {
	        "name": "user",
	        "type": "User",
	        "attrs": "@relation(fields: [userId], references: [id])"
	      },
	      {
	        "name": "userId",
	        "type": "string",
	        "attrs": "@map(\"user_id\")"
	      },
	      {
	        "name": "createdAt",
	        "type": "Date",
	        "attrs": "@default(now()) @map(\"created_at\")"
	      },
	      {
	        "name": "updatedAt",
	        "type": "Date",
	        "attrs": "@updatedAt @map(\"updated_at\")"
	      }
	    ],
	    "attrs": [
	      "@@map(\"todo\")"
	    ]
	  }
	}
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
	const name =  'id'
	console.log(regexIsModelName.test(`|${name}|`) || /createdAt|password|hash|token/i.test(name))
	function makeStrModelNames(schemaContent: string) {
		let match = null;
    // take match[1] as it is the modelName
		while ((match = modelRegex.exec(schemaContent)) !== null) {
			// a string-list of modelNames  '|Todo|User|Profile|'
			strModelNames += match[1] + '|';
		}
		// make a regex to test is name is a ModelName
		regexIsModelName = new RegExp(`${strModelNames}`);
		console.log(strModelNames)
	}
	function isUICandidate({name, type, attrs}: Field): boolean {
		console.log('XX',name,'|', type, '|',attrs)
			type = type.toLowerCase().trim();
			// attrs = attrs ?? '';
			if (strModelNames.includes(`|${name}|`) || strModelNames.includes(`|${type}|`) || /createdAt|password|hash|token/i.test(name) || /@@|\[|\]|\{|\}/.test(type)){
				return false;
			}
			// const ui = !regexIsModelName.test(name) && !/@updatedAt|@relation/.test(attrs) && !/createdAt|password/i.test(field.name) ||
			// 	/\b@id @default(uuid())\b/i.test(attrs)
			// 	// ['string', 'number', 'boolean', 'role'].includes(type);
			// // if(type==='boolean' || type==='Boolean'){
			// // 	console.log(type,attrs, ui)
			// // }
			// return ui;
		return true
	}
	for(const [modelName,model] of Object.entries(models)){
		// console.log(modelName)
		for(const field of model.fields){ 
			console.log(field,isUICandidate(field))
		}
	}
	makeStrModelNames(schema)
	// console.log(/createdAt|password/i.test('passwordHash'))
	
</script>