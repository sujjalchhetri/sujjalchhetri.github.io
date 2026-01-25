document.addEventListener('DOMContentLoaded', () => {
	const nav = document.querySelector('.site-nav');
	const toggle = document.querySelector('.site-nav__toggle');
	if (!nav || !toggle) return;

	toggle.addEventListener('click', () => {
		const open = nav.classList.toggle('is-open');
		toggle.setAttribute('aria-expanded', String(open));
	});

	document.addEventListener('click', (event) => {
		if (!nav.contains(event.target)) {
			nav.classList.remove('is-open');
			toggle.setAttribute('aria-expanded', 'false');
		}
	});
});
