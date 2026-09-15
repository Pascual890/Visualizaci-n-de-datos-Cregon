import { aplicarTema } from './theme.js';
import { GRAFICOS } from './registry.js';
import { crearTarjeta } from './charts/base.js';

const Chart = window.Chart;
if (!Chart) {
  document.getElementById('app').innerHTML =
    '<div class="error">No se ha cargado Chart.js. Revisa la conexión o descarga la librería en local.</div>';
} else {
  aplicarTema(Chart);
  construir();
}

function construir() {
  const app = document.getElementById('app');
  const nav = document.getElementById('nav');

  GRAFICOS.forEach((def, i) => {
    // Tarjeta del gráfico
    app.appendChild(crearTarjeta(def));

    // Enlace en la navegación
    const a = document.createElement('a');
    a.className = 'nav__link' + (i === 0 ? ' is-active' : '');
    a.href = `#${def.id}`;
    a.innerHTML = def.capitulo
      ? `<span class="nav__num">${def.capitulo}</span> ${def.titulo}`
      : def.titulo;
    nav.appendChild(a);
  });

  resaltarNavActiva(nav);
}

/** Marca en la navegación el gráfico que se está viendo. */
function resaltarNavActiva(nav) {
  const enlaces = [...nav.querySelectorAll('.nav__link')];
  const io = new IntersectionObserver((entradas) => {
    entradas.forEach(e => {
      if (!e.isIntersecting) return;
      enlaces.forEach(a => a.classList.toggle('is-active', a.hash === `#${e.target.id}`));
    });
  }, { rootMargin: '-20% 0px -70% 0px' });

  document.querySelectorAll('.card').forEach(c => io.observe(c));
}
