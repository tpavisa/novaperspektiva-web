// Gradi web stranicu: src/page.html + podaci iz src/_data  ->  _site/
// Pokreće se naredbom "node build.js" (GitHub Actions to radi automatski pri svakoj izmjeni). Nema vanjskih paketa.
import fs from "node:fs";
import path from "node:path";

const SRC = "src";
const OUT = "_site";
// Ako stranica nije u korijenu domene (npr. korisnik.github.io/novaperspektiva-web), BASE_PATH je taj prefiks.
const BASE = (process.env.BASE_PATH || "").replace(/\/+$/, "");

const readJson = (file, fallback) => {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch (e) {
    if (e.code === "ENOENT") return fallback;
    throw new Error(`Neispravan JSON u ${file}: ${e.message}`);
  }
};
const esc = (v) => String(v ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const digits = (s) => String(s || "").replace(/[^\d+]/g, "");

// ---- podaci ----
const postavke = readJson(`${SRC}/_data/postavke.json`, {});
const klijenti = readJson(`${SRC}/_data/klijenti.json`, []);
const preporuke = readJson(`${SRC}/_data/preporuke.json`, []);
const radDir = `${SRC}/_data/radovi`;
const radovi = (fs.existsSync(radDir) ? fs.readdirSync(radDir) : [])
  .filter((f) => f.endsWith(".json"))
  .map((f) => readJson(path.join(radDir, f), null))
  .filter((r) => r && r.naslov && r.objavljeno !== false)
  .sort((a, b) => (Number(a.redoslijed) || 0) - (Number(b.redoslijed) || 0) || a.naslov.localeCompare(b.naslov, "hr"));

const BOJE_KATEGORIJA = { kultura: "#53B1FB", poslovni: "#FCB355", autorski: "#8A56C2" };
const BOJE_NAVODNIKA = { plava: "#53B1FB", narancasta: "#FCB355", koraljna: "#FA6664", ljubicasta: "#8A56C2", tirkizna: "#2EF1E9" };
const PLAY_SMALL = '<svg width="14" height="14" viewBox="0 0 24 24" fill="#F4F2EE" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>';
const CORNERS = '<span class="vf s tl"></span><span class="vf s tr"></span><span class="vf s bl"></span><span class="vf s br"></span>';
const QUOTE_PATH = "M0 26V15C0 6.5 4.5 1.5 13 0l1.5 4C9.5 5.5 7.5 8.5 7.3 12H13v14zm19 0V15C19 6.5 23.5 1.5 32 0l1.5 4c-5 1.5-7 4.5-7.2 8H32v14z";

// ---- dijelovi stranice ----
const parts = {};

parts.KLIJENTI = klijenti.filter((k) => k && k.naziv)
  .map((k) => `    <b>${esc(k.naziv)}</b>`).join("\n");

parts.RADOVI = radovi.map((w) => {
  const tag = w.link ? "a" : "div";
  const linkAttrs = w.link ? ` href="${esc(w.link)}" target="_blank" rel="noopener"` : "";
  const thumb = w.slika
    ? `<img src="${esc(w.slika)}" alt="${esc(w.naslov)}" loading="lazy" width="1280" height="720">`
    : `<span class="ph">[KADAR IZ VIDEA]</span>`;
  const oznaka = w.oznaka
    ? `\n      <div class="tag"><span class="dot sm" style="background:${BOJE_KATEGORIJA[w.kategorija] || "#B9B5AD"}"></span>${esc(w.oznaka)}</div>`
    : "";
  return `    <${tag} class="card" data-cat="${esc(w.kategorija || "")}"${linkAttrs}>
      <div class="thumb">${thumb}<span class="corners">${CORNERS}</span>${w.link ? `<span class="mini">${PLAY_SMALL}</span>` : ""}</div>${oznaka}
      <div><h3>${esc(w.naslov)}</h3>${w.opis ? `<p>${esc(w.opis)}</p>` : ""}</div>
    </${tag}>`;
}).join("\n");

const VIDEO_TYPES = { mp4: "video/mp4", m4v: "video/mp4", webm: "video/webm", mov: "video/quicktime" };
const video = (postavke.pozadinski_video || "").trim();
const poster = (postavke.pozadinski_video_poster || "").trim();
if (video) {
  const ext = video.split("?")[0].split(".").pop().toLowerCase();
  parts.HERO_MEDIA = `  <video class="hero-media" id="heroVideo" autoplay muted loop playsinline preload="auto"${poster ? ` poster="${esc(poster)}"` : ""} aria-hidden="true">
    <source src="${esc(video)}" type="${VIDEO_TYPES[ext] || "video/mp4"}">
  </video>`;
  parts.HERO_TOGGLE = `  <button class="hero-toggle" id="heroToggle" type="button" aria-pressed="false" aria-label="Pauziraj pozadinski video">
    <svg class="i-pause" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>
    <svg class="i-play" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>
  </button>`;
} else {
  parts.HERO_MEDIA = poster ? `  <img class="hero-media" src="${esc(poster)}" alt="">` : "";
  parts.HERO_TOGGLE = "";
}

parts.FOTOGRAFIJA = postavke.fotografija
  ? `      <div class="img"><img src="${esc(postavke.fotografija)}" alt="Tomislav Paviša na snimanju" loading="lazy"></div>`
  : `      <div class="img">[FOTOGRAFIJA SA SNIMANJA]</div>`;

const prep = preporuke.filter((p) => p && p.citat);
parts.PREPORUKE = prep.length ? `<section id="preporuke" class="wrap block" style="padding-top:40px">
  <div class="head">
    <div class="eyebrow">Preporuke</div>
    <h2>Što kažu klijenti</h2>
  </div>
  <div class="quotes">
${prep.map((p) => `    <figure class="quote vf-box">
      ${CORNERS}
      <div>
        <svg width="34" height="26" viewBox="0 0 34 26" aria-hidden="true"><path d="${QUOTE_PATH}" fill="${BOJE_NAVODNIKA[p.boja] || BOJE_NAVODNIKA.plava}"/></svg>
        <blockquote>${esc(p.citat)}</blockquote>
      </div>
      <figcaption><b>${esc(p.ime)}</b>${p.funkcija ? `<span>${esc(p.funkcija)}</span>` : ""}</figcaption>
    </figure>`).join("\n")}
  </div>
</section>` : "";

const tel = digits(postavke.telefon);
parts.KONTAKT = [
  postavke.email && `        <a class="btn solid" href="mailto:${esc(postavke.email)}">${esc(postavke.email)}</a>`,
  tel && `        <a class="btn ghost" href="https://wa.me/${tel.replace("+", "")}" target="_blank" rel="noopener">WhatsApp</a>`,
  tel && `        <a class="btn ghost" href="tel:${tel}">${esc(postavke.telefon)}</a>`,
].filter(Boolean).join("\n");

parts.DRUSTVENE = [["instagram", "Instagram"], ["youtube", "YouTube"], ["linkedin", "LinkedIn"]]
  .filter(([k]) => postavke[k])
  .map(([k, label]) => `      <a href="${esc(postavke[k])}" target="_blank" rel="noopener">${label}</a>`).join("\n");

parts.GODINA = String(new Date().getFullYear());

// ---- sastavljanje ----
let html = fs.readFileSync(`${SRC}/page.html`, "utf8");
for (const [key, value] of Object.entries(parts)) {
  html = html.split(`<!--${key}-->`).join(value);
}
if (BASE) html = html.replace(/(\s(?:src|href|poster)=")\/(?!\/)/g, `$1${BASE}/`);

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(`${OUT}/index.html`, html);
fs.copyFileSync(`${SRC}/logo.svg`, `${OUT}/logo.svg`);
if (fs.existsSync(`${SRC}/images`)) fs.cpSync(`${SRC}/images`, `${OUT}/images`, { recursive: true });

console.log(`Gotovo: ${radovi.length} radova, ${prep.length} preporuka -> ${OUT}/index.html`);
