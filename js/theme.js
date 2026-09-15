/**
 * Tema global de la crónica: paleta "tinta sobre pergamino",
 * ajustes por defecto de Chart.js y el plugin que sombrea los años de guerra.
 */

/* Tintas del escriba: ocre, sangre, verde bosque, azul de lapislázuli, púrpura, tierra */
export const PALETA = [
  '#8a2f1f',   // rojo sangre / óxido
  '#b8862b',   // oro viejo
  '#3f5a3a',   // verde bosque
  '#2f4a6d',   // azul lapislázuli
  '#5e3a5c',   // púrpura de tiro
  '#6b4a2b',   // tierra / cuero
  '#4c6e73',   // verdigrís
  '#a0522d'    // siena
];

export const COLORES = {
  tinta:       '#2b1d0e',
  tintaTenue:  '#6e5a45',
  grid:        'rgba(43, 29, 14, .12)',
  eje:         'rgba(43, 29, 14, .45)',
  pergamino:   '#f1e6cf',
  fondoTip:    '#fbf5e6',
  borde:       '#8a6f4e',
  guerra:      'rgba(138, 47, 31, .10)'
};

/** Devuelve un color de la paleta, ciclando si hay más series que colores. */
export const color = (i) => PALETA[i % PALETA.length];

/** Versión translúcida de un color hex (#rrggbb). */
export function alfa(hex, a = 0.2) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

/** Años de la guerra que marcan la historia. */
export const GUERRA = { inicio: 1207, fin: 1210, texto: 'La guerra' };

/**
 * Plugin: sombrea la franja de los años de guerra en gráficos con eje X de años.
 * Se activa por gráfico con  plugins: { bandaGuerra: { activo: true } }.
 */
export const bandaGuerra = {
  id: 'bandaGuerra',
  beforeDatasetsDraw(chart, _args, opts) {
    if (!opts?.activo) return;
    const { ctx, chartArea, scales } = chart;
    const x = scales.x;
    if (!x) return;

    const labels = chart.data.labels.map(Number);
    const i0 = labels.indexOf(GUERRA.inicio);
    const i1 = labels.indexOf(GUERRA.fin);
    if (i0 < 0 || i1 < 0) return;

    const x0 = x.getPixelForValue(i0);
    const x1 = x.getPixelForValue(i1);

    ctx.save();
    ctx.fillStyle = COLORES.guerra;
    ctx.fillRect(x0, chartArea.top, x1 - x0, chartArea.bottom - chartArea.top);

    // bordes punteados
    ctx.strokeStyle = alfa(PALETA[0], 0.5);
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    [x0, x1].forEach(px => {
      ctx.beginPath();
      ctx.moveTo(px, chartArea.top);
      ctx.lineTo(px, chartArea.bottom);
      ctx.stroke();
    });

    // rótulo
    ctx.setLineDash([]);
    ctx.fillStyle = PALETA[0];
    ctx.font = `italic 13px 'IM Fell English', Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(GUERRA.texto, (x0 + x1) / 2, chartArea.top + 6);
    ctx.restore();
  }
};


/**
 * Plugin: escribe el valor encima (o al final) de cada barra.
 * Se activa con  plugins: { valoresBarras: { activo: true, formato: fn } }.
 */
export const valoresBarras = {
  id: 'valoresBarras',
  afterDatasetsDraw(chart, _args, opts) {
    if (!opts?.activo) return;
    const { ctx } = chart;
    const horizontal = chart.options.indexAxis === 'y';
    const formato = opts.formato || (v => String(v));

    ctx.save();
    ctx.font = `600 12px 'Cinzel', Georgia, serif`;
    ctx.fillStyle = COLORES.tinta;

    chart.data.datasets.forEach((ds, di) => {
      if (!chart.isDatasetVisible(di)) return;
      const meta = chart.getDatasetMeta(di);
      meta.data.forEach((barra, i) => {
        const v = ds.data[i];
        if (v == null) return;
        const { x, y } = barra.tooltipPosition();
        if (horizontal) {
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(formato(v), x + 6, y);
        } else {
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText(formato(v), x, y - 5);
        }
      });
    });
    ctx.restore();
  }
};

/**
 * Plugin: texto en el centro de una dona.
 * Se activa con  plugins: { textoCentro: { titulo: '48.000', subtitulo: 'almas' } }.
 */
export const textoCentro = {
  id: 'textoCentro',
  afterDraw(chart, _args, opts) {
    if (!opts?.titulo || chart.config.type !== 'doughnut') return;
    const { ctx, chartArea } = chart;
    const cx = (chartArea.left + chartArea.right) / 2;
    const cy = (chartArea.top + chartArea.bottom) / 2;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = COLORES.tinta;
    ctx.font = `700 26px 'Cinzel', Georgia, serif`;
    ctx.fillText(opts.titulo, cx, cy - (opts.subtitulo ? 10 : 0));
    if (opts.subtitulo) {
      ctx.fillStyle = COLORES.tintaTenue;
      ctx.font = `italic 14px 'IM Fell English', Georgia, serif`;
      ctx.fillText(opts.subtitulo, cx, cy + 16);
    }
    ctx.restore();
  }
};

/** Aplica los defaults al objeto Chart global (se llama una vez desde main.js). */
export function aplicarTema(Chart) {
  Chart.register(bandaGuerra, valoresBarras, textoCentro);

  Chart.defaults.font.family = "'IM Fell English', 'EB Garamond', Georgia, serif";
  Chart.defaults.font.size = 13;
  Chart.defaults.color = COLORES.tintaTenue;
  Chart.defaults.borderColor = COLORES.grid;
  Chart.defaults.maintainAspectRatio = false;

  // Animación de entrada por defecto
  Chart.defaults.animation.duration = 1100;
  Chart.defaults.animation.easing = 'easeOutQuart';
  Chart.defaults.transitions.active.animation.duration = 250;

  // Tooltips con aire de nota al margen
  Object.assign(Chart.defaults.plugins.tooltip, {
    backgroundColor: COLORES.fondoTip,
    borderColor: COLORES.borde,
    borderWidth: 1,
    titleColor: COLORES.tinta,
    bodyColor: COLORES.tinta,
    titleFont: { family: "'Cinzel', Georgia, serif", weight: '600', size: 12 },
    bodyFont: { family: "'IM Fell English', Georgia, serif", size: 13 },
    padding: 12,
    cornerRadius: 2,
    displayColors: true,
    boxPadding: 4
  });

  // Usamos leyenda HTML propia (más interactiva) en lugar de la nativa
  Chart.defaults.plugins.legend.display = false;
}

/** Opciones base reutilizables por cualquier gráfico cartesiano. */
export const ejesBase = {
  x: {
    grid: { display: false },
    ticks: { maxRotation: 0, autoSkipPadding: 14, color: COLORES.tintaTenue },
    border: { color: COLORES.eje, width: 1.2 }
  },
  y: {
    beginAtZero: true,
    grid: { color: COLORES.grid, drawTicks: false },
    border: { display: false, dash: [3, 3] },
    ticks: { padding: 10, color: COLORES.tintaTenue }
  }
};

/** Formateadores de números en español. */
export const fmt = {
  num: new Intl.NumberFormat('es-ES'),
  dec: new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 }),
  pct: new Intl.NumberFormat('es-ES', { style: 'percent', maximumFractionDigits: 1 })
};
