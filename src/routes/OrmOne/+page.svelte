<script lang="ts">
	import { onMount } from 'svelte';
	import * as utils from '$lib/utils';

	// fake part for Extension
	const vscode = {
		postMessage: (msg: { command: string; payload?: string | object }) => {
			console.log(msg.command, msg.payload);
		}
	};
	function cancelAnyPart() {
		startPartOne();
	}
	// fake part for Extension

	type Tdb = { name: string; owner: string; password: string; host: string; port: string };
	let noPrismaSchema: boolean = true;
	let installPartTwoPending: boolean = false;
	let installPartOneEl: HTMLPreElement;
	let installPartTwoEl: HTMLPreElement;
	let installPartOneBtnEl: HTMLButtonElement;
	let cancelPartOneBtnEl: HTMLButtonElement;
	let sudoName_: string = 'mili';

	const startPartOne = () => {
		installPartOneBtnEl.innerText = 'Install Prisma ORM';
		installPartOneBtnEl.addEventListener('click', async (_: MouseEvent) => {
			installPartOneBtnEl.innerText = 'installing...';
			await utils.sleep(2500);

			noPrismaSchema = false;
			vscode.postMessage({ command: 'log', payload: 'InstallPartOneBtn clicked' });
			// get dbname, owner and owner password if specified
			try {
				const db: Tdb = {
					name: (document.getElementById('dbNameId') as HTMLInputElement).value,
					owner: (document.getElementById('dbOwnerId') as HTMLInputElement).value,
					password: (document.getElementById('dbOwnerPasswordId') as HTMLInputElement).value,
					host: (document.getElementById('dbHostId') as HTMLInputElement).value,
					port: (document.getElementById('dbPortId') as HTMLInputElement).value
				};
				vscode.postMessage({ command: 'setDbAndOwner', payload: db });
			} catch (err) {
				const msg = err instanceof Error ? err.message : String(err);
				vscode.postMessage({ command: 'log', payload: 'get db err ' + msg });
			}
			vscode.postMessage({ command: 'installPrismaPartOne' });
			installPartTwoPending = true;
		});

		vscode.postMessage({ command: 'installPrismaPartOne' });
		// installPartOneBtnEl.innerText = 'installing...';
	};

	onMount(() => {
		installPartOneEl = document.getElementById('installPartOneId') as HTMLPreElement;
		installPartTwoEl = document.getElementById('installPartTwoId') as HTMLPreElement;
		installPartOneEl.classList.remove('hidden');
		installPartOneBtnEl = document.getElementById('installPartOneBtnId') as HTMLButtonElement;
		cancelPartOneBtnEl = document.getElementById('cancelPartOneBtnId') as HTMLButtonElement;
		// rightColumnEl = document.getElementById('rightColumnId');

		cancelPartOneBtnEl.addEventListener('click', cancelAnyPart);
		// fires once so be ready it extension waits for schema and connection
		// if (installPartTwoPending) {
		// 	vscode.postMessage({ command: 'log', payload: 'pending!' });
		// 	installPartTwoBtnEl.addEventListener('click', installPartTwo);
		// 	cancelPartTwoBtnEl.addEventListener('click', cancelAnyPart);
		// }

		if (noPrismaSchema) {
			//startPartOne();
		}
	});
</script>

<div class="main">
	<pre id="installPartOneId" class="part-one">
      <h3>Prisma Installation Part One</h3>
The Extension 'Create CRUD Form Support' found that Prisma ORM is not installed in
the project; it can help with installing it. In the first part of the installation
it will add all the necessary packages and instantiate Prisma in this project by
installing a very basic schema in /prisma/schema.prisma file at the project's root.
	<div class="container">
  <div class="dbname-block">
    <label for="dbNameId">
      Database Name
      <br /><input id="dbNameId" type="text" placeholder="avoid dashes in db-name" />
    </label>
    <label for="dbOwnerId">
      Database Owner
      <br /><input id="dbOwnerId" type="text" value={sudoName_} />
    </label>
    <label for="dbOwnerPasswordId">
      Owner's Password
      <br /><input id="dbOwnerPasswordId" type="password" />
    </label>
    <label for="dbHostId">
      Host Name
      <br /><input id="dbHostId" type="string" value="localhost" />
    </label>
    <label for="dbPortId">
      Communication Port
      <br /><input id="dbPortId" type="number" value="5432" />
    </label>
  </div>
	</div>
Instllation Steps

	Install Prisma Part One
By specifying database name, database owner name and owner's password the Extension will
set the database connection string in the .env file and install ORM with no interaptions.
It will open sample schema.prisma and .env contents in separate windows and put a continue
button, waiting for you to specify
  -  your Prisma models/tables replacing the current sample schema.prisma content
  -  the connection string in the opened .env file if not set by the Extension

	Install Prisma Part Two
When you are done, you can select the continue button to finish the Part Two installation.
If you prefer to close the Extension while preparing schema and connection string, you 
could restart the Extension and it will display the commands that you should have entered
yourself or select the continue button and the Extension will finish Part Two installation.

  <button id="installPartOneBtnId" style="margin-left:4rem;">Install Prisma ORM</button><button
			id="cancelPartOneBtnId">Close</button
		>
</pre>
</div>

<style lang="scss">
	.main {
		margin-left: 2rem;
	}

	.container {
		@include container($head: 'Database Attributes', $head-color: skyblue);
		padding: 1rem;
	}

	pre {
		grid-column: 1 / span 2;
		text-align: justify;
		font-size: 12px;
		color: var(--pre-color);
	}

	input[type='text'] {
		width: 18rem;
		height: 20px;
		padding: 6px 0 8px 1rem;
		outline: none;
		font-size: 16px;
		border: 1px solid gray;
		border-radius: 4px;
		outline: 1px solid transparent;
		margin-top: 8px;
		margin-bottom: 10px;
	}

	input[type='text']:focus {
		outline: 1px solid gray;
	}

	button {
		display: inline-block;
		margin-left: 1rem;
		width: 9rem;
		padding: 2px 1rem;
		text-align: center;
		&:first-child {
			margin-right: 1rem;
		}
	}

	.dbname-block {
		display: grid;
		grid-template-columns: repeat(3, 12rem);
		column-gap: 0.2rem;
		margin: 0;
		padding: 0;

		label {
			width: 10rem;
			padding: 0;
			margin: 0 1rem 6px 0;
		}

		input {
			width: 11rem;
			margin: 0;
			padding: 3px 0 3px 0.5rem !important;
			border: 1px solid lightgray;
			border-radius: 3px;

			&:focus {
				outline: 1px solid skyblue;
			}
		}
	}
</style>
