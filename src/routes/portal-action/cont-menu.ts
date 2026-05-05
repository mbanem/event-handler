type MenuClasses = {
	menuClassName?: string;
	itemClassName?: string;
	itemAction: (e: MouseEvent) => void;
};

type Params = {
	menu: HTMLElement;
	classes?: MenuClasses;
	elements?: HTMLElement | HTMLElement[];
};

export function contMenu(node: HTMLElement, params: Params) {
	const { menu, classes } = params;
	if (classes) {
		menu.addEventListener('click', classes.itemAction);
	}
	document.body.appendChild(menu);

	menu.classList.add('ctx-menu');
	if (classes?.menuClassName) {
		menu.classList.add(classes.menuClassName);
	}

	menu.style.position = 'absolute';
	menu.style.opacity = '0';

	function show(e: MouseEvent) {
		e.preventDefault();
		document.documentElement.click();
		menu.style.top = `${e.clientY + window.scrollY}px`;
		menu.style.left = `${e.clientX + window.scrollX}px`;
		menu.style.opacity = '1';
	}

	function hide() {
		menu.style.opacity = '0';
	}

	node.addEventListener('contextmenu', show);
	document.addEventListener('click', hide);

	return {
		update(newParams: Params) {
			// optional: reapply classes if changed
		},
		destroy() {
			node.removeEventListener('contextmenu', show);
			document.removeEventListener('click', hide);
			Array.from(node.children).forEach((el) => {
				if (classes?.itemAction) {
					(el as HTMLElement).removeEventListener('click', classes?.itemAction);
				}
			});
			menu.remove();
		},
	};
}
