import { color, alfa, ejesBase, fmt } from '../theme.js';

/**
 * CAPÍTULO II — Riqueza de las casas nobles (barras).
 * Interacciones: ordenar, comparar las casas con el conjunto del reino.
 */
export default {
  id: 'riqueza-nobles',
  capitulo: 'II',
  titulo: 'De la riqueza de los nobles',
  descripcion: 'Comparación del tesoro de cada casa, en miles de monedas.',
  relato: 'La daga que robaron los hermanos estaba en manos de <strong>Vareck</strong>, la casa más ' +
          'rica de Cregon: tiene casi dos tercios de todo el oro de los nobles. Vandel y Voss, ' +
          'sumadas, no llegan a lo que tiene Vareck sola. Para dos hermanos que viven del robo, ' +
          'una sola pieza salida de esa casa son semanas de comida.',
  nota: 'Registro de las arcas del reino, año 1218. Cifras en miles de monedas.',
  leyenda: false,
  datos: 'data/riqueza-nobles.json',

  controles: [
    {
      id: 'vista',
      etiqueta: 'Mostrar',
      valor: 'todo',
      opciones: [
        { valor: 'todo', texto: 'Con el reino' },
        { valor: 'casas', texto: 'Solo las casas' }
      ]
    },
    {
      id: 'orden',
      etiqueta: 'Orden',
      valor: 'original',
      opciones: [
        { valor: 'original', texto: 'Del registro' },
        { valor: 'desc', texto: 'Mayor a menor' }
      ]
    }
  ],

  config(datos, estado) {
    let filas = datos.labels.map((label, i) => ({ label, valor: datos.valores[i] }));
    if (estado.vista === 'casas') filas = filas.filter(f => !/familias/i.test(f.label));
    if (estado.orden === 'desc') filas.sort((a, b) => b.valor - a.valor);

    // Vareck en rojo sangre (tiene la daga), el reino en tierra, el resto en azul
    const colorDe = (f) => /vareck/i.test(f.label) ? color(0)
                        : /familias/i.test(f.label) ? color(5) : color(3);

    return {
      type: 'bar',
      data: {
        labels: filas.map(f => f.label),
        datasets: [{
          label: 'Riqueza (miles de monedas)',
          data: filas.map(f => f.valor),
          backgroundColor: filas.map(f => alfa(colorDe(f), 0.82)),
          hoverBackgroundColor: filas.map(f => colorDe(f)),
          borderColor: filas.map(f => colorDe(f)),
          borderWidth: 1.5,
          borderRadius: 2,
          maxBarThickness: 90
        }]
      },
      options: {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        animation: {
          duration: 1000,
          easing: 'easeOutQuart',
          delay: (ctx) => (ctx.type === 'data' && ctx.mode === 'default' ? ctx.dataIndex * 120 : 0)
        },
        scales: {
          x: ejesBase.x,
          y: {
            ...ejesBase.y,
            grace: '10%',
            title: { display: true, text: 'miles de monedas', color: '#6e5a45', font: { style: 'italic' } }
          }
        },
        plugins: {
          valoresBarras: { activo: true, formato: v => fmt.num.format(v) },
          tooltip: { callbacks: { label: (c) => ` ${fmt.num.format(c.parsed.y)} mil monedas` } }
        }
      }
    };
  }
};
