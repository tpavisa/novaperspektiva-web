# Web stranica Nova Perspektiva

Stranica se gradi iz predloška `src/page.html` i podataka u `src/_data/`.
Sadržaj uređujete kroz **Pages CMS** (pagescms.org), a **GitHub Pages** nakon svake
izmjene automatski objavi novu verziju (`.github/workflows/deploy.yml`).

## Što je gdje

| Datoteka / mapa | Što sadrži | Uređuje se u CMS-u |
|---|---|---|
| `src/_data/radovi/*.json` | Radovi (jedna datoteka po radu) | Radovi |
| `src/_data/preporuke.json` | Citati klijenata (prazno = odjeljak skriven) | Preporuke klijenata |
| `src/_data/klijenti.json` | Traka „Surađivali smo“ | Klijenti (traka) |
| `src/_data/postavke.json` | E-mail, telefon, showreel, fotografija, društvene mreže | Postavke stranice |
| `src/images/` | Slike koje uploadate kroz CMS | (automatski) |
| `src/page.html` | Dizajn i tekstovi odjeljaka (Usluge, Kako radimo…) | ne – mijenja se u kodu |
| `build.js` | Skripta koja spaja predložak i podatke | ne |
| `.pages.yml` | Postavke CMS-a (polja i obrasci) | ne |

## Slike za radove

Format 16:9, idealno 1280 × 720 px, JPG ili WebP, do ~300 KB.
Fotografija za „Kako radimo“: format 4:5, npr. 1000 × 1250 px.

## Lokalni pregled (nije obavezno)

Potreban je Node.js 20+: `npm run build`, zatim otvorite `_site/index.html`.
