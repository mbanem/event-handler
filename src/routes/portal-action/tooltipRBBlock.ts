type Trigger = 'click' | 'hover';

type Params = {
	contentEl: HTMLElement;
	trigger: Trigger;
	onItemHover?: (e: MouseEvent) => void;
	onItemCallback?: (e: MouseEvent, hoveringEl?: HTMLElement) => void;
};

export function tooltipRBBlock(node: HTMLElement, params: Params) {
	let { contentEl, trigger, onItemHover, onItemCallback } = params; // mutable with newParams
	let hoveringEl: HTMLElement;
	let visible = false;
	contentEl.classList.toggle('hidden');

	document.body.appendChild(contentEl);

	contentEl.style.position = 'absolute';
	contentEl.style.opacity = '0';
	contentEl.style.cursor = 'pointer';

	function positionAt(x: number, y: number) {
		contentEl.style.top = `${y}px`;
		contentEl.style.left = `${x}px`;
	}

	function showAt(x: number, y: number) {
		document.documentElement.click(); // close other openned popups or context menus
		positionAt(x, y);
		contentEl.style.opacity = '1';
		visible = true;
	}
	function isOutsideBounds(e: MouseEvent, boundEl: HTMLElement) {
		const r = boundEl.getBoundingClientRect();
		return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
	}
	function hide(e: MouseEvent) {
		if (visible && e && !isOutsideBounds(e, contentEl)) {
			return;
		}
		contentEl.style.opacity = '0';
		visible = false;
	}

	// 🔁 unified trigger handling
	function handleTrigger(e: MouseEvent) {
		const rect = node.getBoundingClientRect();
		showAt(rect.left + window.scrollX, rect.bottom + window.scrollY);
	}

	function handleHover(e: MouseEvent) {
		if ((e.target as HTMLElement) === node) {
			return;
		}
		hoveringEl = e.target as HTMLElement;
		onItemHover?.(e);
		const r = (e.target as HTMLElement).getBoundingClientRect();
		showAt(r.x + window.scrollX, r.y - 25 + window.scrollY);
	}
	function handleClick(e: MouseEvent) {
		const item = e.target as HTMLElement; //.closest('[data-item]');
		if (!item) return;

		contentEl.style.opacity = '0';
		visible = false;
		onItemCallback?.(e, hoveringEl);
		try {
			// (item as HTMLInputElement).checked = false;
			if (item.parentElement) {
				item.parentElement.querySelectorAll('input').forEach((rb) => (rb.checked = false));
			}
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			console.log('clear radiobox', msg);
		}
	}

	if (trigger === 'hover') {
		node.addEventListener('mouseover', handleHover);
		if (onItemHover) {
			contentEl.addEventListener('click', handleClick);
			contentEl.addEventListener('mouseleave', hide);
			node.addEventListener('mouseleave', hide);
		}
	} else {
		node.addEventListener('click', handleTrigger);
	}

	document.addEventListener('click', hide);
	contentEl.addEventListener('click', handleClick);

	return {
		update(newParams: Params) {
			contentEl = newParams.contentEl;
			trigger = newParams.trigger;
			if (newParams.onItemHover) {
				onItemHover = newParams.onItemHover;
			}
			onItemCallback = newParams.onItemCallback;
		},
		destroy() {
			node.removeEventListener('mouseover', handleHover);
			node.removeEventListener('click', handleTrigger);
			node.removeEventListener('mouseleave', hide);
			document.removeEventListener('click', hide);
			contentEl.removeEventListener('click', handleClick);
			contentEl.removeEventListener('mouseleave', hide);
			contentEl.remove();
		},
	};
}
