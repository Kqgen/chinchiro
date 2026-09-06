/* オフラインでも遊べるようにするための「留守番役」。
   一度開いたページを手元に保存しておき、電波がなくても出してくれる。 */

var CACHE = "chinchiro-v1";
var FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

/* 初回：必要なファイルを手元に取り込む */
self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(FILES); })
  );
  self.skipWaiting();
});

/* 古い保存分の片付け */
self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        if (k !== CACHE) return caches.delete(k);
      }));
    })
  );
  self.clients.claim();
});

/* 表示するとき：まずネット、だめなら手元の保存分を出す */
self.addEventListener("fetch", function(e){
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then(function(res){
        var copy = res.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
        return res;
      })
      .catch(function(){ return caches.match(e.request); })
  );
});
