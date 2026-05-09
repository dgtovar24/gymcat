import { e as createComponent, n as renderComponent, r as renderTemplate, m as maybeRenderHead, g as addAttribute, o as Fragment } from '../chunks/astro/server_BQV9f3Pp.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_BLw1XXRd.mjs';
import { d as db, a as gyms, c as chains } from '../chunks/index_D-1h83sr.mjs';
import { eq, asc } from 'drizzle-orm';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const allGyms = await db.select({ id: gyms.id, name: gyms.name, slug: gyms.slug, address: gyms.address, monthlyPriceLow: gyms.monthlyPriceLow, monthlyPriceHigh: gyms.monthlyPriceHigh, matriculaFee: gyms.matriculaFee, isOpen247: gyms.isOpen247, imageUrl: gyms.imageUrl, chainId: gyms.chainId }).from(gyms).where(eq(gyms.status, "active")).orderBy(asc(gyms.name));
  const allChains = await db.select().from(chains);
  const chainMap = new Map(allChains.map((c) => [c.id, c]));
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Gimnasios en Catalu\xF1a", "description": "Explora todos los gimnasios indexados en Gymcat.", "currentPath": "/gimnasios" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="res-section-tight" style="background:var(--color-white);"> <div class="container-xl"> <h1 style="margin-bottom:4px;">Gimnasios en Cataluña</h1> <p style="font-size:14px;font-weight:300;color:var(--color-mid-gray);letter-spacing:-0.1px;">${allGyms.length} gimnasios indexados con precios reales.</p> </div> </section> <section style="padding:0 0 64px 0;background:var(--color-off-white);min-height:50vh;"> <div class="container-xl"> ${allGyms.length === 0 ? renderTemplate`<div style="text-align:center;padding:60px 0;"><p style="font-size:16px;font-weight:300;color:var(--color-mid-gray);">Aún no hay gimnasios indexados.</p></div>` : renderTemplate`<div class="res-grid-3" style="gap:12px;"> ${allGyms.map((gym) => {
    const chain = gym.chainId ? chainMap.get(gym.chainId) : null;
    return renderTemplate`<a${addAttribute(`/gimnasios/${gym.slug}`, "href")} class="card no-underline" style="display:block;text-decoration:none;color:inherit;transition:box-shadow 0.15s;"> ${gym.imageUrl ? renderTemplate`<div style="width:100%;aspect-ratio:4/3;overflow:hidden;border-radius:8px;margin-bottom:12px;background:var(--color-off-white);"> <img${addAttribute(gym.imageUrl, "src")}${addAttribute(gym.name, "alt")} style="width:100%;height:100%;object-fit:cover;" loading="lazy"> </div>` : renderTemplate`<div style="width:100%;aspect-ratio:4/3;background:var(--color-off-white);border-radius:8px;margin-bottom:12px;display:flex;align-items:center;justify-content:center;"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5"><path d="M6 9l-3 3 3 3"></path><path d="M18 9l3 3-3 3"></path><path d="M12 5v14"></path></svg></div>`} ${chain && renderTemplate`<span style="display:inline-block;font-size:11px;font-weight:500;color:var(--color-mid-gray);padding:2px 8px;border-radius:var(--radius-pill);box-shadow:var(--shadow-ring-border);margin-bottom:8px;">${chain.name}</span>`} <h3 style="font-size:17px;margin-bottom:4px;">${gym.name}</h3> ${gym.address && renderTemplate`<p style="font-size:13px;color:var(--color-mid-gray);margin-bottom:8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-1px;margin-right:2px;"><circle cx="12" cy="10" r="3"></circle><path d="M12 2a8 8 0 0 0-8 8c0 5.4 8 12 8 12s8-6.6 8-12a8 8 0 0 0-8-8z"></path></svg> ${gym.address}</p>`} <div style="display:flex;align-items:baseline;gap:4px;margin-bottom:8px;"> ${gym.monthlyPriceLow ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate`<span class="mono" style="font-size:16px;">${Number(gym.monthlyPriceLow).toFixed(0)}€</span><span style="font-size:12px;font-weight:300;color:var(--color-mid-gray);">/mes</span>` })}` : renderTemplate`<span style="font-size:12px;color:var(--color-mid-gray);">Precio no disponible</span>`} </div> <div style="display:flex;flex-wrap:wrap;gap:4px;"> ${gym.isOpen247 && renderTemplate`<span style="font-size:10px;font-weight:500;padding:2px 6px;border-radius:var(--radius-pill);background:var(--color-off-white);">24h</span>`} ${gym.matriculaFee && Number(gym.matriculaFee) === 0 && renderTemplate`<span style="font-size:10px;font-weight:500;color:#22c55e;padding:2px 6px;border-radius:var(--radius-pill);background:rgba(34,197,94,0.1);">Sin matrícula</span>`} </div> </a>`;
  })} </div>`} </div> </section> ` })}`;
}, "/Users/dgtovar/Projects/gymcat/src/pages/gimnasios/index.astro", void 0);

const $$file = "/Users/dgtovar/Projects/gymcat/src/pages/gimnasios/index.astro";
const $$url = "/gimnasios";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
