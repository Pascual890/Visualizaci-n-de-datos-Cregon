import { color, alfa, fmt } from '../theme.js';

/**
 * CAPÍTULO IV — Qué fue de los habitantes de Cregon (anillo / tarta).
 * Interacciones: anillo o tarta, valores en personas o en porcentaje,
 * ocultar categorías desde la leyenda.
 */
export default {
  id: 'habitantes',
  capitulo: 'IV',
  titulo: 'De los habitantes tras la guerra',
  descripcion: 'Qué fue de las gentes de Cregon: quiénes siguen, quiénes cayeron y quiénes partieron.',
  relato: 'Cuarenta y ocho mil almas contaba el reino antes de la guerra. Ocho mil doscientas ' +
          'quedaron en los campos de batalla; cinco mil trescientas cruzaron las montañas para no volver. ' +
          'Las treinta y cuatro mil quinientas que siguen en Cregon son las que hoy cargan con el peso ' +
          'del reino sobre los hombros.',
  nota: 'Censo de las parroquias del reino, año 1210.',
  datos: 'data/habitantes.json',

  controles: [
    {
      id: 'forma',
      etiqueta: 'Forma',
      valor: 'doughnut',
      opciones: [
        { valor: 'doughnut', texto: 'Anillo' },
        { valor: 'pie', texto: 'Tarta' }
      ]
    },
    {
      id: 'unidad',
      etiqueta: 'Unidad',
      valor: 'personas',
      opciones: [
        { valor: 'personas', texto: 'Personas' },
        { valor: 'pct', texto: 'Porcentaje' }
      ]
    }
  ],

  config(datos, estado) {
    const total = datos.valores.reduce((a, b) => a + b, 0);
    const tonos = [color(2), color(0), color(1)];   // siguen: verde · murieron: sangre · se fueron: oro
    const etiqueta = (v) => estado.unidad === 'pct'
      ? fmt.pct.format(v / total)
      : `${fmt.num.format(v)} personas`;

    return {
      type: estado.forma,
      data: {
        labels: datos.labels,
        datasets: [{
          data: datos.valores,
          backgroundColor: tonos.map(t => alfa(t, 0.85)),
          hoverBackgroundColor: tonos,
          borderColor: '#f1e6cf',
          borderWidth: 3,
          hoverOffset: 16
        }]
      },
      options: {
        responsive: true,
        cutout: estado.forma === 'doughnut' ? '58%' : undefined,
        rotation: -90,
        animation: { animateRotate: true, animateScale: true, duration: 1200 },
        plugins: {
          textoCentro: { titulo: fmt.num.format(total), subtitulo: 'almas antes de la guerra' },
          tooltip: { callbacks: { label: (c) => ` ${etiqueta(c.parsed)}` } }
        }
      }
    };
  }
};
