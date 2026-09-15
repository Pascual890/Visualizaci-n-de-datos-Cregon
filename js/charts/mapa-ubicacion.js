import { color, alfa } from '../theme.js';
import { montarSvg, conTooltip } from './_mapa-util.js';

/**
 * CAPÍTULO I — Mapa de ubicación de Cregon.
 * Marcadores sobre el mapa dibujado; se filtran por tipo desde los controles.
 * El SVG y los lugares vienen de data/mapa-lugares.json.
 */
const SVG_NS = 'http://www.w3.org/2000/svg';

export default {
  id: 'mapa-ubicacion',
  capitulo: 'I',
  titulo: 'Del reino de Cregon',
  descripcion: 'Dónde pasa la historia: el reino vencido, las tierras de las tres casas y los lugares del cuento.',
  relato: 'A un lado está el reino que perdió la guerra; al otro, Cregon. Las tres casas que quedan ' +
          'se reparten el reino: Vareck las tierras altas, Vandel el valle y Voss la costa, y en cada ' +
          'una de esas tierras vive gente que trabaja para la casa que la gobierna. En el sur están ' +
          'las aldeas, de donde viene la mayoría de la gente común. La plaza donde los hermanos ' +
          'roban la daga está en el cruce de caminos entre las tres casas.',
  nota: 'Borrador: el mapa y los nombres de los lugares se sustituirán por los definitivos.',
  datos: 'data/mapa-lugares.json',

  controles: [
    {
      id: 'ver',
      etiqueta: 'Mostrar',
      valor: 'todos',
      opciones: [
        { valor: 'todos', texto: 'Todo' },
        { valor: 'historia', texto: 'Lugares del cuento' },
        { valor: 'casa', texto: 'Casas nobles' }
      ]
    }
  ],

  async render(contenedor, datos, estado) {
    const svg = await montarSvg(contenedor, datos.mapa);

    // regiones en tono neutro, con nombre al pasar el ratón
    const vencido = svg.querySelector('#region-vencido');
    if (vencido && !vencido.dataset.listo) {
      vencido.dataset.listo = '1';
      conTooltip(contenedor, vencido, `<strong>${vencido.dataset.nombre}</strong><br>Derrotado en la guerra de 1207–1210.`);
    }

    svg.querySelectorAll('#regiones path').forEach((p, i) => {
      if (p.dataset.listo) return;
      p.dataset.listo = '1';
      p.style.fill = alfa(color(i + 1), 0.22);
      conTooltip(contenedor, p, `<strong>${p.dataset.nombre || p.id}</strong>`);
    });

    // marcadores
    const capa = svg.querySelector('#marcadores');
    capa.replaceChildren();

    const visibles = datos.lugares.filter(l => estado.ver === 'todos' || l.tipo === estado.ver);
    visibles.forEach((l, i) => {
      const g = document.createElementNS(SVG_NS, 'g');
      g.setAttribute('class', 'marcador');
      g.setAttribute('transform', `translate(${l.x} ${l.y})`);
      g.style.animationDelay = `${i * 120}ms`;

      const tono = l.tipo === 'casa' ? color(0) : color(1);

      const halo = document.createElementNS(SVG_NS, 'circle');
      halo.setAttribute('r', 13);
      halo.setAttribute('fill', alfa(tono, 0.25));

      const punto = document.createElementNS(SVG_NS, 'circle');
      punto.setAttribute('r', 6);
      punto.setAttribute('fill', tono);
      punto.setAttribute('stroke', '#f3e9d2');
      punto.setAttribute('stroke-width', 2);

      const texto = document.createElementNS(SVG_NS, 'text');
      texto.setAttribute('x', 12);
      texto.setAttribute('y', 5);
      texto.setAttribute('font-size', 13);
      texto.setAttribute('fill', '#2b1d0e');
      texto.setAttribute('paint-order', 'stroke');
      texto.setAttribute('stroke', '#f3e9d2');
      texto.setAttribute('stroke-width', 3);
      texto.textContent = l.nombre;

      g.append(halo, punto, texto);
      conTooltip(contenedor, g, `<strong>${l.nombre}</strong><br>${l.texto}`);
      capa.appendChild(g);
    });
  }
};
