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
<div class="radio-wrapper" bind:this={radioGroupEl}>
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

<!-- context menu action -->

<div bind:this={contextMenuEl} class="context-menu">
	<div>Edit</div>
	<div>Duplicate</div>
	<div>Delete</div>
</div>
<div use:contextMenu={{ contextMenuEl, menuItemSelected }} class="context-menu-area">
	contextMenu Right click anywhere here
</div>

<!-- drop down action -->

<div bind:this={dropdownMenuEl} class="dropdown-menu">
	<div>Profile</div>
	<div>Settings</div>
	<div>Logout</div>
</div>
<button use:dropdown={{ dropdownMenuEl, dropdownSelected }}> Open Menu </button>

<!-- using improved contMenu -->
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
	<div bind:this={contMenuEl} class="ctx-menu-item">
		<div>Edit</div>
		<div>Duplicate</div>
		<div>Delete</div>
	</div>
</div>

<!-- using popup action -->

<div bind:this={popupMenuEl} class="popupMenu">
	<div data-item data-action="edit">Popup Edit</div>
	<div data-item data-action="delete">Popup Delete</div>
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
		padding: 6px;
		border-radius: 6px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		width: max-content;
		div {
			width: inherit;
		}
	}

	.dropdown-menu {
		background: white;
		border: 1px solid #ccc;
		padding: 6px;
		border-radius: 6px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		width: max-content;
		div {
			width: inherit;
			color: blue;
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
	}

	.ctx-menu-item {
		padding: 6px 10px;
		cursor: pointer;
		div {
			color: blue;
		}
	}

	.popupMenu {
		width: 6rem;
		height: 4rem;
		border: 1px solid gray;
		border-radius: 5px;
		padding-left: 6px;
		color: navy;
		div {
			color: blue;
			width: inherit;
			&:first-of-type {
				margin-top: 6px;
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
		padding: 5px 1rem;
		border: 1px solid gray;
		border-radius: 5px;
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
				widthz: max-content;
				padding: 0;
				margin: 0;
			}
		}
	}
</style>
