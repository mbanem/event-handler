// portal.ts
type PortalParams = {
	render: (container: HTMLElement) => void;
};

export function portal(node: HTMLElement, params: PortalParams) {
	const container = document.createElement('div');
	container.style.position = 'absolute';
	container.style.top = '0';
	container.style.left = '0';
	container.style.zIndex = '9999';

	document.body.appendChild(container);

	params.render(container);

	return {
		update(newParams: PortalParams) {
			container.innerHTML = '';
			newParams.render(container);
		},
		destroy() {
			container.remove();
		},
	};
}
