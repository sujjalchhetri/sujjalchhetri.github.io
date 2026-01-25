document.addEventListener('DOMContentLoaded', () => {
	initNav();
	// Scroll-triggered animations disabled; sections are visible by default.
	// initSectionObserver();
	initSiteSearch();
});

function initNav() {
	const nav = document.getElementById('site-nav');
	const toggle = nav?.querySelector('.site-nav__toggle');
	const menu = document.getElementById('nav-menu');

	if (!nav || !toggle || !menu) return;

	toggle.addEventListener('click', () => {
		const isOpen = nav.classList.toggle('is-open');
		toggle.setAttribute('aria-expanded', String(isOpen));
	});

	document.addEventListener('click', (event) => {
		if (nav.contains(event.target)) return;
		nav.classList.remove('is-open');
		toggle.setAttribute('aria-expanded', 'false');
	});
}

function initSectionObserver() {
	const sections = document.querySelectorAll('[data-animate]');
	sections.forEach((section) => section.classList.add('is-visible'));
}

function initSiteSearch() {
	const form = document.querySelector('.site-nav__search');
	const input = document.getElementById('site-search-input');
	const resultsList = document.getElementById('site-search-results');
	const resultLimit = 10;

	if (!form || !input || !resultsList) return;

	let index = [];
	let activeIndex = -1;
	let resultLinks = [];

	buildIndex();

	const debouncedRender = debounce(() => renderResults(score(input.value)), 160);

	form.addEventListener('submit', (event) => {
		event.preventDefault();
		const topResult = score(input.value)[0];
		if (!topResult) return;
		const href = topResult.target || '';
		if (href.startsWith('#')) {
			document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
			closeResults();
			return;
		}
		window.location.href = href;
	});

	input.addEventListener('input', debouncedRender);
	input.addEventListener('focus', () => renderResults(score(input.value)));
	input.addEventListener('keydown', handleKeydown);

	resultsList.addEventListener('click', (event) => {
		const link = event.target.closest('a');
		if (!link) return;

		const href = link.getAttribute('href') || '';
		if (href.startsWith('#')) {
			event.preventDefault();
			document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
			closeResults();
		}
	});

	document.addEventListener('click', (event) => {
		if (!form.contains(event.target)) closeResults();
	});

	function buildIndex() {
		index = [];
		const register = (label, target, hint = '') => {
			if (!label || !target) return;
			index.push({
				label,
				target,
				hint,
				search: `${label} ${hint} ${target}`.toLowerCase(),
			});
		};

		document.querySelectorAll('main h2, main h3').forEach((heading) => {
			const text = heading.textContent?.trim();
			if (!text) return;

			if (!heading.id) {
				const base = text.toLowerCase().replace(/[^\w]+/g, '-');
				let candidate = base;
				let suffix = 1;
				while (document.getElementById(candidate)) candidate = `${base}-${suffix++}`;
				heading.id = candidate;
			}
			register(text, `#${heading.id}`, 'Section');
		});

		document.querySelectorAll('a[href]').forEach((anchor) => {
			const href = anchor.getAttribute('href') || '';
			const text = anchor.textContent?.trim() || anchor.getAttribute('aria-label') || '';
			if (!text || href.startsWith('javascript:')) return;
			register(text, href, anchor.closest('nav') ? 'Navigation' : 'Link');
		});
	}

	function score(query = '') {
		const term = query.toLowerCase().trim();
		if (!term) return index.slice(0, resultLimit);

		return index
			.map((item) => ({
				item,
				score: item.search.startsWith(term) ? 220 : item.search.includes(term) ? 140 : 0,
			}))
			.filter(({ score }) => score > 0)
			.sort((a, b) => b.score - a.score)
			.map(({ item }) => item)
			.slice(0, resultLimit);
	}

	function renderResults(results) {
		if (!results.length) {
			resultsList.innerHTML = '<li class="site-nav__search-empty">No matches found</li>';
		} else {
			resultsList.innerHTML = results
				.map(
					(item, idx) => `
						<li>
							<a href="${item.target}" data-search-index="${idx}">
								<strong>${item.label}</strong>
								<span>${item.hint}</span>
							</a>
						</li>
					`
				)
				.join('');
		}

		resultsList.classList.add('is-visible');
		resultLinks = Array.from(resultsList.querySelectorAll('a'));
		activeIndex = -1;
	}

	function handleKeydown(event) {
		if (!resultsList.classList.contains('is-visible') || !resultLinks.length) return;

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			updateActive((activeIndex + 1) % resultLinks.length);
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			updateActive((activeIndex - 1 + resultLinks.length) % resultLinks.length);
		} else if (event.key === 'Enter' && activeIndex >= 0) {
			event.preventDefault();
			resultLinks[activeIndex].click();
		} else if (event.key === 'Escape') {
			closeResults();
			input.blur();
		}
	}

	function updateActive(nextIndex) {
		if (activeIndex >= 0) resultLinks[activeIndex].classList.remove('is-active');
		activeIndex = nextIndex;
		const current = resultLinks[activeIndex];
		if (current) {
			current.classList.add('is-active');
			current.focus();
		}
	}

	function closeResults() {
		resultsList.innerHTML = '';
		resultsList.classList.remove('is-visible');
		activeIndex = -1;
		resultLinks = [];
	}

	function debounce(fn, delay) {
		let timer;
		return (...args) => {
			clearTimeout(timer);
			timer = setTimeout(() => fn(...args), delay);
		};
	}
}

if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(console.error));
}
