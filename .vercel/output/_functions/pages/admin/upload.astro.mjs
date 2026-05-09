import { e as createComponent, k as renderHead, g as addAttribute, r as renderTemplate, h as createAstro } from '../../chunks/astro/server_BQV9f3Pp.mjs';
import 'piccolore';
import 'clsx';
import { d as db, g as gymImages, a as gyms } from '../../chunks/index_D-1h83sr.mjs';
import { eq, asc } from 'drizzle-orm';
import fs from 'node:fs';
import nodePath from 'node:path';
/* empty css                                     */
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const $$Upload = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Upload;
  const cookie = Astro2.cookies.get("admin_auth");
  if (cookie?.value !== "gymcat_admin_2026") return Astro2.redirect("/admin/login");
  let message = "";
  if (Astro2.request.method === "POST") {
    try {
      const formData = await Astro2.request.formData();
      const file = formData.get("image");
      const gymId = parseInt(formData.get("gym_id")?.toString() || "0");
      if (file && file.size > 0 && gymId) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const filename = `gym-${gymId}-${Date.now()}.${ext}`;
        const uploadDir = nodePath.join(process.cwd(), "public", "uploads");
        fs.mkdirSync(uploadDir, { recursive: true });
        fs.writeFileSync(nodePath.join(uploadDir, filename), buffer);
        const imageUrl = `/uploads/${filename}`;
        const existing = await db.select({ id: gymImages.id }).from(gymImages).where(eq(gymImages.gymId, gymId));
        const nextOrder = existing.length;
        await db.insert(gymImages).values({ gymId, imageUrl, sortOrder: nextOrder });
        if (nextOrder === 0) {
          await db.update(gyms).set({ imageUrl, updatedAt: /* @__PURE__ */ new Date() }).where(eq(gyms.id, gymId));
        }
        message = `\u2705 Imagen subida: ${imageUrl} (${nextOrder + 1} im\xE1genes totales)`;
      }
    } catch (e) {
      message = `\u274C Error: ${e.message}`;
    }
  }
  const url = new URL(Astro2.request.url);
  if (url.searchParams.get("delete")) {
    const deleteId = parseInt(url.searchParams.get("delete"));
    await db.delete(gymImages).where(eq(gymImages.id, deleteId));
    message = "\u2705 Imagen eliminada";
  }
  const allGyms = await db.select({ id: gyms.id, name: gyms.name, imageUrl: gyms.imageUrl }).from(gyms).orderBy(asc(gyms.name));
  const allImages = await db.select().from(gymImages).orderBy(asc(gymImages.sortOrder));
  const imageMap = /* @__PURE__ */ new Map();
  for (const img of allImages) {
    if (!imageMap.has(img.gymId)) imageMap.set(img.gymId, []);
    imageMap.get(img.gymId).push(img);
  }
  return renderTemplate`<html lang="es" data-astro-cid-bic5s7gl> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Galería — Gymcat Admin</title>${renderHead()}</head> <body data-astro-cid-bic5s7gl> <header class="ah" data-astro-cid-bic5s7gl> <h1 data-astro-cid-bic5s7gl>Galer&iacute;a de im&aacute;genes</h1> <div style="display:flex;gap:16px;" data-astro-cid-bic5s7gl><a href="/admin" data-astro-cid-bic5s7gl>&larr; Volver al panel</a></div> </header> <div class="container" data-astro-cid-bic5s7gl> ${message && renderTemplate`<div${addAttribute(`msg ${message.startsWith("\u2705") ? "msg-ok" : "msg-err"}`, "class")} data-astro-cid-bic5s7gl>${message}</div>`} <div class="grid" data-astro-cid-bic5s7gl> ${allGyms.map((gym) => {
    const imgs = imageMap.get(gym.id) || [];
    return renderTemplate`<div class="card" data-astro-cid-bic5s7gl> <h3 data-astro-cid-bic5s7gl>${gym.name} <span class="count" data-astro-cid-bic5s7gl>(${imgs.length} imgs)</span></h3> <div class="imgs" data-astro-cid-bic5s7gl> ${imgs.map((img) => renderTemplate`<div class="thumb" data-astro-cid-bic5s7gl> <img${addAttribute(img.imageUrl, "src")} alt="" loading="lazy" data-astro-cid-bic5s7gl> <a${addAttribute(`?delete=${img.id}`, "href")} class="del" title="Eliminar" onclick="return confirm('¿Eliminar esta imagen?')" data-astro-cid-bic5s7gl>×</a> </div>`)} ${imgs.length === 0 && renderTemplate`<span style="font-size:12px;color:#aaa;padding:20px 0;" data-astro-cid-bic5s7gl>Sin imágenes</span>`} </div> <form method="POST" enctype="multipart/form-data" data-astro-cid-bic5s7gl> <input type="hidden" name="gym_id"${addAttribute(gym.id, "value")} data-astro-cid-bic5s7gl> <input type="file" name="image" accept="image/*" required data-astro-cid-bic5s7gl> <button type="submit" class="btn" data-astro-cid-bic5s7gl>+ Añadir</button> </form> </div>`;
  })} </div> </div> </body></html>`;
}, "/Users/dgtovar/Projects/gymcat/src/pages/admin/upload.astro", void 0);

const $$file = "/Users/dgtovar/Projects/gymcat/src/pages/admin/upload.astro";
const $$url = "/admin/upload";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Upload,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
