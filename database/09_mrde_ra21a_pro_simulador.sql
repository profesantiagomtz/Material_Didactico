
-- =========================================================
-- 09 MRDE RA 2.1 A - CUADERNO PRO CON SIMULADOR IOS
-- Ejecutar SOLO este SQL si la actividad id=1 ya existe.
-- No toca login, alumnos, perfiles ni accesos.
-- =========================================================

alter table modulo_actividades add column if not exists codigo text;
alter table modulo_actividades add column if not exists unidad text;
alter table modulo_actividades add column if not exists ra text;
alter table modulo_actividades add column if not exists inciso text;
alter table modulo_actividades add column if not exists instrucciones text;
alter table modulo_actividades add column if not exists apuntes_html text;
alter table modulo_actividades add column if not exists diagramas_html text;
alter table modulo_actividades add column if not exists ejemplo_html text;
alter table modulo_actividades add column if not exists ejercicios_html text;
alter table modulo_actividades add column if not exists practica_html text;
alter table modulo_actividades add column if not exists reflexion_prompt text;

update modulo_actividades
set
  codigo = 'MRDE-U2-RA21-A',
  unidad = 'Unidad 2. Implementación de dispositivos de ruteo y conmutación de red',
  ra = 'R.A. 2.1',
  inciso = 'A',
  titulo = '2.1 A) Ejecución de comandos IOS',
  tipo = 'Cuaderno práctico con simulador',
  descripcion = 'Primer acercamiento al Sistema Operativo Internetwork IOS: funciones, métodos de acceso, modos de operación, estructura de comandos, ayuda contextual, comandos de análisis y práctica guiada en Packet Tracer.',
  instrucciones = 'Lee los apuntes, revisa los diagramas, analiza los casos, prueba comandos en el simulador IOS y realiza la práctica guiada en Packet Tracer. No se califican respuestas memorizadas: se evalúa razonamiento, procedimiento y evidencia.',
  evidencia_requerida = true,
  activa = true,
  publicada = true,
  apuntes_html = $$
    <h4>Contexto de clase</h4>
    <p>En redes no basta con “saber comandos”. Un técnico debe saber <strong>en qué modo está trabajando</strong>, <strong>qué efecto tendrá cada comando</strong>, <strong>cómo comprobar el resultado</strong> y <strong>cómo evitar perder la configuración</strong>.</p>
    <div class="teacher-note"><strong>Meta del tema:</strong> al terminar, podrás entrar a un router Cisco, reconocer los modos IOS, ejecutar comandos básicos de análisis, cambiar el nombre del equipo y guardar la configuración.</div>

    <h4>¿Qué es IOS?</h4>
    <p><strong>IOS</strong> significa <em>Internetwork Operating System</em>. Es el sistema operativo que utilizan muchos routers y switches Cisco. Su función es recibir instrucciones por línea de comandos, administrar interfaces, aplicar configuraciones y ayudar a diagnosticar fallas.</p>

    <h4>Funciones principales del IOS</h4>
    <div class="concept-grid">
      <article><strong>Administración del hardware</strong><p>Controla interfaces Ethernet, seriales, memoria y procesos internos.</p></article>
      <article><strong>Configuración</strong><p>Permite aplicar nombres, contraseñas, banners, direcciones IP, rutas y servicios.</p></article>
      <article><strong>Monitoreo</strong><p>Permite observar el estado del dispositivo mediante comandos <code>show</code>.</p></article>
      <article><strong>Diagnóstico</strong><p>Ayuda a comprobar conectividad con <code>ping</code>, <code>traceroute</code> y comandos de verificación.</p></article>
    </div>

    <h4>Modos principales del IOS</h4>
    <table class="command-table">
      <thead><tr><th>Prompt</th><th>Modo</th><th>¿Qué permite hacer?</th><th>Cómo llegar</th></tr></thead>
      <tbody>
        <tr><td><code>Router&gt;</code></td><td>EXEC de usuario</td><td>Consulta básica y comandos limitados.</td><td>Es el modo inicial.</td></tr>
        <tr><td><code>Router#</code></td><td>EXEC privilegiado</td><td>Ejecutar comandos de análisis, guardar configuración y entrar a configuración.</td><td><code>enable</code></td></tr>
        <tr><td><code>Router(config)#</code></td><td>Configuración global</td><td>Cambiar parámetros generales del equipo.</td><td><code>configure terminal</code></td></tr>
        <tr><td><code>Router(config-if)#</code></td><td>Configuración de interfaz</td><td>Configurar una interfaz específica.</td><td><code>interface g0/0</code></td></tr>
      </tbody>
    </table>

    <h4>Métodos de acceso al IOS</h4>
    <table class="command-table">
      <thead><tr><th>Método</th><th>Uso</th><th>Riesgo o ventaja</th></tr></thead>
      <tbody>
        <tr><td>Consola</td><td>Conexión física directa al router o switch.</td><td>Ideal cuando el equipo está nuevo o sin IP.</td></tr>
        <tr><td>Telnet</td><td>Acceso remoto por red.</td><td>No seguro, porque no cifra la información.</td></tr>
        <tr><td>SSH</td><td>Acceso remoto seguro.</td><td>Recomendado porque cifra usuario, contraseña y comandos.</td></tr>
        <tr><td>Auxiliar</td><td>Acceso alterno para administración especial.</td><td>Uso menos común en laboratorio escolar.</td></tr>
      </tbody>
    </table>

    <h4>Comandos esenciales de este tema</h4>
    <table class="command-table">
      <thead><tr><th>Comando</th><th>Modo recomendado</th><th>¿Para qué sirve?</th><th>Error común</th></tr></thead>
      <tbody>
        <tr><td><code>enable</code></td><td><code>Router&gt;</code></td><td>Entrar al modo privilegiado.</td><td>Creer que ya se puede configurar desde <code>Router&gt;</code>.</td></tr>
        <tr><td><code>configure terminal</code></td><td><code>Router#</code></td><td>Entrar a configuración global.</td><td>Ejecutarlo desde <code>Router&gt;</code>.</td></tr>
        <tr><td><code>hostname R611</code></td><td><code>Router(config)#</code></td><td>Cambiar el nombre visible del dispositivo.</td><td>Ejecutarlo desde modo privilegiado.</td></tr>
        <tr><td><code>show running-config</code></td><td><code>Router#</code></td><td>Ver configuración activa.</td><td>No revisar si el cambio realmente quedó aplicado.</td></tr>
        <tr><td><code>show ip interface brief</code></td><td><code>Router#</code></td><td>Ver interfaces, direcciones IP y estado.</td><td>No interpretar <em>administratively down</em>.</td></tr>
        <tr><td><code>copy running-config startup-config</code></td><td><code>Router#</code></td><td>Guardar la configuración activa.</td><td>Apagar sin guardar.</td></tr>
      </tbody>
    </table>

    <h4>running-config vs startup-config</h4>
    <p><strong>running-config</strong> es la configuración activa en RAM. Funciona mientras el equipo está encendido, pero si se apaga sin guardar, los cambios se pierden.</p>
    <p><strong>startup-config</strong> es la configuración guardada en NVRAM. Es la que el router carga cuando vuelve a encender.</p>
    <div class="lab-note"><strong>Idea clave:</strong> si configuraste bien pero al reiniciar “se borró todo”, casi siempre faltó guardar con <code>copy running-config startup-config</code>.</div>
  $$,
  diagramas_html = $$
    <div class="diagram-grid">
      <article class="diagram-card pro"><img src="../assets/img/mrde/ios-acceso-pro.svg" alt="Diagrama profesional de acceso por consola a router Cisco"><strong>Acceso por consola</strong><p>Representa el primer contacto con un router nuevo: PC del alumno, cable consola y puerto console del equipo.</p></article>
      <article class="diagram-card pro"><img src="../assets/img/mrde/ios-modos-pro.svg" alt="Diagrama de modos IOS usuario privilegiado y configuración global"><strong>Escalera de modos IOS</strong><p>El alumno debe entender que cada modo permite acciones distintas. El prompt es la pista principal.</p></article>
      <article class="diagram-card pro"><img src="../assets/img/mrde/ios-memoria-config.svg" alt="Diagrama de running-config y startup-config"><strong>Memoria de configuración</strong><p>Explica por qué guardar cambios es indispensable antes de apagar o reiniciar.</p></article>
      <article class="diagram-card pro"><img src="../assets/img/mrde/ios-topologia-lab-pro.svg" alt="Topología de laboratorio router switch y computadoras"><strong>Topología de laboratorio</strong><p>Base visual para las siguientes prácticas de conectividad, interfaces y pruebas con ping.</p></article>
    </div>
  $$,
  ejemplo_html = $$
    <h4>Ejemplo resuelto: preparar un router recién entregado al laboratorio</h4>
    <p><strong>Situación:</strong> el docente entrega un router nuevo al equipo. Antes de usarlo en prácticas de conectividad, necesitan comprobar que pueden entrar al IOS, reconocer el modo, cambiar el nombre y guardar la configuración.</p>

    <p>Al abrir la consola aparece:</p>
    <pre class="command-block">Router&gt;</pre>
    <p>Estás en EXEC de usuario. Todavía no debes intentar configurar.</p>

    <p>Entras al modo privilegiado:</p>
    <pre class="command-block">Router&gt; enable
