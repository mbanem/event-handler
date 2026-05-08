// dropdown.ts
type DropDownParams = {
	contextMenuEl: HTMLElement;
	dropdownSelected: (e: MouseEvent) => void;
};
export function dropdown(node: HTMLElement, params: DropDownParams) {
	const { contextMenuEl, dropdownSelected } = params;
	contextMenuEl.addEventListener('click', (e) => {
		dropdownSelected(e);
		contextMenuEl.style.opacity = '0';
	});

	function position() {
		const r = node.getBoundingClientRect();
		contextMenuEl.style.top = `${r.bottom + window.scrollY}px`;
		contextMenuEl.style.left = `${r.left + window.scrollX}px`;
	}

	function toggle() {
		document.documentElement.click();

		if (contextMenuEl.classList.contains('hidden')) {
			position();
			contextMenuEl.style.opacity = '1';
		} else {
			contextMenuEl.style.opacity = '0';
		}
		contextMenuEl.classList.toggle('hidden');
	}
	node.addEventListener('click', toggle);

	function close(e: MouseEvent) {
		if (!contextMenuEl.contains(e.target as Node) && !node.contains(e.target as Node)) {
			contextMenuEl.style.opacity = '0';
		}
	}

	document.addEventListener('click', close);

	return {
		destroy() {
			node.removeEventListener('click', toggle);
			document.removeEventListener('click', close);
			contextMenuEl.remove();
		},
	};
}
