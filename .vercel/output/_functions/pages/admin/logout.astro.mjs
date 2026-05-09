import { e as createComponent, h as createAstro } from '../../chunks/astro/server_BQV9f3Pp.mjs';
import 'piccolore';
import 'clsx';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const $$Logout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Logout;
  Astro2.cookies.delete("admin_auth", { path: "/" });
  return Astro2.redirect("/admin/login");
}, "/Users/dgtovar/Projects/gymcat/src/pages/admin/logout.astro", void 0);

const $$file = "/Users/dgtovar/Projects/gymcat/src/pages/admin/logout.astro";
const $$url = "/admin/logout";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Logout,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
