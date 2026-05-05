// contextMenu.ts
type Params = {
	contextMenuEl: HTMLElement;

	itemCallback: (e: MouseEvent) => void;
};

export function contextMenu(node: HTMLElement, params: Params) {
	const { contextMenuEl: menu, itemCallback } = params;
	menu.classList.toggle('hidden');
	document.body.appendChild(menu);

	menu.style.position = 'absolute';
	menu.style.opacity = '0';

	function show(e: MouseEvent) {
		e.preventDefault();
		document.documentElement.click();
		menu.style.top = `${e.clientY + window.scrollY}px`;
		menu.style.left = `${e.clientX + window.scrollX}px`;
		menu.style.cursor = 'pointer';
		menu.style.opacity = '1';
	}

	function hide() {
		menu.style.opacity = '0';
	}
	node.addEventListener('contextmenu', show);
	menu.addEventListener('click', itemCallback);

	document.addEventListener('click', hide);

	return {
		destroy() {
			node.removeEventListener('contextmenu', show);
			document.removeEventListener('click', hide);
			menu.remove();
		},
	};
}
