console.log("Service worker registered.");

var cacheName = "oispahalla-offline";
var blacklist = [
	"manifest.json"
]

self.addEventListener('fetch', (event) => {
  event.respondWith(async function() {
    try {
      const response = await fetch(event.request);
      const cache = await caches.open(cacheName);
	  cache.put(event.request, response.clone());
      return response;
    } catch (err) {
      return caches.match(event.request);
    }
  }());
});