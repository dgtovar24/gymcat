import { e as createComponent, m as maybeRenderHead, g as addAttribute, r as renderTemplate, h as createAstro, n as renderComponent, q as renderSlot, k as renderHead, u as unescapeHTML } from './astro/server_BQV9f3Pp.mjs';
import 'piccolore';
import 'clsx';
/* empty css                          */

const $$Astro$1 = createAstro();
const $$Header = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Header;
  const { currentPath = "/" } = Astro2.props;
  const navItems = [{ label: "Gimnasios", href: "/gimnasios" }, { label: "Mapa", href: "/mapa" }, { label: "Gu\xEDa", href: "/guia" }];
  return renderTemplate`${maybeRenderHead()}<header class="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-ring-border" data-astro-cid-hnhh3bfe> <nav class="container-xl flex items-center justify-between" style="padding-top:12px;padding-bottom:12px;" aria-label="Main navigation" data-astro-cid-hnhh3bfe> <a href="/" class="flex items-center gap-2 no-underline text-midnight hover:opacity-70 transition-opacity" data-astro-cid-hnhh3bfe> <span style="font-family:var(--font-display);font-weight:600;font-size:18px;" data-astro-cid-hnhh3bfe>gymcat</span> </a> <div class="hide-mobile" style="display:flex;align-items:center;gap:24px;" data-astro-cid-hnhh3bfe> ${navItems.map((item) => renderTemplate`<a${addAttribute(item.href, "href")} class="nav-link"${addAttribute(`font-size:14px;font-weight:500;color:${currentPath.startsWith(item.href) ? "var(--color-charcoal)" : "var(--color-mid-gray)"}`, "style")} data-astro-cid-hnhh3bfe>${item.label}</a>`)} </div> <div style="display:flex;align-items:center;gap:8px;" data-astro-cid-hnhh3bfe> <a href="/admin" class="hide-mobile nav-link" style="font-size:13px;color:var(--color-mid-gray);" data-astro-cid-hnhh3bfe>Admin</a> <a href="/gimnasios" class="btn-primary" style="font-size:13px;padding:7px 16px;text-decoration:none;" data-astro-cid-hnhh3bfe>Buscar</a> <!-- Mobile menu button --> <button class="show-mobile" onclick="document.getElementById('mobile-menu').classList.toggle('active')" style="background:none;border:none;font-size:22px;cursor:pointer;padding:4px 8px;color:var(--color-charcoal);" aria-label="Menú" data-astro-cid-hnhh3bfe>☰</button> </div> </nav> <!-- Mobile menu --> <div id="mobile-menu" class="show-mobile" style="display:none;background:var(--color-white);border-top:1px solid rgba(34,42,53,0.08);padding:8px 0;" data-astro-cid-hnhh3bfe> ${navItems.map((item) => renderTemplate`<a${addAttribute(item.href, "href")} style="display:block;padding:12px 16px;font-size:15px;color:var(--color-charcoal);text-decoration:none;border-bottom:1px solid rgba(34,42,53,0.04);" data-astro-cid-hnhh3bfe>${item.label}</a>`)} <a href="/admin" style="display:block;padding:12px 16px;font-size:15px;color:var(--color-mid-gray);text-decoration:none;" data-astro-cid-hnhh3bfe>Admin</a> </div> </header> `;
}, "/Users/dgtovar/Projects/gymcat/src/components/ui/Header.astro", void 0);

const $$Footer = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<footer class="bg-white" style="border-top:1px solid rgba(34,42,53,0.08);"> <div class="container-xl" style="padding-top:40px;padding-bottom:40px;"> <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;"> <div> <a href="/" class="no-underline" style="font-family:var(--font-display);font-weight:600;font-size:18px;color:var(--color-charcoal);">gymcat</a> <p style="margin-top:6px;font-size:13px;font-weight:300;color:var(--color-mid-gray);line-height:1.5;">Comparador inteligente de gimnasios en Cataluña.</p> </div> <div> <h6 style="margin-bottom:8px;">EXPLORAR</h6> <ul style="list-style:none;padding:0;display:flex;flex-direction:column;gap:6px;"> <li><a href="/gimnasios" class="nav-link" style="font-size:13px;">Todos los gimnasios</a></li> <li><a href="/vs" class="nav-link" style="font-size:13px;">Comparador VS</a></li> <li><a href="/mapa" class="nav-link" style="font-size:13px;">Mapa</a></li> <li><a href="/guia" class="nav-link" style="font-size:13px;">Guía</a></li> </ul> </div> </div> <div style="margin-top:32px;padding-top:16px;border-top:1px solid rgba(34,42,53,0.08);display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center;"> <p style="font-size:11px;color:var(--color-mid-gray);">&copy; ${(/* @__PURE__ */ new Date()).getFullYear()} Gymcat &middot; Hecho en Barcelona</p> </div> </div> </footer>`;
}, "/Users/dgtovar/Projects/gymcat/src/components/ui/Footer.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$BaseLayout;
  const {
    title,
    description,
    currentPath = Astro2.url?.pathname || "/"
  } = Astro2.props;
  return renderTemplate(_a || (_a = __template(['<html lang="es"> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600&family=Roboto+Mono:wght@400;600&display=swap" rel="stylesheet"><title>', '</title><meta name="description"', '><!-- Open Graph --><meta property="og:title"', '><meta property="og:description"', '><meta property="og:type" content="website"><meta property="og:site_name" content="Gymcat"><!-- Schema Markup: WebSite --><script type="application/ld+json">', "<\/script>", "", '</head> <body class="min-h-screen flex flex-col bg-white text-charcoal"> ', ' <main class="flex-1"> ', " </main> ", " </body></html>"])), title ? `${title} | Gymcat` : "Gymcat \u2014 Comparador de Gimnasios", addAttribute(description || "Compara precios, instalaciones y horarios de gimnasios en Catalu\xF1a. Transparencia total con datos actualizados por IA.", "content"), addAttribute(title || "Gymcat \u2014 Comparador de Gimnasios", "content"), addAttribute(description || "Compara precios, instalaciones y horarios de gimnasios en Catalu\xF1a.", "content"), unescapeHTML(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Gymcat",
    url: "https://gymcat.es",
    description: "Comparador inteligente de gimnasios en Catalu\xF1a",
    inLanguage: "es"
  })), renderSlot($$result, $$slots["head"]), renderHead(), renderComponent($$result, "Header", $$Header, { "currentPath": currentPath }), renderSlot($$result, $$slots["default"]), renderComponent($$result, "Footer", $$Footer, {}));
}, "/Users/dgtovar/Projects/gymcat/src/layouts/BaseLayout.astro", void 0);

export { $$BaseLayout as $ };
