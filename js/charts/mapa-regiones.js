import { color, alfa, fmt } from '../theme.js';
import { montarSvg, conTooltip } from './_mapa-util.js';

/**
 * CAPÍTULO VIII — Mapa con estadísticas por región.
 * Dos formas de representar el dato:
 *   - "colores": coropleta (cuanto más oscura la región, mayor la cifra)
 *   - "circulos": símbolos proporcionales (un círculo por región, área ∝ cifra)
 * Los valores vienen de data/mapa-regiones.json.
 */
const SVG_NS = 'http://www.w3.org/2000/svg';
const RADIO_MAX = 46;   // radio del círculo de la región con la cifra más alta

export default {
  id: 'mapa-regiones',
  capitulo: 'VIII',
  titulo: 'De cómo se reparte el reino',
  descripcion: 'Las cifras de la crónica, región por región.',
  relato: 'Vistas sobre el mapa, las cuentas del reino cuentan lo mismo que los capítulos anteriores: ' +
          'la tierra se concentra en el norte y en la costa, donde mandan las casas, y los robos ' +
          'se acumulan en el sur, donde vive la gente que menos tiene.',
  nota: 'Borrador: cifras provisionales por región; el mapa se sustituirá por el dibujo definitivo.',
  datos: 'data/mapa-regiones.json',

  controles: [
    {
      id: 'medida',
      etiqueta: 'Dato',
      valor: 'tierra',
      opciones: [
        { valor: 'tierra', texto: 'Tierra de nobles' },
        { valor: 'robos', texto: 'Robos' },
        { valor: 'habitantes', texto: 'Habitantes' }
      ]
    },
    {
      id: 'forma',
      etiqueta: 'Forma',
      valor: 'colores',
      opciones: [
        { valor: 'colores', texto: 'Colores' },
        { valor: 'circulos', texto: 'Círculos' }
      ]
    }
  ],

  async render(contenedor, datos, estado) {
    const svg = await montarSvg(contenedor, datos.mapa);
    const medida = datos.medidas[estado.medida];
    const valores = medida.valores;
    const max = Math.max(...Object.values(valores), 1);
    const circulos = estado.forma === 'circulos';
    const tono = estado.medida === 'robos' ? color(0) : estado.medida === 'habitantes' ? color(3) : color(5);
    const formato = (v) => `${fmt.num.format(v)} ${medida.unidad}`;

    const regiones = [...svg.querySelectorAll('#regiones path')];
    const capa = svg.querySelector('#simbolos');
    capa.replaceChildren();

    regiones.forEach((p, i) => {
      const clave = p.id.replace('region-', '');
      const v = valores[clave] ?? 0;

      // --- coropleta: color según la cifra; en modo círculos, fondo neutro ---
      p.style.transition = 'fill .7s ease';
      p.style.fill = circulos ? alfa(color(i + 1), 0.12) : alfa(tono, 0.08 + 0.82 * (v / max));

      if (!p.dataset.listo) {
        p.dataset.listo = '1';
        conTooltip(contenedor, p, () => {
          const m = datos.medidas[estado.medida];
          return `<strong>${p.dataset.nombre || clave}</strong><br>${m.titulo}: ${fmt.num.format(m.valores[clave] ?? 0)} ${m.unidad}`;
        });
      }

      // --- símbolos proporcionales: un círculo en el centro de cada región ---
      if (circulos) {
        const b = p.getBBox();
        const r = Math.sqrt(v / max) * RADIO_MAX;   // área proporcional al valor
        const g = document.createElementNS(SVG_NS, 'g');
        g.setAttribute('class', 'simbolo');
        g.setAttribute('transform', `translate(${b.x + b.width / 2} ${b.y + b.height / 2})`);
        g.style.animationDelay = `${i * 90}ms`;

        const c = document.createElementNS(SVG_NS, 'circle');
        c.setAttribute('r', r);
        c.setAttribute('fill', alfa(tono, 0.7));
        c.setAttribute('stroke', tono);
        c.setAttribute('stroke-width', 1.5);

        const t = document.createElementNS(SVG_NS, 'text');
        t.setAttribute('y', 5);
        t.setAttribute('text-anchor', 'middle');
        t.setAttribute('font-size', 13);
        t.setAttribute('font-weight', 'bold');
        t.setAttribute('fill', '#f3e9d2');
        t.setAttribute('paint-order', 'stroke');
        t.setAttribute('stroke', tono);
        t.setAttribute('stroke-width', 3);
        t.textContent = fmt.num.format(v);

        g.append(c, t);
        conTooltip(contenedor, g, `<strong>${p.dataset.nombre || clave}</strong><br>${medida.titulo}: ${formato(v)}`);
        capa.appendChild(g);
      }
    });

    // --- escala (HTML, debajo del mapa) ---
    let escala = contenedor.querySelector('.mapa__escala');
    if (!escala) {
      escala = document.createElement('div');
      escala.className = 'mapa__escala';
      contenedor.querySelector('.mapa').appendChild(escala);
    }
    if (circulos) {
      const rMin = Math.sqrt(0.25) * RADIO_MAX;
      escala.innerHTML = `
        <span class="mapa__escala-titulo">${medida.titulo}</span>
        <svg width="${RADIO_MAX * 2 + 4}" height="${RADIO_MAX * 2 + 4}" viewBox="0 0 ${RADIO_MAX * 2 + 4} ${RADIO_MAX * 2 + 4}" style="max-height:60px">
          <circle cx="${RADIO_MAX + 2}" cy="${RADIO_MAX + 2}" r="${RADIO_MAX}" fill="${alfa(tono, .25)}" stroke="${tono}"/>
          <circle cx="${RADIO_MAX + 2}" cy="${RADIO_MAX * 2 + 2 - rMin}" r="${rMin}" fill="${alfa(tono, .45)}" stroke="${tono}"/>
        </svg>
        <span>círculo grande = ${formato(max)} · pequeño = ${formato(Math.round(max / 4))}</span>`;
    } else {
      escala.innerHTML = `
        <span class="mapa__escala-titulo">${medida.titulo}</span>
        <span>${formato(0)}</span>
        <span class="mapa__escala-barra" style="background: linear-gradient(to right, ${alfa(tono, 0.08)}, ${alfa(tono, 0.9)})"></span>
        <span>${formato(max)}</span>`;
    }
  }
};
