/**
 * Utilidades compartidas por los mapas (js/charts/mapa-*.js).
 */

const cacheSvg = new Map();

/** Inserta el SVG del mapa en línea dentro del contenedor (una sola vez) y lo devuelve. */
export async function montarSvg(contenedor, url) {
  let svg = contenedor.querySelector('svg');
  if (svg) return svg;

  if (!cacheSvg.has(url)) cacheSvg.set(url, fetch(url).then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status} al pedir ${url}`);
    return r.text();
  }));
  const texto = await cacheSvg.get(url);

  const wrap = document.createElement('div');
  wrap.className = 'mapa';
  wrap.innerHTML = texto;
  contenedor.replaceChildren(wrap);

  // tooltip HTML flotante
  const tip = document.createElement('div');
  tip.className = 'mapa__tip';
  tip.hidden = true;
  wrap.appendChild(tip);

  return wrap.querySelector('svg');
}

/** Muestra un tooltip junto al cursor con el HTML indicado. */
export function tooltip(contenedor, evento, html) {
  const tip = contenedor.querySelector('.mapa__tip');
  if (!tip) return;
  if (!html) { tip.hidden = true; return; }
  const r = contenedor.getBoundingClientRect();
  tip.innerHTML = html;
  tip.hidden = false;
  let x = evento.clientX - r.left + 14;
  let y = evento.clientY - r.top + 14;
  if (x + tip.offsetWidth > r.width - 8) x = evento.clientX - r.left - tip.offsetWidth - 14;
  if (y + tip.offsetHeight > r.height - 8) y = evento.clientY - r.top - tip.offsetHeight - 14;
  tip.style.transform = `translate(${x}px, ${y}px)`;
}

/** Engancha mostrar/ocultar tooltip a un elemento SVG. */
export function conTooltip(contenedor, el, html) {
  el.addEventListener('mousemove', (e) => tooltip(contenedor, e, typeof html === 'function' ? html() : html));
  el.addEventListener('mouseleave', () => tooltip(contenedor, null, null));
}
