# Material Didáctico 2.0

Plataforma académica tipo cuaderno digital para COBD, POO y MRDE, conectada a Supabase.

## Instalación rápida

1. Sube todo el contenido de esta carpeta a GitHub.
2. Ejecuta en Supabase el archivo `database/00_instalacion_completa.sql`.
3. Verifica que `assets/js/config.js` tenga tu URL y publishable key de Supabase.
4. Abre `registro.html` y crea la primera cuenta docente; si no existe administrador, quedará como admin.

## Estructura

- `registro.html` y `login.html`: acceso de usuarios.
- `admin/`: panel docente.
- `alumno/`: cuaderno del alumno.
- `assets/js/`: lógica de conexión, auth y paneles.
- `database/`: scripts SQL.
