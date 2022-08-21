console.log("Service worker registered.");

var cacheName = "oispahalla-offline";
var HAC_urls = ["https://localhost:8000", "http://localhost:8000", "https://hac.oispahalla.com:8000", "https://hac.hallacoin.ml:8000", "http://35.225.19.22:8000", "http://localhost:5000", "https://localhost:5000"];
var HAC_alive = "/HAC/alive/";
var LB_hosts = ["https://localhost:5000", "http://localhost:5000", "https://oispahallalb.herokuapp.com", "http://oispahallalb.herokuapp.com"];
var LB_urls = ["/scores/3/", "/scores/4/"];
var blacklist = [
	"manifest.json",
  "sw.js",
  "@vite/client",
  "__vite_ping"
];
var deathlist = [
  "oispahallalb.herokuapp.com"
]
for(let i in HAC_urls){
  blacklist.push( HAC_urls[i] + HAC_alive );
}
for(let host in LB_hosts){
  for(let path in LB_urls){
    blacklist.push( LB_hosts[host] + LB_urls[path] );
  }
}

function deathlistAllows(str){
  deathlist.forEach( (val) => {
    if(val.includes(str)){
      return false;
    }
  } );
  return true;
}

self.addEventListener('fetch', (event) => {
  event.respondWith(async function() {
    try {
      const response = await fetch(event.request);
      const cache = await caches.open(cacheName);
      if( !(blacklist.includes(response.url)) && deathlistAllows(response.url) && response.ok ){
        try{
	        cache.put(event.request, response.clone());
        }
        catch{console.log("Couldn't save to cache!")} // the response should still be returned, even if it didn't make it to the cache
      }
      return response;
    } catch (err) {
      if( response && response != null && response.url && response.url != null && !(blacklist.includes(response.url)) && deathlistAllows(response.url) ){
        return caches.match(event.request);
      }
      else{
        throw err;
      }
    }
  }());
});