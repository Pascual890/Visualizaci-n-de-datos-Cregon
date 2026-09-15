/**
 * Motor de tarjetas de gráfico.
 *
 * Cada gráfico es un módulo que exporta un objeto "definición":
 *
 *   export default {
 *     id: 'mi-grafico',
 *     titulo: 'Título',
 *     descripcion: 'Texto explicativo',
 *     nota: 'Fuente / aclaración',            // opcional
 *     datos: 'data/mi-grafico.json',          // opcional (fetch automático)
 *     leyenda: true,                          // leyenda HTML interactiva
 *     controles: [                            // opcional
 *       { id: 'vista', etiqueta: 'Vista', valor: 'abs',
 *         opciones: [{ valor: 'abs', texto: 'Absoluto' }, { valor: 'pct', texto: '%' }] }
 *     ],
 *     config(datos, estado) { return { type, data, options }; }
 *   }
 *
 * Para contenido que no es un chart de Chart.js (por ejemplo un mapa), en vez
 * de config() se define render(contenedor, datos, estado): base.js le pasa el
 * <div class="chart-box"> vacío y vuelve a llamarlo cada vez que cambia un
 * control. Ver js/charts/mapa-ubicacion.js y mapa-regiones.js.
 *
 * base.js se encarga de: maquetar la tarjeta, cargar los datos, crear el chart
 * cuando entra en pantalla (animación de entrada), reaccionar a los controles,
 * dibujar la leyenda interactiva y exportar a PNG.
 */

const Chart = window.Chart;

/* --------------------------------------------------------------
   Utilidades DOM
   -------------------------------------------------------------- */
function el(tag, clase, texto) {
  const n = document.createElement(tag);
  if (clase) n.className = clase;
  if (texto != null) n.textContent = texto;
  return n;
}

/* --------------------------------------------------------------
   Tarjeta
   -------------------------------------------------------------- */
export function crearTarjeta(def) {
  const seccion = el('section', 'card');
  seccion.id = def.id;

  // --- cabecera del capítulo -----------------------------------
  const head = el('header', 'card__head');
  if (def.capitulo) head.appendChild(el('p', 'card__chapter', `Capítulo ${def.capitulo}`));
  head.appendChild(el('h2', 'card__title', def.titulo));
  if (def.descripcion) head.appendChild(el('p', 'card__desc', def.descripcion));
  seccion.appendChild(head);

  // --- relato (texto de la crónica; admite HTML sencillo) --------
  if (def.relato) {
    const relato = el('div', 'card__story');
    const p = el('p');
    p.innerHTML = def.relato;
    relato.appendChild(p);
    seccion.appendChild(relato);
  }

  // --- controles -------------------------------------------------
  const controles = el('div', 'controls');
  seccion.appendChild(controles);

  // --- lienzo ---------------------------------------------------
  const esMapa = typeof def.render === 'function';
  const caja = el('div', esMapa ? 'chart-box chart-box--mapa' : 'chart-box');
  const canvas = esMapa ? null : el('canvas');
  if (canvas) {
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', def.titulo);
    caja.appendChild(canvas);
  }
  seccion.appendChild(caja);

  // --- leyenda y nota ------------------------------------------
  const leyenda = el('div', 'legend');
  if (def.leyenda !== false && !esMapa) seccion.appendChild(leyenda);
  if (def.nota) seccion.appendChild(el('p', 'card__note', def.nota));

  // --- estado de los controles ---------------------------------
  const estado = {};
  (def.controles || []).forEach(c => { estado[c.id] = c.valor ?? c.opciones[0].valor; });

  let chart = null;
  let datos = null;

  /**
   * Crea o actualiza el chart con el estado actual.
   * Si solo cambian los datos/opciones se actualiza en caliente (transición
   * suave); si cambia el tipo de gráfico hay que recrearlo. Importante: tras
   * crearlo NO se llama a update(), o la animación de entrada se queda a medias.
   */
  function pintar() {
    // Los controles pueden pulsarse antes de que lleguen los datos: en ese caso
    // solo se guarda el estado y se pintará al terminar la carga.
    if (def.datos && datos === null) return;

    if (esMapa) {
      def.render(caja, datos, estado);
      return;
    }

    const cfg = def.config(datos, estado);

    if (chart && chart.config.type === cfg.type) {
      chart.data = cfg.data;
      chart.options = cfg.options ?? {};
      chart.update();
    } else {
      if (chart) chart.destroy();
      chart = new Chart(canvas.getContext('2d'), cfg);
    }
    if (def.leyenda !== false) pintarLeyenda(chart, leyenda);
  }

  /** Controles (botones segmentados). */
  (def.controles || []).forEach(c => {
    const wrap = el('div', 'control');
    if (c.etiqueta) wrap.appendChild(el('span', 'control__label', c.etiqueta));
    const grupo = el('div', 'segmented');

    c.opciones.forEach(op => {
      const b = el('button', null, op.texto);
      b.type = 'button';
      if (estado[c.id] === op.valor) b.classList.add('is-active');
      b.addEventListener('click', () => {
        if (estado[c.id] === op.valor) return;
        if (def.datos && datos === null) return;   // aún cargando
        estado[c.id] = op.valor;
        grupo.querySelectorAll('button').forEach(x => x.classList.remove('is-active'));
        b.classList.add('is-active');
        pintar();
      });
      grupo.appendChild(b);
    });

    wrap.appendChild(grupo);
    controles.appendChild(wrap);
  });

  // Botón de descarga
  const btnPng = el('button', 'btn-icon', '✧ Guardar lámina');
  btnPng.type = 'button';
  btnPng.title = 'Descargar el gráfico como imagen PNG';
  btnPng.addEventListener('click', () => {
    if (!chart) return;
    const a = document.createElement('a');
    a.href = chart.toBase64Image('image/png', 1);
    a.download = `${def.id}.png`;
    a.click();
  });
  if (!esMapa) controles.appendChild(btnPng);

  /** Carga de datos + primera pintura cuando la tarjeta entra en pantalla. */
  async function iniciar() {
    const botones = () => controles.querySelectorAll('button');
    botones().forEach(b => { b.disabled = true; });
    try {
      if (def.datos) {
        const resp = await fetch(def.datos);
        if (!resp.ok) throw new Error(`HTTP ${resp.status} al pedir ${def.datos}`);
        datos = await resp.json();
      }
      pintar();
      botones().forEach(b => { b.disabled = false; });
    } catch (err) {
      console.error(`[${def.id}]`, err);
      caja.replaceChildren(
        el('div', 'error', `No se pudieron cargar los datos de "${def.id}". ` +
          'Comprueba la ruta del JSON y que el proyecto se sirva desde un servidor local.')
      );
    }
  }

  observarEntrada(seccion, iniciar);
  return seccion;
}

