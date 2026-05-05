// dropdown.ts
type DropDownParams = {
	dropdownMenuEl: HTMLElement;
	dropdownSelected: (e: MouseEvent) => void;
};
export function dropdown(node: HTMLElement, params: DropDownParams) {
	const { dropdownMenuEl, dropdownSelected } = params;
	dropdownMenuEl.classList.toggle('hidden');
	let open = false;
	dropdownMenuEl.addEventListener('click', (e) => {
		dropdownSelected(e);
		open = false;
		dropdownMenuEl.style.opacity = '0';
	});
	dropdownMenuEl.style.position = 'absolute';
	dropdownMenuEl.style.opacity = '0';
	dropdownMenuEl.style.cursor = 'pointer';
	dropdownMenuEl.style.transition = 'opacity 0.15s';
	document.body.appendChild(dropdownMenuEl);

	function position() {
		const r = node.getBoundingClientRect();
		dropdownMenuEl.style.top = `${r.bottom + window.scrollY}px`;
		dropdownMenuEl.style.left = `${r.left + window.scrollX}px`;
	}

	function toggle() {
		document.documentElement.click();
		open = !open;
		if (open) {
			position();
			dropdownMenuEl.style.opacity = '1';
		} else {
			dropdownMenuEl.style.opacity = '0';
		}
	}

	function close(e: MouseEvent) {
		if (!dropdownMenuEl.contains(e.target as Node) && !node.contains(e.target as Node)) {
			dropdownMenuEl.style.opacity = '0';
			open = false;
		}
	}

	node.addEventListener('click', toggle);
	document.addEventListener('click', close);

	return {
		destroy() {
			node.removeEventListener('click', toggle);
			document.removeEventListener('click', close);
			dropdownMenuEl.remove();
		},
	};
}
