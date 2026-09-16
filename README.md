# Crónica del Reino de Cregon

Visualización de datos de un cuento de ficción (la daga y los hermanos del reino
de Cregon), con estética de crónica antigua. Proyecto estático: HTML + CSS +
JavaScript con Chart.js.

## Cómo abrirlo

El proyecto usa módulos ES y `fetch`, así que **no funciona abriendo el archivo
con doble clic** (`file://`): hay que servirlo desde un servidor local.

```bash
python serve.py
```

(o `npm run dev`, que hace lo mismo; no hay dependencias que instalar).
Luego abrir <http://localhost:8000>. Para parar el servidor: `Ctrl + C` en la terminal. `serve.py` es el servidor estándar de Python
pero sin caché, para que el navegador recargue siempre el CSS y el JS al guardar
cambios. Si usas `python -m http.server` o *Live Server* de VS Code también
funciona, pero tras cambiar archivos haz recarga forzada (`Ctrl + F5`).

## Publicar en GitHub Pages

El sitio está en <https://pascual890.github.io/Visualizaci-n-de-datos-Cregon/>.
Tras cada cambio: `git add . && git commit -m "..." && git push`.

El archivo `.nojekyll` de la raíz es necesario: sin él GitHub ignora los
archivos y carpetas que empiezan por `_` y la página se
queda sin gráficos.

## Estructura

```
index.html                  Página principal (cabecera, nav, contenedor)
css/styles.css              Estilos y variables de color
data/*.json                 Datos de cada gráfico (transcritos de las tablas de Flourish)
assets/cregon.svg           Contorno del reino (mapa)
Datos/                      Originales: PDF de Flourish y capturas de las tablas
js/main.js                  Punto de entrada: monta los capítulos y el índice
js/registry.js              Índice: qué capítulos se muestran y en qué orden
js/theme.js                 Paleta "tinta sobre pergamino", plugins (franja de guerra,
                            valores en barras, texto central) y defaults de Chart.js
js/charts/base.js           Motor: hoja del capítulo, controles, leyenda, animaciones
js/charts/*.js              Un archivo por capítulo/gráfico
```

## Añadir un gráfico nuevo

1. Crear `data/mi-grafico.json` con los datos.
2. Copiar uno de los `js/charts/*.js` como `js/charts/mi-grafico.js` y ajustar
   `id`, `capitulo`, `titulo`, `descripcion`, `relato`, `datos`, `controles` y `config()`.
3. Importarlo en `js/registry.js` y añadirlo al array `GRAFICOS`.

## Formato de los datos

Series (barras, líneas):

```json
{
  "labels": ["2020", "2021"],
  "series": [ { "nombre": "Serie 1", "valores": [10, 20] } ]
}
```

Distribución (dona, tarta):

```json
{ "labels": ["A", "B"], "valores": [10, 20] }
```

## Interacciones incluidas

- Animación de entrada: cada gráfico se dibuja al entrar en pantalla.
- Leyenda propia: clic para mostrar/ocultar series o categorías.
- Controles por gráfico (orden, orientación, acumulado, forma…).
- Tooltips con formato en español.
- Descarga de cada gráfico en PNG.
- Navegación superior fija que resalta el gráfico visible.

## Capítulos

| Cap. | Gráfico | Interacciones |
|------|---------|---------------|
| I | Mapa de las ciudades (círculos proporcionales sobre el reino) | dato (habitantes / robos / riqueza), ocultar ciudades |
| II | Riqueza de los nobles (barras) | con/sin el reino, ordenar |
| III | Casas nobles en pie (barras / escalera) | cambiar forma |
| IV | Habitantes tras la guerra (anillo / tarta) | forma, personas / %, leyenda |
| V | Dueños de la tierra (tarta) | detalle / nobles vs. resto, leyenda |
| VI | Transferencia de riqueza (líneas) | monedas / índice, franja de guerra, leyenda |
| VII | Robos reportados (línea / barras) | total / cambio anual, franja de guerra |