/* --------------------------------------------------------------
   Leyenda HTML interactiva (click = mostrar/ocultar serie)
   -------------------------------------------------------------- */
function pintarLeyenda(chart, contenedor) {
  contenedor.replaceChildren();
  const items = chart.options.plugins?.legend?.labels?.generateLabels
    ? chart.options.plugins.legend.labels.generateLabels(chart)
    : Chart.defaults.plugins.legend.labels.generateLabels(chart);

  items.forEach(item => {
    const b = el('button', 'legend__item');
    b.type = 'button';
    if (item.hidden) b.classList.add('is-off');

    const sw = el('span', 'legend__swatch');
    sw.style.background = item.fillStyle || item.strokeStyle;
    b.appendChild(sw);
    b.appendChild(el('span', null, item.text));

    b.addEventListener('click', () => {
      // datasetIndex para gráficos multi-serie, index para pie/doughnut
      if (item.datasetIndex != null && chart.data.datasets.length > 1) {
        chart.setDatasetVisibility(item.datasetIndex, !chart.isDatasetVisible(item.datasetIndex));
      } else if (item.index != null) {
        chart.toggleDataVisibility(item.index);
      } else {
        chart.setDatasetVisibility(0, !chart.isDatasetVisible(0));
      }
      b.classList.toggle('is-off');
      chart.update();
    });

    contenedor.appendChild(b);
  });
}

/* --------------------------------------------------------------
   Animación de entrada: la tarjeta aparece y el chart se dibuja
   solo cuando es visible (una única vez).

   Se usa IntersectionObserver, con una comprobación manual de respaldo
   (scroll/resize/load) porque el navegador puede no entregar entradas del
   observador si la pestaña está en segundo plano: sin ese respaldo la página
   se quedaría en blanco.
   -------------------------------------------------------------- */
function observarEntrada(nodo, alEntrar) {
  let hecho = false;

  const activar = () => {
    if (hecho) return;
    hecho = true;
    quitarRespaldo();
    if (io) io.disconnect();
    nodo.classList.add('is-visible');
    alEntrar();
  };

  const enPantalla = () => {
    const r = nodo.getBoundingClientRect();
    const alto = window.innerHeight || document.documentElement.clientHeight;
    return r.top < alto * 0.92 && r.bottom > 0;
  };

  let pendiente = false;
  const comprobar = () => {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(() => {
      pendiente = false;
      if (enPantalla()) activar();
    });
  };

  const quitarRespaldo = () => {
    window.removeEventListener('scroll', comprobar);
    window.removeEventListener('resize', comprobar);
    window.removeEventListener('load', comprobar);
  };

  window.addEventListener('scroll', comprobar, { passive: true });
  window.addEventListener('resize', comprobar);
  window.addEventListener('load', comprobar);

  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver((entradas) => {
        if (entradas.some(e => e.isIntersecting)) activar();
      }, { threshold: 0.05, rootMargin: '80px 0px' })
    : null;

  if (io) io.observe(nodo);
  comprobar();
}
