import { color, alfa, ejesBase, fmt } from '../theme.js';

/**
 * CAPÍTULO VII — Robos reportados (línea o variación anual en barras).
 * Interacciones: total anual o cuánto cambió respecto al año anterior;
 * mostrar/ocultar la franja de guerra.
 */
export default {
  id: 'robos',
  capitulo: 'VII',
  titulo: 'Los robos que se denuncian',
  descripcion: 'Robos reportados en el reino de Cregon cada año, de 1199 a 1218.',
  relato: 'Antes de la guerra, los alguaciles anotaban poco más de trescientos robos al año. ' +
          'Con el hambre de 1208 llegaron a cuatrocientos setenta; con la paz, a casi novecientos. ' +
          'Y no han dejado de subir: en 1218 se denuncian más de mil ciento cincuenta, ' +
          'más del triple que en tiempos del viejo rey.',
  nota: 'Libro de denuncias de la guardia del reino.',
  leyenda: false,
  datos: 'data/robos.json',

  controles: [
    {
      id: 'modo',
      etiqueta: 'Ver',
      valor: 'total',
      opciones: [
        { valor: 'total', texto: 'Robos al año' },
        { valor: 'cambio', texto: 'Cambio anual' }
      ]
    },
    {
      id: 'guerra',
      etiqueta: 'Guerra',
      valor: 'si',
      opciones: [
        { valor: 'si', texto: 'Señalar' },
        { valor: 'no', texto: 'Ocultar' }
      ]
    }
  ],

  config(datos, estado) {
    const serie = datos.series[0];
    const cambio = estado.modo === 'cambio';
    const valores = cambio
      ? serie.valores.map((v, i) => (i === 0 ? 0 : v - serie.valores[i - 1]))
      : serie.valores;

    return {
      type: cambio ? 'bar' : 'line',
      data: {
        labels: datos.labels,
        datasets: [{
          label: cambio ? 'Robos más (o menos) que el año anterior' : serie.nombre,
          data: valores,
          borderColor: color(0),
          backgroundColor: cambio
            ? valores.map(v => alfa(v >= 0 ? color(0) : color(2), 0.8))
            : alfa(color(0), 0.12),
          borderWidth: cambio ? 1 : 2.5,
          fill: !cambio,
          tension: 0.35,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: color(0),
          pointHoverBorderColor: '#f1e6cf',
          pointHoverBorderWidth: 2,
          borderRadius: 2
        }]
      },
      options: {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        animation: { duration: 1400, easing: 'easeOutQuart' },
        scales: {
          x: ejesBase.x,
          y: {
            ...ejesBase.y,
            title: {
              display: true,
              text: cambio ? 'robos más que el año anterior' : 'robos reportados',
              color: '#6e5a45',
              font: { style: 'italic' }
            }
          }
        },
        plugins: {
          bandaGuerra: { activo: estado.guerra === 'si' },
          tooltip: {
            callbacks: {
              title: (items) => `Año ${items[0].label}`,
              label: (c) => cambio
                ? ` ${c.parsed.y > 0 ? '+' : ''}${fmt.num.format(c.parsed.y)} respecto a ${Number(c.label) - 1}`
                : ` ${fmt.num.format(c.parsed.y)} robos reportados`
            }
          }
        }
      }
    };
  }
};
