console.log("Service worker registered.");

var cacheName = "oispahalla-offline";
var HAC_urls = ["https://localhost:8000", "http://localhost:8000", "https://hac.oispahalla.com:8000", "https://hac.hallacoin.ml:8000", "http://35.225.19.22:8000", "http://localhost:5000", "https://localhost:5000"];
var HAC_alive = "/HAC/alive/";
var blacklist = [
	"manifest.json",
  "sw.js"
];
for(let i in HAC_urls){
  blacklist.push( HAC_urls[i] + HAC_alive );
}

self.addEventListener('fetch', (event) => {
  event.respondWith(async function() {
    try {
      const response = await fetch(event.request);
      const cache = await caches.open(cacheName);
      if( !(blacklist.includes(response.url)) ){
        try{
	        cache.put(event.request, response.clone());
        }
        catch{} // the response should still be returned, even if it didn't make it to the cache
      }
      return response;
    } catch (err) {
      return caches.match(event.request);
    }
  }());
});