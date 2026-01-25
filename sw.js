const CACHE_NAME = 'sbso-cache-v3';
const ASSETS = [
	'index.html',
	'manifest.json',
	'blog1.html',
	'venture1.html',
	'venture2.html',
	'venture3.html',
	'venture4.html',
	'venture5.html',
	'assets/css/style.css',
	'assets/css/blog.css',
	'assets/css/venture.css',
	'assets/js/main.js',
	'assets/js/venture-nav.js',
	'assets/images/SBSO_FOUNDATION.jpg',
	'assets/images/wbssl_logo.jpg',
	'assets/images/Background_img.jpg',
	'assets/media/hero-video.mp4'
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
