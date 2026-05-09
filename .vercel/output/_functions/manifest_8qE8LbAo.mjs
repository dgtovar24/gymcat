import 'piccolore';
import { v as decodeKey } from './chunks/astro/server_BQV9f3Pp.mjs';
import 'clsx';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/astro-designed-error-pages_BvpUNje4.mjs';
import 'es-module-lexer';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///Users/dgtovar/Projects/gymcat/","cacheDir":"file:///Users/dgtovar/Projects/gymcat/node_modules/.astro/","outDir":"file:///Users/dgtovar/Projects/gymcat/dist/","srcDir":"file:///Users/dgtovar/Projects/gymcat/src/","publicDir":"file:///Users/dgtovar/Projects/gymcat/public/","buildClientDir":"file:///Users/dgtovar/Projects/gymcat/dist/client/","buildServerDir":"file:///Users/dgtovar/Projects/gymcat/dist/server/","adapterName":"@astrojs/vercel","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"inline","content":"[data-astro-cid-rf56lckb]{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;background:#f5f5f5;display:flex;align-items:center;justify-content:center;min-height:100vh}.login-box[data-astro-cid-rf56lckb]{background:#fff;border-radius:12px;padding:40px;width:380px;box-shadow:0 4px 24px #00000014}.login-box[data-astro-cid-rf56lckb] h1[data-astro-cid-rf56lckb]{font-size:24px;margin-bottom:8px;color:#242424}.login-box[data-astro-cid-rf56lckb] p[data-astro-cid-rf56lckb]{color:#888;font-size:14px;margin-bottom:24px}.form-group[data-astro-cid-rf56lckb]{margin-bottom:16px}.form-group[data-astro-cid-rf56lckb] label[data-astro-cid-rf56lckb]{display:block;font-size:13px;font-weight:600;color:#555;margin-bottom:4px}.form-group[data-astro-cid-rf56lckb] input[data-astro-cid-rf56lckb]{width:100%;padding:10px 14px;border:1px solid #ddd;border-radius:8px;font-size:15px}.btn[data-astro-cid-rf56lckb]{width:100%;padding:12px;background:#242424;color:#fff;border:none;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer}.btn[data-astro-cid-rf56lckb]:hover{opacity:.9}.error[data-astro-cid-rf56lckb]{background:#fee2e2;color:#991b1b;padding:10px 14px;border-radius:6px;font-size:13px;margin-bottom:16px}\n"}],"routeData":{"route":"/admin/login","isIndex":false,"type":"page","pattern":"^\\/admin\\/login\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}],[{"content":"login","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin/login.astro","pathname":"/admin/login","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/admin/logout","isIndex":false,"type":"page","pattern":"^\\/admin\\/logout\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}],[{"content":"logout","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin/logout.astro","pathname":"/admin/logout","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"inline","content":"[data-astro-cid-bic5s7gl]{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;background:#f5f5f5;color:#242424}.ah[data-astro-cid-bic5s7gl]{background:#242424;color:#fff;padding:16px 24px;display:flex;justify-content:space-between;align-items:center}.ah[data-astro-cid-bic5s7gl] h1[data-astro-cid-bic5s7gl]{font-size:18px}.ah[data-astro-cid-bic5s7gl] a[data-astro-cid-bic5s7gl]{color:#aaa;text-decoration:none;font-size:14px}.container[data-astro-cid-bic5s7gl]{max-width:1200px;margin:0 auto;padding:24px}.msg[data-astro-cid-bic5s7gl]{padding:10px 16px;border-radius:6px;margin-bottom:16px;font-size:14px}.msg-ok[data-astro-cid-bic5s7gl]{background:#dcfce7;color:#166534}.msg-err[data-astro-cid-bic5s7gl]{background:#fee2e2;color:#991b1b}.grid[data-astro-cid-bic5s7gl]{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px}.card[data-astro-cid-bic5s7gl]{background:#fff;border-radius:8px;padding:16px;box-shadow:0 1px 3px #0000001a}.card[data-astro-cid-bic5s7gl] h3[data-astro-cid-bic5s7gl]{font-size:14px;margin-bottom:8px}.card[data-astro-cid-bic5s7gl] .imgs[data-astro-cid-bic5s7gl]{display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:6px;margin-bottom:10px}.card[data-astro-cid-bic5s7gl] .imgs[data-astro-cid-bic5s7gl] .thumb[data-astro-cid-bic5s7gl]{position:relative;aspect-ratio:1;overflow:hidden;border-radius:4px}.card[data-astro-cid-bic5s7gl] .imgs[data-astro-cid-bic5s7gl] .thumb[data-astro-cid-bic5s7gl] img[data-astro-cid-bic5s7gl]{width:100%;height:100%;object-fit:cover}.card[data-astro-cid-bic5s7gl] .imgs[data-astro-cid-bic5s7gl] .thumb[data-astro-cid-bic5s7gl] .del[data-astro-cid-bic5s7gl]{position:absolute;top:2px;right:2px;background:#ef4444e6;color:#fff;border:none;border-radius:3px;width:18px;height:18px;font-size:11px;cursor:pointer;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .15s}.card[data-astro-cid-bic5s7gl] .imgs[data-astro-cid-bic5s7gl] .thumb[data-astro-cid-bic5s7gl]:hover .del[data-astro-cid-bic5s7gl]{opacity:1}.card[data-astro-cid-bic5s7gl] form[data-astro-cid-bic5s7gl]{display:flex;gap:6px;align-items:center}.card[data-astro-cid-bic5s7gl] input[data-astro-cid-bic5s7gl][type=file]{flex:1;font-size:11px}.btn[data-astro-cid-bic5s7gl]{padding:5px 12px;border:none;border-radius:5px;cursor:pointer;font-size:11px;font-weight:500;background:#242424;color:#fff}.count[data-astro-cid-bic5s7gl]{font-size:11px;color:#888}\n"}],"routeData":{"route":"/admin/upload","isIndex":false,"type":"page","pattern":"^\\/admin\\/upload\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}],[{"content":"upload","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin/upload.astro","pathname":"/admin/upload","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"inline","content":"[data-astro-cid-u2h3djql]{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;background:#f5f5f5;color:#242424}.ah[data-astro-cid-u2h3djql]{background:#242424;color:#fff;padding:16px 24px;display:flex;justify-content:space-between;align-items:center}.ah[data-astro-cid-u2h3djql] h1[data-astro-cid-u2h3djql]{font-size:18px}.ah[data-astro-cid-u2h3djql] a[data-astro-cid-u2h3djql]{color:#aaa;text-decoration:none;font-size:14px}.container[data-astro-cid-u2h3djql]{max-width:1400px;margin:0 auto;padding:24px}table[data-astro-cid-u2h3djql]{width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px #0000001a}th[data-astro-cid-u2h3djql],td[data-astro-cid-u2h3djql]{padding:10px 14px;text-align:left;border-bottom:1px solid #eee;font-size:13px}th[data-astro-cid-u2h3djql]{background:#f9f9f9;font-weight:600;color:#555;text-transform:uppercase;font-size:11px}tr[data-astro-cid-u2h3djql]:hover{background:#fafafa}.btn[data-astro-cid-u2h3djql]{padding:6px 14px;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:500}.btn-edit[data-astro-cid-u2h3djql]{background:#242424;color:#fff}.btn-save[data-astro-cid-u2h3djql]{background:#22c55e;color:#fff}.btn-cancel[data-astro-cid-u2h3djql]{background:#eee;color:#555}.modal-overlay[data-astro-cid-u2h3djql]{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:#00000080;z-index:100;justify-content:center;align-items:flex-start;padding-top:40px;overflow-y:auto}.modal-overlay[data-astro-cid-u2h3djql].active{display:flex}.modal[data-astro-cid-u2h3djql]{background:#fff;border-radius:12px;padding:32px;max-width:700px;width:95%;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px #0003}.modal[data-astro-cid-u2h3djql] h2[data-astro-cid-u2h3djql]{font-size:20px;margin-bottom:20px}.fg[data-astro-cid-u2h3djql]{margin-bottom:14px}.fg[data-astro-cid-u2h3djql] label[data-astro-cid-u2h3djql]{display:block;font-size:12px;font-weight:600;color:#555;margin-bottom:4px;text-transform:uppercase}.fg[data-astro-cid-u2h3djql] input[data-astro-cid-u2h3djql],.fg[data-astro-cid-u2h3djql] textarea[data-astro-cid-u2h3djql],.fg[data-astro-cid-u2h3djql] select[data-astro-cid-u2h3djql]{width:100%;padding:8px 12px;border:1px solid #ddd;border-radius:6px;font-size:14px;font-family:inherit}.fg[data-astro-cid-u2h3djql] textarea[data-astro-cid-u2h3djql]{min-height:80px}.fr[data-astro-cid-u2h3djql]{display:grid;grid-template-columns:1fr 1fr;gap:14px}.ip[data-astro-cid-u2h3djql]{max-width:200px;max-height:120px;border-radius:6px;margin-top:6px}.msg[data-astro-cid-u2h3djql]{padding:10px 16px;border-radius:6px;margin-bottom:16px;font-size:14px}.msg-ok[data-astro-cid-u2h3djql]{background:#dcfce7;color:#166534}.msg-err[data-astro-cid-u2h3djql]{background:#fee2e2;color:#991b1b}.fcs[data-astro-cid-u2h3djql]{display:flex;flex-wrap:wrap;gap:4px}.fc[data-astro-cid-u2h3djql]{padding:3px 8px;border-radius:20px;font-size:11px;border:1px solid #ddd;cursor:pointer;user-select:none}.fc[data-astro-cid-u2h3djql].sel{background:#242424;color:#fff;border-color:#242424}\n"}],"routeData":{"route":"/admin","isIndex":true,"type":"page","pattern":"^\\/admin\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin/index.astro","pathname":"/admin","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/gym-facilities","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/gym-facilities\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"gym-facilities","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/admin/gym-facilities.ts","pathname":"/api/admin/gym-facilities","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/_slug_.BYFw2eG5.css"}],"routeData":{"route":"/gimnasios/[slug]","isIndex":false,"type":"page","pattern":"^\\/gimnasios\\/([^/]+?)\\/?$","segments":[[{"content":"gimnasios","dynamic":false,"spread":false}],[{"content":"slug","dynamic":true,"spread":false}]],"params":["slug"],"component":"src/pages/gimnasios/[slug].astro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/_slug_.BYFw2eG5.css"}],"routeData":{"route":"/gimnasios","isIndex":true,"type":"page","pattern":"^\\/gimnasios\\/?$","segments":[[{"content":"gimnasios","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/gimnasios/index.astro","pathname":"/gimnasios","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/_slug_.BYFw2eG5.css"}],"routeData":{"route":"/mapa","isIndex":false,"type":"page","pattern":"^\\/mapa\\/?$","segments":[[{"content":"mapa","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/mapa.astro","pathname":"/mapa","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/_slug_.BYFw2eG5.css"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["/Users/dgtovar/Projects/gymcat/src/pages/admin/login.astro",{"propagation":"none","containsHead":true}],["/Users/dgtovar/Projects/gymcat/src/pages/admin/upload.astro",{"propagation":"none","containsHead":true}],["/Users/dgtovar/Projects/gymcat/src/pages/admin/index.astro",{"propagation":"none","containsHead":true}],["/Users/dgtovar/Projects/gymcat/src/pages/gimnasios/[slug].astro",{"propagation":"none","containsHead":true}],["/Users/dgtovar/Projects/gymcat/src/pages/gimnasios/index.astro",{"propagation":"none","containsHead":true}],["/Users/dgtovar/Projects/gymcat/src/pages/index.astro",{"propagation":"none","containsHead":true}],["/Users/dgtovar/Projects/gymcat/src/pages/mapa.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000noop-middleware":"_noop-middleware.mjs","\u0000virtual:astro:actions/noop-entrypoint":"noop-entrypoint.mjs","\u0000@astro-page:src/pages/admin/login@_@astro":"pages/admin/login.astro.mjs","\u0000@astro-page:src/pages/admin/logout@_@astro":"pages/admin/logout.astro.mjs","\u0000@astro-page:src/pages/admin/upload@_@astro":"pages/admin/upload.astro.mjs","\u0000@astro-page:src/pages/admin/index@_@astro":"pages/admin.astro.mjs","\u0000@astro-page:src/pages/api/admin/gym-facilities@_@ts":"pages/api/admin/gym-facilities.astro.mjs","\u0000@astro-page:src/pages/gimnasios/[slug]@_@astro":"pages/gimnasios/_slug_.astro.mjs","\u0000@astro-page:src/pages/gimnasios/index@_@astro":"pages/gimnasios.astro.mjs","\u0000@astro-page:src/pages/mapa@_@astro":"pages/mapa.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_8qE8LbAo.mjs","/Users/dgtovar/Projects/gymcat/node_modules/@astrojs/vercel/dist/image/build-service.js":"chunks/build-service_HmY4OJJg.mjs","/Users/dgtovar/Projects/gymcat/src/pages/gimnasios/[slug].astro?astro&type=script&index=0&lang.ts":"_astro/_slug_.astro_astro_type_script_index_0_lang.BdpDw26L.js","/Users/dgtovar/Projects/gymcat/src/pages/mapa.astro?astro&type=script&index=0&lang.ts":"_astro/mapa.astro_astro_type_script_index_0_lang.BdpDw26L.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/_astro/_slug_.BYFw2eG5.css","/favicon.svg","/_astro/_slug_.astro_astro_type_script_index_0_lang.BdpDw26L.js","/_astro/mapa.astro_astro_type_script_index_0_lang.BdpDw26L.js"],"buildFormat":"directory","checkOrigin":true,"allowedDomains":[],"actionBodySizeLimit":1048576,"serverIslandNameMap":[],"key":"2CNXXtbNYYQ62qPQR5CzDPaZWjTl89R+yxxCpMTHjhk="});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = null;

export { manifest };
