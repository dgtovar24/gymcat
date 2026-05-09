import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_BB_g1Xge.mjs';
import { manifest } from './manifest_8qE8LbAo.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/admin/login.astro.mjs');
const _page2 = () => import('./pages/admin/logout.astro.mjs');
const _page3 = () => import('./pages/admin/upload.astro.mjs');
const _page4 = () => import('./pages/admin.astro.mjs');
const _page5 = () => import('./pages/api/admin/gym-facilities.astro.mjs');
const _page6 = () => import('./pages/gimnasios/_slug_.astro.mjs');
const _page7 = () => import('./pages/gimnasios.astro.mjs');
const _page8 = () => import('./pages/mapa.astro.mjs');
const _page9 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/admin/login.astro", _page1],
    ["src/pages/admin/logout.astro", _page2],
    ["src/pages/admin/upload.astro", _page3],
    ["src/pages/admin/index.astro", _page4],
    ["src/pages/api/admin/gym-facilities.ts", _page5],
    ["src/pages/gimnasios/[slug].astro", _page6],
    ["src/pages/gimnasios/index.astro", _page7],
    ["src/pages/mapa.astro", _page8],
    ["src/pages/index.astro", _page9]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "30c2a7f5-cada-4365-ade7-3c22cec7b9a0",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
