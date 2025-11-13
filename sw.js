const CACHE_NAME = 'sbso-cache-v2';
const ASSETS = [
	'index.html',
	'manifest.json',
	'style.css',
	'blog.css',
	'venture.css',
	'blog1.html',
	'blog2.html',
	'blog3.html',
	'venture1.html',
	'venture2.html',
	'venture3.html',
	'venture4.html',
	'venture5.html',
	'SBSO_FOUNDATION.jpg',
	'wbssl_logo.jpg',
	'Background_Img.jpg'
];

self.addEventListener('install', event => {
	event.waitUntil(
		caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
	);
	self.skipWaiting();
});

self.addEventListener('activate', event => {
	event.waitUntil(
		caches.keys().then(keys =>
			Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
	);
	self.clients.claim();
});

self.addEventListener('fetch', event => {
	if (event.request.method !== 'GET') return;

	event.respondWith(
		caches.match(event.request).then(cached => {
			if (cached) return cached;

			return fetch(event.request).then(response => {
				if (!response || response.status !== 200 || response.type === 'opaque') {
					return response;
				}
				const cloned = response.clone();
				caches.open(CACHE_NAME).then(cache => cache.put(event.request, cloned));
				return response;
			}).catch(() => {
				if (event.request.mode === 'navigate') {
					return caches.match('index.html');
				}
			});
		})
	);
});
