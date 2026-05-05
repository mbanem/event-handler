<script lang="ts">
	import { contextMenu } from './context-menu';
	import { contMenu } from './cx-menu';
	import { popup } from './popup';

	let contextMenuEl: HTMLDivElement;
	let contMenuEl: HTMLDivElement;
	let popupMenuEl: HTMLDivElement;
	let radioGroupEl: HTMLDivElement;

	import { dropdown } from './drop-down';
	let dropdownMenuEl: HTMLDivElement;
	function dropdownSelected(e: MouseEvent) {
		console.log('dropdown item selected', (e.target as HTMLElement).innerText);
	}

	function theItemAction(e: MouseEvent) {
		console.log('itemAction', (e.target as HTMLElement).innerText);
	}
	function onItemClick(e: MouseEvent) {
		console.log((e.target as HTMLElement).innerText);
	}
	function menuItemSelected(e: MouseEvent) {
		console.log('context menu -- item selected', (e.target as HTMLElement).innerText);
	}
	function radioLRBSelected(e: MouseEvent, hoveringEl?: HTMLElement, el?: HTMLElement) {
		console.log(hoveringEl?.innerText, el?.innerText);
		// e.target as HTMLElement
	}
</script>

<!-- popup action -- radio button group -->
<div class="radio-wrapper hidden" bind:this={radioGroupEl}>
	<label data-item><input type="radio" name="LRB" value="L" />Login</label>
	<label data-item><input type="radio" name="LRB" value="R" />Register</label>
	<label data-item><input type="radio" name="LRB" value="LR" />Both</label>
</div>
<div class="list-container">
	<div
		class="to-add-where"
		use:popup={{
			content: radioGroupEl,
			trigger: 'hover',
			radioGroupClass: 'radio-wrapper',
			containerClass: 'list-container',
			onItemClick: radioLRBSelected,
		}}
	>
		<p>firstName: string</p>
		<p>lastName: string</p>
		<p>updatedAt: Date</p>
		<p>role: Role</p>
		<p>passwordHash: string</p>
	</div>
</div>

<!-- context menu action -- hidden used until action kicks in and toggle it-->

<div bind:this={contextMenuEl} class="context-menu hidden">
	<p>Edit</p>
	<p>Duplicate</p>
	<p>Delete</p>
</div>
<div use:contextMenu={{ contextMenuEl, menuItemSelected }} class="context-menu-area">
	contextMenu Right click anywhere here
</div>

<!-- drop down action  -- hidden used until action kicks in and toggle it-->

<div bind:this={dropdownMenuEl} class="dropdown-menu hidden">
	<p>Profile</p>
	<p>Settings</p>
	<p>Logout</p>
</div>
<button use:dropdown={{ dropdownMenuEl, dropdownSelected }}> Open Menu </button>

<!-- using improved contMenu -->
<div bind:this={contMenuEl} class="ctx-menu-item hidden">
	<p>Edit</p>
	<p>Duplicate</p>
	<p>Delete</p>
</div>
<div
	class="ctx-menu-parent"
	use:contMenu={{
		menu: contMenuEl,
		classes: {
			menuClassName: 'my-menu',
			itemClassName: 'my-item',
			itemAction: theItemAction,
		},
	}}
>
	Improved Right click me
</div>

<!-- using popup action TODO mouse out of container hide context menu -->

<div bind:this={popupMenuEl} class="popupMenu hidden">
	<p data-item data-action="edit">Popup Edit</p>
	<p data-item data-action="delete">Popup Delete</p>
</div>
<div
	class="popup-wrapper"
	use:popup={{
		content: popupMenuEl,
		trigger: 'contextmenu',
		containerClass: 'popup-wrapper',
		onItemClick: onItemClick,
	}}
>
	Right click popup action
</div>