Router#</pre>
    <p>El cambio de <code>&gt;</code> a <code>#</code> indica mayor nivel de permisos.</p>

    <p>Entras a configuración global:</p>
    <pre class="command-block">Router# configure terminal
Enter configuration commands, one per line. End with CNTL/Z.
Router(config)#</pre>

    <p>Cambias el nombre del dispositivo:</p>
    <pre class="command-block">Router(config)# hostname R611-LAB
R611-LAB(config)#</pre>
    <p>La evidencia inmediata es el prompt: ya no dice <code>Router</code>, ahora muestra <code>R611-LAB</code>.</p>

    <p>Sales del modo de configuración:</p>
    <pre class="command-block">R611-LAB(config)# end
R611-LAB#</pre>

    <p>Verificas la configuración activa:</p>
    <pre class="command-block">R611-LAB# show running-config
Building configuration...
!
hostname R611-LAB
!
end</pre>

    <p>Guardas los cambios:</p>
    <pre class="command-block">R611-LAB# copy running-config startup-config
Destination filename [startup-config]? 
Building configuration...
[OK]</pre>

    <div class="lab-note"><strong>Conclusión:</strong> el router ya tiene nombre, el cambio fue verificado y además quedó guardado para el siguiente reinicio.</div>
  $$,
  ejercicios_html = $$
    <div class="analysis-card"><h4>Caso 1. El modo incorrecto</h4><p>Un alumno escribe <code>configure terminal</code> cuando el prompt está en <code>Router&gt;</code>. El comando no funciona. Explica qué está mal, a qué modo debe entrar primero y qué evidencia visual le indica que ya puede continuar.</p></div>
    <div class="analysis-card"><h4>Caso 2. Cambio aplicado, pero no comprobado</h4><p>Una alumna usa <code>hostname LAB611</code> y el prompt cambia a <code>LAB611(config)#</code>. ¿Por qué ese cambio en el prompt es evidencia? ¿Qué comando usarías después para comprobarlo en la configuración activa?</p></div>
    <div class="analysis-card"><h4>Caso 3. Todo funcionó… hasta que apagaron el router</h4><p>El equipo configuró el hostname y contraseñas, pero al reiniciar volvió todo como antes. Explica qué faltó y relaciona tu respuesta con <code>running-config</code> y <code>startup-config</code>.</p></div>
    <div class="analysis-card"><h4>Caso 4. Seguridad en el acceso remoto</h4><p>El plantel quiere administrar un router a distancia. Un alumno propone Telnet porque es más fácil. Otro propone SSH. ¿Cuál elegirías y por qué? No respondas solo “SSH”; justifica el riesgo técnico.</p></div>
  $$,
  practica_html = $$
    <ol class="step-list detail">
      <li><strong>Abre Packet Tracer y crea el archivo.</strong> Guárdalo como <code>MRDE_RA21A_TuNombre.pkt</code>.<span class="why">Por qué: desde el inicio debes organizar la evidencia con nombre identificable.</span></li>
      <li><strong>Agrega un router Cisco.</strong> Usa 2911 o un modelo equivalente disponible.<span class="why">Por qué: el objetivo de esta práctica es dominar la consola IOS, no todavía configurar toda la red.</span></li>
      <li><strong>Abre la pestaña CLI.</strong> Identifica el prompt inicial y anótalo en tu bitácora.<span class="why">Por qué: el prompt te indica el modo IOS donde estás trabajando.</span></li>
      <li><strong>Entra al modo privilegiado.</strong> Escribe <code>enable</code> y verifica que el prompt cambie a <code>Router#</code>.<span class="why">Por qué: este modo permite usar comandos de análisis y pasar a configuración.</span></li>
      <li><strong>Entra a configuración global.</strong> Escribe <code>configure terminal</code>.<span class="why">Por qué: aquí se aplican cambios generales al dispositivo.</span></li>
      <li><strong>Cambia el hostname.</strong> Usa una nomenclatura clara, por ejemplo <code>hostname R611-TuNombre</code>.<span class="why">Por qué: identificar equipos evita confusión durante prácticas de laboratorio.</span></li>
      <li><strong>Sal a modo privilegiado.</strong> Usa <code>end</code>.<span class="why">Por qué: los comandos show y guardar configuración se trabajan desde modo privilegiado.</span></li>
      <li><strong>Verifica la configuración activa.</strong> Ejecuta <code>show running-config</code> y localiza el hostname.<span class="why">Por qué: no basta con “creer” que funcionó; debes comprobarlo.</span></li>
      <li><strong>Revisa interfaces.</strong> Ejecuta <code>show ip interface brief</code> y observa el estado de las interfaces.<span class="why">Por qué: aunque no configures IP todavía, este comando será esencial en prácticas posteriores.</span></li>
      <li><strong>Guarda la configuración.</strong> Ejecuta <code>copy running-config startup-config</code>.<span class="why">Por qué: así evitas que el router pierda cambios al reiniciar.</span></li>
      <li><strong>Entrega tu evidencia.</strong> Sube el archivo .pkt y completa la bitácora dentro del sistema.<span class="why">Por qué: la evaluación revisa procedimiento, razonamiento y evidencia, no solo el archivo.</span></li>
    </ol>
    <div class="rubric-mini">
      <article><strong>Bien</strong><p>Comandos correctos y evidencia básica.</p></article>
      <article><strong>Muy bien</strong><p>Explicas por qué cambias de modo y cómo verificas.</p></article>
      <article><strong>Excelente</strong><p>Relacionas comandos, evidencia y prevención de errores reales.</p></article>
    </div>
  $$,
  reflexion_prompt = 'Explica por qué no basta con escribir comandos en IOS. Menciona modo de operación, verificación, guardado de configuración y evidencia técnica.'
where id = 1;

select
  id,
  titulo,
  codigo,
  apuntes_html is not null as tiene_apuntes,
  diagramas_html is not null as tiene_diagramas,
  ejemplo_html is not null as tiene_ejemplo,
  ejercicios_html is not null as tiene_ejercicios,
  practica_html is not null as tiene_practica
from modulo_actividades
where id = 1;
