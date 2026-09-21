import { color, alfa, ejesBase, fmt } from '../theme.js';

/**
 * CAPÍTULO VI — Transferencia de riqueza (líneas, dos series).
 * Interacciones: mostrar/ocultar la franja de guerra,
 * ocultar series desde la leyenda.
 */
export default {
  id: 'riqueza-tendencia',
  capitulo: 'VI',
  titulo: 'Cómo la guerra cambió de manos el oro',
  descripcion: 'Riqueza de la gente común y de las casas nobles, año a año, de 1199 a 1218.',
  relato: 'Durante veinte años la gente común guardó casi el doble que los nobles. La guerra ' +
          'lo cambió todo en tres inviernos: entre 1207 y 1210 el pueblo perdió dos tercios de ' +
          'cuanto tenía, mientras las arcas de las casas apenas se resintieron. Desde la paz, ' +
          'los nobles crecen más deprisa que el pueblo, y en 1218 ya lo superan con holgura.',
  nota: 'Cuentas del tesorero real. Valores en miles de monedas.',
  datos: 'data/riqueza-tendencia.json',

  controles: [
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
    const tonos = [color(2), color(0)];   // gente común: verde · casas nobles: sangre

    return {
      type: 'line',
      data: {
        labels: datos.labels,
        datasets: datos.series.map((s, i) => ({
          label: s.nombre,
          data: s.valores,
          borderColor: tonos[i],
          backgroundColor: alfa(tonos[i], 0.9),
          borderWidth: 2.5,
          tension: 0.35,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: tonos[i],
          pointHoverBorderColor: '#f1e6cf',
          pointHoverBorderWidth: 2
        }))
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
              text: 'miles de monedas',
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
              label: (c) => ` ${c.dataset.label}: ${fmt.num.format(c.parsed.y)} mil`
            }
          }
        }
      }
    };
  }
};
