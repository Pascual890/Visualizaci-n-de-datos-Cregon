import { color, alfa, fmt } from '../theme.js';

/**
 * CAPÍTULO V — Dueños de la tierra (tarta en porcentaje).
 * Interacciones: ver el detalle o agrupar "nobles" frente a "resto".
 */
export default {
  id: 'tierra',
  capitulo: 'V',
  titulo: 'De quién es la tierra',
  descripcion: 'Reparto de la tierra de Cregon, en porcentaje.',
  relato: 'Tres de cada cuatro fanegas de Cregon llevan hoy el sello de una casa noble. ' +
          'Vareck posee por sí sola más de un tercio del reino. A los aldeanos, que son la ' +
          'mayoría de los que quedan, les corresponde una quinta parte; el resto son baldíos y bosque ' +
          'donde nadie siembra y pocos se atreven a entrar.',
  nota: 'Catastro del reino, año 1218.',
  datos: 'data/tierra.json',

  controles: [
    {
      id: 'agrupar',
      etiqueta: 'Ver',
      valor: 'detalle',
      opciones: [
        { valor: 'detalle', texto: 'Por dueño' },
        { valor: 'grupos', texto: 'Nobles y el resto' }
      ]
    }
  ],

  config(datos, estado) {
    const esNoble = (l) => /vareck|vandel|voss/i.test(l);
    let labels, valores, tonos;

    if (estado.agrupar === 'grupos') {
      const nobles = datos.labels.reduce((a, l, i) => a + (esNoble(l) ? datos.valores[i] : 0), 0);
      const aldeanos = datos.valores[datos.labels.findIndex(l => /aldeanos/i.test(l))];
      const baldios = 100 - nobles - aldeanos;
      labels = ['Casas nobles', 'Tierra de los aldeanos', 'Baldíos y bosque'];
      valores = [nobles, aldeanos, baldios];
      tonos = [color(0), color(2), color(5)];
    } else {
      labels = datos.labels;
      valores = datos.valores;
      tonos = [color(0), color(3), color(4), color(2), color(5)];
    }

    return {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data: valores,
          backgroundColor: tonos.map(t => alfa(t, 0.85)),
          hoverBackgroundColor: tonos,
          borderColor: '#f1e6cf',
          borderWidth: 3,
          hoverOffset: 16
        }]
      },
      options: {
        responsive: true,
        rotation: -90,
        animation: { animateRotate: true, animateScale: false, duration: 1200 },
        plugins: {
          etiquetasSectores: { activo: true, formato: (v) => `${fmt.dec.format(v)} %` },
          tooltip: { callbacks: { label: (c) => ` ${fmt.dec.format(c.parsed)} % de la tierra` } }
        }
      }
    };
  }
};
