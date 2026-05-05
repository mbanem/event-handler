type MenuClasses = {
	menuClassName?: string;
	itemClassName?: string;
	itemCallback?: (e: MouseEvent, el: HTMLElement) => void;
};

type Params = {
	menu: HTMLElement;
	classes?: MenuClasses;
};

export function contMenu(node: HTMLElement, params: Params) {
	const { menu } = params;
	menu.classList.toggle('hidden');
	let { classes } = params;

	document.body.appendChild(menu);

	menu.classList.add('ctx-menu');
	if (classes?.menuClassName) menu.classList.add(classes.menuClassName);

	// apply classes to menu items
	function applyItemClasses() {
		Array.from(menu.children).forEach((child) => {
			child.classList.add('ctx-menu-item');
			if (classes?.itemClassName) child.classList.add(classes.itemClassName);
		});
	}

	applyItemClasses();

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

	// ✅ EVENT DELEGATION (key improvement)
	function onMenuClick(e: MouseEvent) {
		const target = (e.target as HTMLElement).closest('.ctx-menu-item') as HTMLElement;
		if (!target) return;

		classes?.itemCallback?.(e, target);
		hide();
	}

	node.addEventListener('contextmenu', show);
	document.addEventListener('click', hide);
	menu.addEventListener('click', onMenuClick);

	return {
		update(newParams: Params) {
			classes = newParams.classes;
			applyItemClasses();
		},
		destroy() {
			node.removeEventListener('contextmenu', show);
			document.removeEventListener('click', hide);
			menu.removeEventListener('click', onMenuClick);
			menu.remove();
		},
	};
}
