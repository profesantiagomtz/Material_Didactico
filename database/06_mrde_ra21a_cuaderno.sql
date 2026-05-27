alter table modulo_actividades add column if not exists codigo text;
alter table modulo_actividades add column if not exists unidad text;
alter table modulo_actividades add column if not exists ra text;
alter table modulo_actividades add column if not exists inciso text;
alter table modulo_actividades add column if not exists apuntes_html text;
alter table modulo_actividades add column if not exists diagramas_html text;
alter table modulo_actividades add column if not exists ejemplo_html text;
alter table modulo_actividades add column if not exists ejercicios_html text;
alter table modulo_actividades add column if not exists practica_html text;
alter table modulo_actividades add column if not exists reflexion_prompt text;
alter table modulo_actividades add column if not exists actualizado_en timestamp with time zone default now();
alter table modulo_actividades add column if not exists publicado boolean default true;
alter table modulo_actividades add column if not exists publicada boolean default true;
alter table modulo_actividades add column if not exists creado_en timestamp with time zone default now();

alter table modulo_entregas add column if not exists retroalimentacion text;
alter table modulo_entregas add column if not exists actualizado_en timestamp with time zone default now();

update modulo_actividades set codigo = 'MRDE-U2-RA21-A' where codigo is null and modulo = 'MRDE' and grupo = '611' and titulo ilike '%IOS%';

delete from modulo_actividades where codigo = 'MRDE-U2-RA21-A';

