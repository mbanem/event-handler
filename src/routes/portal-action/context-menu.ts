// contextMenu.ts
type ContextMenuParams = {
	contextMenuEl: HTMLElement;

	menuItemSelected: (e: MouseEvent) => void;
};

export function contextMenu(node: HTMLElement, params: ContextMenuParams) {
	const { contextMenuEl: menu, menuItemSelected } = params;
	menu.classList.toggle('hidden');
	document.body.appendChild(menu);

	menu.style.position = 'absolute';
	menu.style.opacity = '0';

	function show(e: MouseEvent) {
		e.preventDefault();

		menu.style.top = `${e.clientY + window.scrollY}px`;
		menu.style.left = `${e.clientX + window.scrollX}px`;
		menu.style.cursor = 'pointer';
		menu.style.opacity = '1';
	}

	function hide() {
		menu.style.opacity = '0';
	}
	node.addEventListener('contextmenu', show);
	menu.addEventListener('click', menuItemSelected);

	document.addEventListener('click', hide);

	return {
		destroy() {
			node.removeEventListener('contextmenu', show);
			document.removeEventListener('click', hide);
			menu.remove();
		},
	};
}
