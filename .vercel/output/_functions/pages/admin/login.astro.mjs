import { e as createComponent, k as renderHead, r as renderTemplate, h as createAstro } from '../../chunks/astro/server_BQV9f3Pp.mjs';
import 'piccolore';
import 'clsx';
/* empty css                                    */
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Login;
  let error = "";
  if (Astro2.request.method === "POST") {
    const formData = await Astro2.request.formData();
    const username = formData.get("username")?.toString();
    const password = formData.get("password")?.toString();
    if (username === "admin" && password === "admin123") {
      Astro2.cookies.set("admin_auth", "gymcat_admin_2026", {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24
        // 24 hours
      });
      return Astro2.redirect("/admin");
    } else {
      error = "Usuario o contrase\xF1a incorrectos";
    }
  }
  return renderTemplate`<html lang="es" data-astro-cid-rf56lckb> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Admin Login — Gymcat</title>${renderHead()}</head> <body data-astro-cid-rf56lckb> <div class="login-box" data-astro-cid-rf56lckb> <h1 data-astro-cid-rf56lckb>Gymcat Admin</h1> <p data-astro-cid-rf56lckb>Acceso restringido al panel de administración</p> ${error && renderTemplate`<div class="error" data-astro-cid-rf56lckb>${error}</div>`} <form method="POST" data-astro-cid-rf56lckb> <div class="form-group" data-astro-cid-rf56lckb> <label data-astro-cid-rf56lckb>Usuario</label> <input type="text" name="username" placeholder="admin" required autofocus data-astro-cid-rf56lckb> </div> <div class="form-group" data-astro-cid-rf56lckb> <label data-astro-cid-rf56lckb>Contraseña</label> <input type="password" name="password" placeholder="••••••••" required data-astro-cid-rf56lckb> </div> <button type="submit" class="btn" data-astro-cid-rf56lckb>Iniciar sesión</button> </form> </div> </body></html>`;
}, "/Users/dgtovar/Projects/gymcat/src/pages/admin/login.astro", void 0);

const $$file = "/Users/dgtovar/Projects/gymcat/src/pages/admin/login.astro";
const $$url = "/admin/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