insert into modulo_actividades (
  codigo, modulo, grupo, unidad, ra, inciso, titulo, tipo, descripcion, instrucciones, evidencia_requerida, publicada, publicado,
  apuntes_html, diagramas_html, ejemplo_html, ejercicios_html, practica_html, reflexion_prompt
) values (
  'MRDE-U2-RA21-A',
  'MRDE',
  '611',
  'Unidad 2. Implementación de dispositivos de ruteo y conmutación de red',
  'R.A. 2.1',
  'A',
  '2.1 A) Ejecución de comandos IOS',
  'Cuaderno práctico',
  'Primer acercamiento al Sistema Operativo Internetwork IOS: funciones, métodos de acceso, modos de operación, estructura de comandos, ayuda contextual y comandos de análisis.',
  'Lee los apuntes, revisa los diagramas, analiza los ejercicios y realiza la práctica guiada en Packet Tracer. No copies respuestas: explica con tus propias palabras qué observaste, qué comandos usaste y cómo verificaste el resultado.',
  'Archivo .pkt, capturas de los modos IOS y explicación razonada del procedimiento.',
  true,
  true,
  $$
  <h4>¿Qué es IOS?</h4>
  <p><strong>IOS</strong> significa <em>Internetwork Operating System</em>. Es el sistema operativo que utilizan los routers y switches Cisco para recibir instrucciones, administrar interfaces, aplicar configuraciones y ayudar a diagnosticar fallas de conectividad.</p>
  <p>En esta actividad no se busca memorizar comandos. Lo importante es entender qué modo estás usando, qué permiso tienes en ese momento y por qué un comando funciona o falla.</p>
  <h4>Funciones principales del IOS</h4>
  <ul>
    <li><strong>Control del hardware:</strong> administra interfaces Ethernet, seriales, memoria y procesos internos.</li>
    <li><strong>Configuración:</strong> permite cambiar nombre del dispositivo, contraseñas, interfaces, rutas y servicios.</li>
    <li><strong>Monitoreo:</strong> permite revisar el estado del equipo mediante comandos <code>show</code>.</li>
    <li><strong>Diagnóstico:</strong> ayuda a comprobar conectividad con herramientas como <code>ping</code> y <code>traceroute</code>.</li>
  </ul>
  <h4>Métodos de acceso</h4>
  <ul>
    <li><strong>Consola:</strong> acceso físico directo. Es el más usado cuando el dispositivo está nuevo o sin configuración.</li>
    <li><strong>Telnet:</strong> acceso remoto no seguro. No se recomienda para redes reales porque viaja sin cifrado.</li>
    <li><strong>SSH:</strong> acceso remoto seguro. Es preferible porque cifra la comunicación.</li>
    <li><strong>Puerto auxiliar:</strong> acceso alterno, tradicionalmente usado para administración remota especial.</li>
  </ul>
  <h4>Archivos de configuración</h4>
  <ul>
    <li><strong>running-config:</strong> configuración activa en memoria RAM. Si apagas sin guardar, se pierde.</li>
    <li><strong>startup-config:</strong> configuración guardada en NVRAM. Se carga al iniciar el dispositivo.</li>
  </ul>
  <h4>Idea clave</h4>
  <p>Cuando configuras un router o switch, primero haces cambios en ejecución. Después debes decidir si esos cambios se guardan como configuración de inicio.</p>
  $$,
  $$
  <div class="diagram-grid">
    <article class="diagram-card"><img src="../assets/img/mrde/ios-acceso.svg" alt="Acceso por consola a router Cisco"><strong>Acceso por consola</strong><p>Se usa cuando el dispositivo aún no tiene red configurada. La PC abre una terminal y se conecta al puerto consola del router.</p></article>
    <article class="diagram-card"><img src="../assets/img/mrde/ios-modos.svg" alt="Modos de operación del IOS"><strong>Modos IOS</strong><p>El prompt cambia según el nivel de permiso: <code>Router&gt;</code>, <code>Router#</code> y <code>Router(config)#</code>.</p></article>
    <article class="diagram-card"><img src="../assets/img/mrde/lan-basica.svg" alt="Topología LAN básica"><strong>Topología de práctica</strong><p>Router, switch y dos PCs. Esta topología se usará para practicar configuración y verificación.</p></article>
  </div>
  $$,
  $$
  <h4>Ejemplo guiado: primer contacto con IOS</h4>
  <p>Al abrir la consola del router, normalmente aparece el prompt:</p>
  <pre class="command-block">Router&gt;</pre>
  <p>Ese símbolo indica que estás en <strong>EXEC de usuario</strong>. Puedes consultar información básica, pero no puedes modificar la configuración principal.</p>
  <p>Para entrar al modo privilegiado:</p>
  <pre class="command-block">Router&gt; enable
Router#</pre>
  <p>El símbolo <code>#</code> indica que ya puedes ejecutar comandos de análisis más completos.</p>
  <p>Para configurar el dispositivo:</p>
  <pre class="command-block">Router# configure terminal
Router(config)#</pre>
  <p>Ahora puedes cambiar parámetros globales, por ejemplo el nombre del router:</p>
  <pre class="command-block">Router(config)# hostname R1
R1(config)#</pre>
  <p>El cambio visible ocurre inmediatamente: el prompt deja de decir <code>Router</code> y ahora dice <code>R1</code>.</p>
  <p>Para guardar la configuración:</p>
  <pre class="command-block">R1# copy running-config startup-config</pre>
  <p>Este comando copia la configuración activa hacia la configuración de inicio.</p>
  $$,
  $$
  <div class="analysis-card">
    <h4>Ejercicio 1. Modo correcto</h4>
    <p>Un compañero intenta ejecutar <code>configure terminal</code> desde <code>Router&gt;</code> y el comando no funciona. Explica qué modo necesita primero y qué comando debe usar para llegar ahí.</p>
  </div>
  <div class="analysis-card">
    <h4>Ejercicio 2. Error de interpretación</h4>
    <p>Observa esta situación: el alumno escribió <code>hostname LAB611</code> y el prompt cambió a <code>LAB611(config)#</code>. ¿Qué evidencia demuestra que el comando sí se aplicó?</p>
  </div>
  <div class="analysis-card">
    <h4>Ejercicio 3. Configuración no guardada</h4>
    <p>Un router fue configurado correctamente, pero al reiniciarlo perdió el nombre y las contraseñas. ¿Qué pudo faltar? Justifica tu respuesta usando los conceptos de <em>running-config</em> y <em>startup-config</em>.</p>
  </div>
  <div class="analysis-card">
    <h4>Ejercicio 4. Decisión técnica</h4>
    <p>Si necesitas administrar un router a distancia en una red real, ¿usarías Telnet o SSH? Explica tu decisión considerando seguridad.</p>
  </div>
  $$,
  $$
  <ol class="step-list">
    <li><strong>Abre Cisco Packet Tracer.</strong> Crea un archivo nuevo y guárdalo con el nombre <code>MRDE_RA21A_TuNombre.pkt</code>.</li>
    <li><strong>Agrega un router.</strong> Usa un router Cisco disponible en Packet Tracer, por ejemplo 2911 o equivalente.</li>
    <li><strong>Abre la consola CLI.</strong> Identifica el primer prompt que aparece. Toma captura si se observa <code>Router&gt;</code>.</li>
    <li><strong>Entra al modo privilegiado.</strong> Escribe <code>enable</code>. Verifica que el prompt cambie a <code>Router#</code>.</li>
    <li><strong>Entra a configuración global.</strong> Escribe <code>configure terminal</code>. Verifica que el prompt cambie a <code>Router(config)#</code>.</li>
    <li><strong>Cambia el nombre del router.</strong> Usa <code>hostname</code> con un nombre corto relacionado contigo o con el grupo. Ejemplo: <code>hostname R611</code>.</li>
    <li><strong>Sal del modo de configuración.</strong> Usa <code>end</code>. Observa que el prompt queda como <code>R611#</code> o el nombre que elegiste.</li>
    <li><strong>Revisa la configuración.</strong> Ejecuta <code>show running-config</code> y localiza el nombre que asignaste.</li>
    <li><strong>Guarda la configuración.</strong> Ejecuta <code>copy running-config startup-config</code>. Explica por qué este paso evita perder cambios al reiniciar.</li>
    <li><strong>Entrega evidencia.</strong> Sube tu archivo .pkt y redacta tu análisis, procedimiento y reflexión final.</li>
  </ol>
  $$,
  '¿Por qué es importante guardar la configuración del router antes de apagarlo o reiniciarlo? Explica con tus propias palabras la diferencia entre configuración en ejecución y configuración de inicio.'
);
