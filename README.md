# Material Didáctico 2.0

Plataforma académica tipo cuaderno digital para COBD, POO y MRDE.

## Instalación rápida

1. En Supabase abre SQL Editor.
2. Ejecuta `database/00_instalacion_completa.sql`.
3. Sube el contenido de esta carpeta al repositorio de GitHub Pages.
4. Verifica `assets/js/config.js`.
5. Abre `registro.html` y registra el primer docente. Ese primer docente se convierte en administrador.
6. Inicia sesión desde `login.html`.

## Estructura

- `index.html`: portada.
- `registro.html`: creación de cuentas.
- `login.html`: acceso.
- `admin/`: panel docente.
- `alumno/`: panel alumno y módulos.
- `database/`: scripts SQL de instalación.
- `assets/`: estilos y JavaScript.

## Flujo

- El primer docente registrado queda como administrador.
- Los alumnos registrados aparecen en el panel de alumnos.
- Los docentes posteriores quedan pendientes de aprobación.
- Los simuladores están dentro de su módulo correspondiente.
