/**
 * Índice de capítulos de la crónica.
 * Para añadir uno nuevo: crea js/charts/mi-grafico.js, impórtalo aquí
 * y añádelo al array. El orden del array es el orden en la página.
 */
import mapaUbicacion from './charts/mapa-ubicacion.js';
import riquezaNobles from './charts/riqueza-nobles.js';
import casasNobles from './charts/casas-nobles.js';
import habitantes from './charts/habitantes.js';
import tierra from './charts/tierra.js';
import riquezaTendencia from './charts/riqueza-tendencia.js';
import robos from './charts/robos.js';
import mapaRegiones from './charts/mapa-regiones.js';

export const GRAFICOS = [
  mapaUbicacion,
  riquezaNobles,
  casasNobles,
  habitantes,
  tierra,
  riquezaTendencia,
  robos,
  mapaRegiones
];
