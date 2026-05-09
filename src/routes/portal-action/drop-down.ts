// dropdown.ts
type Trigger = 'click' | 'hover' | 'contextmenu' | 'dropdown';

type Params = {
	contentEl: HTMLElement;
	trigger: Trigger;
	onItemHover?: (e: MouseEvent) => void;
	onItemCallback?: (e: MouseEvent, hoveringEl?: HTMLElement) => void;
};
export function dropdown(node: HTMLElement, params: Params) {
	const { contentEl, onItemCallback } = params;
	contentEl.addEventListener('click', (e) => {
		onItemCallback?.(e);
		contentEl.style.opacity = '0';
	});

	function position() {
		const r = node.getBoundingClientRect();
		contentEl.style.top = `${r.bottom + window.scrollY}px`;
		contentEl.style.left = `${r.left + window.scrollX}px`;
	}

	function toggle() {
		document.documentElement.click();

		if (contentEl.classList.contains('hidden')) {
			position();
			contentEl.style.opacity = '1';
		} else {
			contentEl.style.opacity = '0';
		}
		contentEl.classList.toggle('hidden');
	}
	node.addEventListener('click', toggle);

	function close(e: MouseEvent) {
		if (!contentEl.contains(e.target as Node) && !node.contains(e.target as Node)) {
			contentEl.style.opacity = '0';
		}
	}

	document.addEventListener('click', close);

	return {
		destroy() {
			node.removeEventListener('click', toggle);
			document.removeEventListener('click', close);
			contentEl.remove();
		},
	};
}
