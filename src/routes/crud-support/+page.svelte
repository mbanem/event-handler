<script lang="ts">
	import { onMount } from 'svelte';
	import { createEventHandler } from '$lib/utils';
	import type { Model, Models } from './parse-prisma-schema';
	import CRRBTooltip, { type SelectedModels } from '$lib/components/CRRBTooltip.svelte';
	import type { PageProps } from './$types';

	type Payload = Record<string, SelectedModels | Model | string[] | string>; // { route: string | null } = { route: null };
	const log = console.log;
	let { data }: PageProps = $props();

	let models = data.models as Models; // avoid $derived as we use this one-time only

	let isLoading = $state(true);
	setTimeout(() => {
		isLoading = false;
	}, 1000);

	// when any checkbox on a component model list is selected
	// the component keeps this selectedModels in sync
	let selectedModels = $state<SelectedModels>({});

	// what components users want to include in newnly generated pages
	let crComponents: string[] = $state(['CRInput', 'CRSpinner', 'CRActivity', 'CRTooltip', 'CRSummaryDetails']);

	// what authentication/authorization to implement should be optional?
	let appFeatures: string[] = $state([]);

	// onclick Create CRUD Support sends models to extension to
	// create individual pages or part of the application
	function getPayload() {
		if (Object.keys(selectedModels).length === 0) {
			// return JSON.stringify($state.snapshot(candidates));
			return selectedModels;
		}

		let payload: Payload = {};
		// candidateModels.forEach((modelName) => {
		// 	payload[modelName] = $state.snapshot(models[modelName]) as Model;
		// });
		if (crComponents.length) {
			payload['crComponents'] = crComponents;
		}
		for (const key of ['authorization', 'authentication']) {
			const el = document.querySelector(`input[name=${key}]:checked`) as HTMLInputElement;
			if (el) {
				payload[key] = el.value;
			}
		}

		if (appFeatures.length) {
			payload['features'] = appFeatures;
		}
		payload['selectedModels'] = selectedModels;
		// return JSON.stringify($state.snapshot(payload));
		return $state.snapshot(payload);
	}
	// imitate getting model from Webview extension
	// fake part for Extension
	const vscode =
		// @ts-expect-error  not an extension content
		typeof acquireVsCodeApi !== 'undefined'
			? // @ts-expect-error not an extension coontent
				acquireVsCodeApi()
			: {
					postMessage: (msg: { command: string; payload: Payload }) => {
						log(`[DEV] ${msg.command} in progress...`);
						setTimeout(() => {
							log(`${msg.command} is done`, msg.payload ?? 'with no payload');
						}, 2000);
					},
				};

	// Webview sends message to the extension
	function createCRUDSupport() {
		vscode.postMessage({
			command: 'CreateCrudSupport',
			payload: getPayload(),
		});
	}

	const eh = createEventHandler();
	onMount(() => {
		return () => {
			eh.destroy();
		};
	});

	let buttonNotAllowed = $derived(Object.keys(selectedModels).length === 0);
</script>

<svelte:head>
	<title>CRUD Support</title>
</svelte:head>

{#snippet appIncludes()}
	<label for="Navbar" class="app-labels">
		<input type="checkbox" id="Navbar" value="NavBar" bind:group={appFeatures} />
		Include navbar in app root +layout.svelte</label
	>
	<label for="ThemeIcon" class="app-labels">
		<input type="checkbox" id="ThemeIcon" value="ThemeIcon" bind:group={appFeatures} />
		Include dark/light/system theme icon</label
	>

	<div class="radio-check-groups">
		<div class="authentication">
			{#each ['pasword-based', 'multi-factor MFA', 'certificate-based', 'token-based JWT', 'Exlude'] as auth (auth.slice(0, 4))}
				<label>
					<input type="radio" name="authentication" value={auth} checked={auth === 'token-based JWT'} />
					{auth}
				</label>
			{/each}
		</div>
		<div class="authorization">
			{#each ['JSON Web Tokens JWT', 'API Keys', 'Bearer Tokens', 'Digest Authentication', 'Mutual TLS', 'Exclude'] as auth (auth.slice(0, 4))}
				<label>
					<input type="radio" name="authorization" value={auth} checked={auth === 'Bearer Tokens'} />
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
			{#each ['CRInput', 'CRSpinner', 'CRActivity', 'CRTooltip', 'CRSummaryDetails'] as comp (comp)}
				<div class="checkbox-item">
					<label for={comp}
						><input id="CRInput" type="checkbox" value={comp} bind:group={crComponents} />
						{comp} component</label
					>
				</div>
			{/each}
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
		For every route name and selected checkbox model from summary/details block the extension would build a TypeScript
		data entry +page.svelte with accompanying +page.server.ts for communicating with Prisma ORM local PostgreSQL
		database, based on a connection string set in the .env file in the app root folder.
	</cr-pre>
	{@render pageByPageMiddleColumn()}
{/snippet}
<div id="crudUIBlockId" class="cr-main-grid">
	<div class="application-settings">
		{@render pageByPageNote()}
	</div>
	<CRRBTooltip {models} bind:selectedModels></CRRBTooltip>
</div>

<style lang="scss">
	.cr-main-grid {
		position: relative;
		display: grid;
		grid-template-columns: 30rem 30rem;
		column-gap: 1rem;
		margin: 0.5rem 0 0 1rem;
		width: max-content;
		height: auto;
		align-items: start;
	}
	.application-settings {
		width: 30rem;
		align-items: start;
		height: 100%;
	}
	.cr-left-column {
		@include container($head: 'Application Settings', $head-color: navy);
		position: relative;
		border: 1px solid gray;
		border-radius: 8px;
		height: 74vh;
		width: 30rem;
		margin-top: 1rem;
		padding: 1rem 0 0 0.7rem;
		background-color: var(--panel-bg-color);

		label {
			display: block;
			color: var(--candidate-color);
			cursor: pointer;
		}
		div {
			display: block;
		}
	}

	cr-pre {
		grid-column: 1 / span 2;
		text-align: justify;
		font-size: 14px;
		color: var(--pre-color);
		align-items: start;
	}

	.embellishments {
		@include container($head: 'Include Components', $head-color: navy);
		background-color: var(--panel-bg-color);

		position: relative;
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

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.app-labels {
		color: var(--checkbox-label-color);
		margin: 3px 0 3px 1rem;

		&:last-of-type {
			margin-bottom: 1rem;
		}
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
	}
</style>
