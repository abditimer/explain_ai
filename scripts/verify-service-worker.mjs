import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../public/service-worker.js', import.meta.url), 'utf8');
const listeners = new Map();
const cacheStore = new Map();
const scope = 'https://example.test/explain_ai/';
const precacheFiles = [
  'assets/index.js',
  'assets/GenerationDiagram.js',
  'assets/gpt2_next_token_logits.f32',
  'docs/code/gpt2_next_token.json',
  'implementation.html',
  'sources.html',
];
let networkOnline = true;
let skippedWaiting = false;
let clientsClaimed = false;

const requestKey = (request) => typeof request === 'string' ? request : request.url;
class MemoryCache {
  constructor() { this.entries = new Map(); }
  async add(request) {
    const response = await fakeFetch(request);
    if (!response.ok) throw new Error(`Cannot cache ${requestKey(request)}`);
    await this.put(request, response.clone());
  }
  async addAll(requests) { await Promise.all(requests.map((request) => this.add(request))); }
  async put(request, response) { this.entries.set(requestKey(request), response.clone()); }
  async match(request) { return this.entries.get(requestKey(request))?.clone(); }
}

const caches = {
  async open(name) {
    if (!cacheStore.has(name)) cacheStore.set(name, new MemoryCache());
    return cacheStore.get(name);
  },
  async keys() { return [...cacheStore.keys()]; },
  async delete(name) { return cacheStore.delete(name); },
};

async function fakeFetch(request) {
  if (!networkOnline) throw new TypeError('Network unavailable');
  const url = requestKey(request);
  if (url === `${scope}precache-manifest.json`) {
    return new Response(JSON.stringify(precacheFiles), { status: 200, headers: { 'content-type': 'application/json' } });
  }
  return new Response(`network:${url}`, { status: 200 });
}

const self = {
  location: { origin: 'https://example.test' },
  registration: { scope },
  clients: { async claim() { clientsClaimed = true; } },
  async skipWaiting() { skippedWaiting = true; },
  addEventListener(type, handler) { listeners.set(type, handler); },
};

vm.runInNewContext(source, { self, caches, fetch: fakeFetch, URL, Response });
cacheStore.set('explain-ai-static-old', new MemoryCache());

async function dispatchLifecycle(type) {
  let pending;
  listeners.get(type)({ waitUntil(promise) { pending = promise; } });
  await pending;
}

async function dispatchFetch(request) {
  let responsePromise;
  listeners.get('fetch')({ request, respondWith(promise) { responsePromise = Promise.resolve(promise); } });
  return responsePromise ? { intercepted: true, response: await responsePromise } : { intercepted: false };
}

await dispatchLifecycle('install');
assert.equal(skippedWaiting, true, 'install should activate without waiting for the old worker');
const cache = await caches.open('explain-ai-static-v2');
const shell = await cache.match(scope);
assert.equal(await shell.text(), `network:${scope}`, 'install should cache the app shell');
for (const file of precacheFiles) {
  const cachedAsset = await cache.match(`${scope}${file}`);
  assert.ok(cachedAsset, `install should precache ${file}`);
}

await dispatchLifecycle('activate');
assert.equal(clientsClaimed, true, 'activate should claim controlled clients');
assert.deepEqual(await caches.keys(), ['explain-ai-static-v2'], 'activation should remove stale app caches');

const cachedFiles = [
  'assets/index.js',
  'assets/GenerationDiagram.js',
  'assets/gpt2_next_token_logits.f32',
  'docs/code/gpt2_next_token.json',
  'implementation.html',
  'sources.html',
];
for (const file of cachedFiles) {
  const request = { method: 'GET', url: `${scope}${file}`, mode: 'cors' };
  const online = await dispatchFetch(request);
  assert.equal(online.intercepted, true);
  assert.equal(await online.response.text(), `network:${request.url}`);
}

networkOnline = false;
for (const file of cachedFiles) {
  const request = { method: 'GET', url: `${scope}${file}`, mode: 'cors' };
  const cached = await dispatchFetch(request);
  assert.equal(await cached.response.text(), `network:${request.url}`, `offline request should use cached ${file}`);
}

const deepNavigation = { method: 'GET', url: `${scope}chapter/attention`, mode: 'navigate' };
const fallback = await dispatchFetch(deepNavigation);
assert.equal(await fallback.response.text(), `network:${scope}`, 'uncached navigations should recover with the app shell');

const outsideScope = await dispatchFetch({ method: 'GET', url: 'https://example.test/outside/app.js', mode: 'cors' });
const crossOrigin = await dispatchFetch({ method: 'GET', url: 'https://other.test/explain_ai/app.js', mode: 'cors' });
const postRequest = await dispatchFetch({ method: 'POST', url: `${scope}submit`, mode: 'cors' });
assert.equal(outsideScope.intercepted, false, 'requests outside the registration scope should pass through');
assert.equal(crossOrigin.intercepted, false, 'cross-origin requests should pass through');
assert.equal(postRequest.intercepted, false, 'non-GET requests should pass through');

console.log('Verified offline asset manifest install, full-site precaching, offline recovery for code/diagrams/logits/pages, deep navigation fallback, stale-cache cleanup, and request scope.');