<style>
	.context-menu-area {
		width: max-content;
		height: 4rem;
		padding: 1rem;
		margin: 1rem 0 0 5rem;
		color: var(--candidate-color);
		background-color: var(--candidate-bg-color);
		border: 1px solid lightgray;
		border-radius: 5px;
		cursor: default !important;
	}

	.context-menu {
		background: white;
		border: 1px solid #ccc;
		border-radius: 6px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		width: max-content;
		cursor: default;
		p {
			color: blue;
			cursor: inherit;
			padding: 1px 5px;
			margin: 0;
			border: none;
			transition: background 0.3s;
			&:hover {
				/* to strech bg color container .ctx-menu-item
				should not have padding to cut the strech
				*/
				background-color: cornsilk;
				cursor: pointer;
			}
		}
	}

	.dropdown-menu {
		background: white;
		border: 1px solid #ccc;
		border-radius: 6px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		width: max-content;
		p {
			color: blue;
			cursor: inherit;
			padding: 1px 5px;
			margin: 0;
			border: none;
			transition: background 0.3s;
			&:hover {
				/* to strech bg color container .ctx-menu-item
				should not have padding to cut the strech
				*/
				background-color: cornsilk;
				cursor: pointer;
			}
		}
	}
	/* send CSS class names to contMenu action
		as actions are in the app scope and can
		access classes by name
	*/
	.ctx-menu-parent {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 8rem;
		height: 4rem;
		border: 1px solid lightgray;
		border-radius: 5px;
		color: navy;
		margin: 1rem 0 0 2rem;
		cursor: default;
	}

	.ctx-menu-item {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		cursor: inherit;
		border: 1px solid gray;
		border-radius: 4px;
		background: white;
		p {
			color: blue;
			cursor: inherit;
			padding: 1px 5px;
			margin: 0;
			border: none;
			transition: background 0.3s;
			&:hover {
				/* to strech bg color container .ctx-menu-item
				should not have padding to cut the strech
				*/
				background-color: cornsilk;
				cursor: pointer;
			}
		}
	}

	.popupMenu {
		height: auto;
		border: 1px solid gray;
		border-radius: 5px;
		color: navy;
		cursor: default;
		p {
			color: blue;
			width: inherit;
			padding: 0;
			margin: 0;
			padding: 1px 5px;
			cursor: inherit;
			&:first-of-type {
				margin-top: 6px;
			}
			&:last-of-type {
				margin-bottom: 6px;
			}
			&:hover {
				cursor: pointer;
				background-color: cornsilk;
			}
		}
	}
	.popup-wrapper {
		width: 12rem;
		height: 3rem;
		/* padding: 5px 1rem; */
		border: 1px solid gray;
		border-radius: 5px;
		cursor: default;
	}
	/* 
		list container firstName, lastName,...
	*/
	.list-container {
		--back-color: skyblue;
		--hover-color: red;

		position: relative;
		margin-left: 3rem;
		width: max-content;
		padding: 0;
		background-color: transparent;
		cursor: default;
		p {
			display: inline-block;
			width: max-content;
			padding: 1px 0.5rem;
			margin: 0;
			color: var(--candidate-color);
			background-color: var(--candidate-bg-color);
			&:first-child {
				margin-top: 0.2rem;
			}
		}
		.to-add-where {
			position: relative;
			display: flex;
			flex-direction: column;
			/* width: max-content; */
			height: auto;
			padding: 0; /*1px 0.4rem 1rem 0.1rem;*/
			/* border: 1px solid gray; */
			opacity: var(--opacity);
			color: var(--candidate-color);
			background-color: var(--candidate-bg-color);

			transition: opacity ease 1s;
		}
	}
	.radio-wrapper {
		justify-content: center;
		align-items: center;
		display: flex;
		flex-direction: row;
		width: max-content;
		color: var(--candidate-color);
		background-color: var(--candidate-bg-color);
		padding: 3px 0.5rem;
		outline: 1rem solid transparent;

		label,
		input {
			display: inline;
			height: auto;
			cursor: pointer;
			background-color: rgb(128, 204, 234);
			&:first-of-type {
				padding-left: 0.2rem;
			}
			&:last-of-type {
				padding-right: 0.5rem !important;
			}
			border-radius: 5px;
			label {
				width: max-content;
				padding: 0;
				margin: 0;
			}
		}
	}
	.hidden {
		display: none;
	}
</style>
