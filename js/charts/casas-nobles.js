import { color, alfa, ejesBase } from '../theme.js';

/**
 * CAPÍTULO III — Casas nobles en pie (barras o escalera).
 * Interacciones: ver como barras o como línea escalonada.
 */
export default {
  id: 'casas-nobles',
  capitulo: 'III',
  titulo: 'Las casas que quedaron en pie',
  descripcion: 'Número de casas nobles en Cregon antes, al terminar y después de la guerra.',
  relato: 'Doce casas se sentaban a la mesa del rey cuando comenzó la guerra en el año 1207. ' +
          'Al firmarse la paz en 1210 quedaban siete, y la paz resultó más cruel que la guerra: ' +
          'hoy, en el año 1218, solo tres blasones cuelgan aún de los muros del castillo: ' +
          'Vareck, Vandel y Voss.',
  nota: 'Libro de linajes del reino de Cregon.',
  leyenda: false,
  datos: 'data/casas-nobles.json',

  controles: [
    {
      id: 'forma',
      etiqueta: 'Forma',
      valor: 'bar',
      opciones: [
        { valor: 'bar', texto: 'Barras' },
        { valor: 'line', texto: 'Escalera' }
      ]
    }
  ],

  config(datos, estado) {
    const tonos = [color(2), color(1), color(0)];   // verde → oro → sangre
    const barras = estado.forma === 'bar';

    return {
      type: estado.forma,
      data: {
        labels: datos.labels,
        datasets: [{
          label: 'Casas nobles en pie',
          data: datos.valores,
          backgroundColor: barras ? tonos.map(t => alfa(t, 0.82)) : alfa(color(0), 0.15),
          hoverBackgroundColor: tonos,
          borderColor: barras ? tonos : color(0),
          borderWidth: barras ? 1.5 : 2.5,
          borderRadius: 2,
          maxBarThickness: 110,
          // opciones de línea escalonada
          stepped: 'middle',
          fill: !barras,
          pointRadius: barras ? 0 : 6,
          pointBackgroundColor: tonos,
          pointBorderColor: '#f1e6cf',
          pointBorderWidth: 2,
          pointHoverRadius: 9
        }]
      },
      options: {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        animation: {
          duration: 1000,
          delay: (ctx) => (ctx.type === 'data' && ctx.mode === 'default' ? ctx.dataIndex * 220 : 0)
        },
        scales: {
          x: ejesBase.x,
          y: { ...ejesBase.y, ticks: { ...ejesBase.y.ticks, stepSize: 2 }, grace: '10%' }
        },
        plugins: {
          valoresBarras: { activo: barras },
          tooltip: { callbacks: { label: (c) => ` ${c.parsed.y} casas nobles` } }
        }
      }
    };
  }
};
