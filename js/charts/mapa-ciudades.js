import { color, alfa, fmt } from '../theme.js';
import { montarSvg, conTooltip } from './mapa-util.js';

/**
 * CAPÍTULO I — Mapa de las ciudades de Cregon (símbolos proporcionales).
 * Un círculo por ciudad, con área proporcional al dato elegido. La leyenda
 * de colores permite ocultar ciudades. Datos y posiciones: data/mapa-ciudades.json.
 */
const SVG_NS = 'http://www.w3.org/2000/svg';
const RADIO_MAX = 52;   // radio del círculo de la ciudad con la cifra más alta
const RADIO_PUNTO = 6;  // radio del punto en el mapa de ubicación

export default {
  id: 'mapa-ciudades',
  capitulo: 'I',
  titulo: 'Del reino de Cregon y sus ciudades',
  descripcion: 'Dónde pasa la historia; y, eligiendo un dato, cuánta gente, cuánto oro y cuántos robos hay en cada ciudad.',
  relato: 'Cregon es un reino pequeño, encajado entre montañas. Al oeste, al otro lado de la frontera, ' +
          'está Dornhal, el reino que perdió la guerra de 1207 a 1210 y del que solo quedan ruinas: ' +
          'de allí vienen Aaron y su hermano Leo. El camino punteado es el que tomaron tras la guerra ' +
          'hasta Aldemar, la capital de Cregon, donde años después Aaron roba la daga en plena plaza. ' +
          'Cada casa noble tiene su ciudad: Caerlún es la fortaleza de ' +
          'Vareck, Ordane la de Vandel y Torvane la de Voss. Si eliges un dato arriba, cada ciudad se ' +
          'convierte en un círculo cuyo tamaño dice cuánto hay de eso; verás que la riqueza y los ' +
          'robos no viven en los mismos sitios.',
  nota: 'Carta de las ciudades del reino, año 1218. Las ocho ciudades suman los 34.500 habitantes, ' +
        'los 1.150 robos y las 2.200 mil monedas (1.200 de las casas y 1.000 del pueblo) de los capítulos siguientes.',
  datos: 'data/mapa-ciudades.json',

  controles: [
    {
      id: 'medida',
      etiqueta: 'Dato',
      valor: 'ubicacion',
      opciones: [
        { valor: 'ubicacion', texto: 'Ubicación' },
        { valor: 'habitantes', texto: 'Habitantes' },
        { valor: 'robos', texto: 'Robos' },
        { valor: 'riqueza', texto: 'Riqueza' }
      ]
    }
  ],

  // ciudades ocultas desde la leyenda (persisten al cambiar de dato)
  ocultas: new Set(),

  async render(contenedor, datos, estado) {
    const svg = await montarSvg(contenedor, datos.mapa);
    const ubicacion = estado.medida === 'ubicacion';
    const medida = ubicacion ? null : datos.medidas[estado.medida];
    const clave = ubicacion ? 'habitantes' : estado.medida;   // en ubicación solo se usa para ordenar
    const max = Math.max(...datos.ciudades.map(c => c[clave]), 1);
    const radio = (v) => (ubicacion ? RADIO_PUNTO : Math.sqrt(v / max) * RADIO_MAX);   // área ∝ valor
    const formato = (v) => `${fmt.num.format(v)} ${medida.unidad}`;

    // camino de Aaron: solo en el mapa de ubicación
    svg.querySelector('#ruta')?.classList.toggle('is-visible', ubicacion);

    // --- círculos --------------------------------------------------------
    const capa = svg.querySelector('#ciudades');
    const previos = new Map([...capa.querySelectorAll('.ciudad')].map(g => [g.dataset.nombre, g]));

    // de mayor a menor para que los pequeños queden encima
    [...datos.ciudades].sort((a, b) => b[clave] - a[clave]).forEach((c, i) => {
      const idx = datos.ciudades.indexOf(c);
      const tono = color(idx);
      let g = previos.get(c.nombre);

      if (!g) {
        g = document.createElementNS(SVG_NS, 'g');
        g.setAttribute('class', 'ciudad');
        g.dataset.nombre = c.nombre;
        g.setAttribute('transform', `translate(${c.x} ${c.y})`);
        g.style.animationDelay = `${i * 80}ms`;

        const circulo = document.createElementNS(SVG_NS, 'circle');
        circulo.setAttribute('r', 0);
        circulo.setAttribute('fill', alfa(tono, 0.78));
        circulo.setAttribute('stroke', '#2b1d0e');
        circulo.setAttribute('stroke-width', 1.2);

        const punto = document.createElementNS(SVG_NS, 'circle');
        punto.setAttribute('r', 2.5);
        punto.setAttribute('fill', '#2b1d0e');

        const texto = document.createElementNS(SVG_NS, 'text');
        texto.setAttribute('class', 'ciudad__nombre');
        texto.setAttribute('font-size', 15);
        texto.setAttribute('fill', '#2b1d0e');
        texto.setAttribute('paint-order', 'stroke');
        texto.setAttribute('stroke', '#f3e9d2');
        texto.setAttribute('stroke-width', 4);
        texto.setAttribute('stroke-linejoin', 'round');
        texto.textContent = c.nombre;

        g.append(circulo, punto, texto);
        conTooltip(contenedor, g, () => {
          if (estado.medida === 'ubicacion') return `<strong>${c.nombre}</strong><br><em>${c.nota}</em>`;
          const m = datos.medidas[estado.medida];
          return `<strong>${c.nombre}</strong><br>${m.titulo}: ${fmt.num.format(c[estado.medida])} ${m.unidad}<br><em>${c.nota}</em>`;
        });
      }

      const r = radio(c[clave]);
      const circulo = g.querySelector('circle');
      circulo.style.transition = 'r .8s cubic-bezier(.3,1.2,.5,1)';
      circulo.setAttribute('r', r);

      // nombre a la derecha del círculo (o encima si es muy grande)
      const texto = g.querySelector('.ciudad__nombre');
      texto.setAttribute('x', r + 6);
      texto.setAttribute('y', 5);

      // en ubicación se ven todas las ciudades (la leyenda no aplica)
      g.classList.toggle('is-off', !ubicacion && this.ocultas.has(c.nombre));
      g.classList.toggle('ciudad--punto', ubicacion);
      capa.appendChild(g);   // reordena por tamaño
    });

    // --- leyenda de ciudades (como en Datawrapper: color + nombre) ----------
    const wrap = contenedor.querySelector('.mapa');
    let leyenda = wrap.querySelector('.legend');
    if (!leyenda) {
      leyenda = document.createElement('div');
      leyenda.className = 'legend';
      datos.ciudades.forEach((c, idx) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'legend__item';
        b.innerHTML = `<span class="legend__swatch" style="background:${alfa(color(idx), 0.85)}"></span><span>${c.nombre}</span>`;
        b.addEventListener('click', () => {
          if (this.ocultas.has(c.nombre)) this.ocultas.delete(c.nombre); else this.ocultas.add(c.nombre);
          b.classList.toggle('is-off');
          capa.querySelector(`.ciudad[data-nombre="${c.nombre}"]`)?.classList.toggle('is-off');
        });
        leyenda.appendChild(b);
      });
      wrap.appendChild(leyenda);
    }
    leyenda.hidden = ubicacion;

    // --- escala de tamaños --------------------------------------------------
    let escala = wrap.querySelector('.mapa__escala');
    if (!escala) {
      escala = document.createElement('div');
      escala.className = 'mapa__escala';
      wrap.appendChild(escala);
    }
    escala.hidden = ubicacion;
    if (ubicacion) return;

    const rMedio = radio(max / 4);
    const alto = RADIO_MAX * 2 + 4;
    escala.innerHTML = `
      <span class="mapa__escala-titulo">${medida.titulo}</span>
      <svg width="${alto}" height="${alto}" viewBox="0 0 ${alto} ${alto}">
        <circle cx="${RADIO_MAX + 2}" cy="${RADIO_MAX + 2}" r="${RADIO_MAX}" fill="none" stroke="#2b1d0e"/>
        <circle cx="${RADIO_MAX + 2}" cy="${alto - 2 - rMedio}" r="${rMedio}" fill="none" stroke="#2b1d0e"/>
      </svg>
      <span>círculo grande = ${formato(max)} &nbsp;·&nbsp; pequeño = ${formato(Math.round(max / 4))}</span>`;
  }
};
