let actividadActual = null;
let alumnoActual = null;
const respuestasCuaderno = new Map();

const seccionesOrden = ['apuntes','diagramas','ejemplo','ejercicios','practica','entrega'];

const fallbackRA21A = {
  apuntes_html: `
    <h4>¿Qué es IOS?</h4>
    <p><strong>IOS</strong> significa <em>Internetwork Operating System</em>. Es el sistema operativo que utilizan routers y switches Cisco para recibir instrucciones, administrar interfaces, aplicar configuraciones y diagnosticar fallas de conectividad.</p>
    <div class="teacher-note"><strong>Idea clave:</strong> no se trata de memorizar comandos; se trata de reconocer en qué modo estás, qué puedes hacer y cómo comprobar si lo que hiciste funcionó.</div>
    <h4>Funciones principales del IOS</h4>
    <div class="concept-grid">
      <article><strong>Control del hardware</strong><p>Administra interfaces Ethernet, interfaces seriales, memoria y procesos internos.</p></article>
      <article><strong>Configuración</strong><p>Permite cambiar nombre, contraseñas, interfaces, rutas y servicios.</p></article>
      <article><strong>Monitoreo</strong><p>Permite revisar el estado del equipo mediante comandos <code>show</code>.</p></article>
      <article><strong>Diagnóstico</strong><p>Ayuda a comprobar conectividad con <code>ping</code>, <code>traceroute</code> y otros comandos.</p></article>
    </div>
    <h4>Métodos de acceso al IOS</h4>
    <ul>
      <li><strong>Consola:</strong> acceso físico directo. Se usa cuando el equipo está nuevo o sin configuración.</li>
      <li><strong>Telnet:</strong> acceso remoto no seguro. No se recomienda porque no cifra la información.</li>
      <li><strong>SSH:</strong> acceso remoto seguro. Es preferible porque cifra la comunicación.</li>
      <li><strong>Auxiliar:</strong> acceso alterno para administración especial.</li>
    </ul>
    <h4>Archivos de configuración</h4>
    <ul>
      <li><strong>running-config:</strong> configuración activa en RAM. Si apagas sin guardar, se pierde.</li>
      <li><strong>startup-config:</strong> configuración guardada en NVRAM. Se carga al iniciar el dispositivo.</li>
    </ul>
  `,
  diagramas_html: `
    <div class="diagram-grid">
      <article class="diagram-card"><pre class="command-block">PC del alumno\n     │ cable consola\n     ▼\nRouter Cisco\nPuerto Console</pre><strong>Acceso por consola</strong><p>Se usa cuando el dispositivo todavía no tiene red configurada.</p></article>
      <article class="diagram-card"><pre class="command-block">Router&gt;\n  │ enable\n  ▼\nRouter#\n  │ configure terminal\n  ▼\nRouter(config)#</pre><strong>Modos IOS</strong><p>El prompt cambia dependiendo del nivel de permisos.</p></article>
      <article class="diagram-card"><pre class="command-block">Router\n  │\nSwitch\n ├── PC1\n └── PC2</pre><strong>Topología LAN básica</strong><p>Estructura base para practicar configuración y conectividad.</p></article>
    </div>
  `,
  ejemplo_html: `
    <h4>Ejemplo guiado: primer contacto con IOS</h4>
    <p>Al abrir la consola del router, normalmente aparece:</p>
    <pre class="command-block">Router&gt;</pre>
    <p>Ese símbolo indica que estás en <strong>EXEC de usuario</strong>.</p>
    <p>Para entrar al modo privilegiado:</p>
    <pre class="command-block">Router&gt; enable\nRouter#</pre>
    <p>Para configurar el dispositivo:</p>
    <pre class="command-block">Router# configure terminal\nRouter(config)#</pre>
    <p>Para cambiar el nombre:</p>
    <pre class="command-block">Router(config)# hostname R611\nR611(config)#</pre>
    <p>Para guardar la configuración:</p>
    <pre class="command-block">R611# copy running-config startup-config</pre>
  `,
  ejercicios_html: `
    <div class="analysis-card"><h4>Ejercicio 1. Modo correcto</h4><p>Un compañero intenta ejecutar <code>configure terminal</code> desde <code>Router&gt;</code> y el comando no funciona. Explica qué modo necesita primero y qué comando debe usar para llegar ahí.</p></div>
    <div class="analysis-card"><h4>Ejercicio 2. Evidencia de cambio</h4><p>El alumno escribió <code>hostname LAB611</code> y el prompt cambió a <code>LAB611(config)#</code>. ¿Qué evidencia demuestra que el comando sí se aplicó?</p></div>
    <div class="analysis-card"><h4>Ejercicio 3. Configuración no guardada</h4><p>Un router fue configurado correctamente, pero al reiniciarlo perdió el nombre y las contraseñas. ¿Qué pudo faltar? Justifica tu respuesta usando <em>running-config</em> y <em>startup-config</em>.</p></div>
    <div class="analysis-card"><h4>Ejercicio 4. Decisión técnica</h4><p>Si necesitas administrar un router a distancia en una red real, ¿usarías Telnet o SSH? Explica tu decisión considerando seguridad.</p></div>
  `,
  practica_html: `
    <ol class="step-list">
      <li><strong>Abre Cisco Packet Tracer.</strong> Crea un archivo nuevo llamado <code>MRDE_RA21A_TuNombre.pkt</code>.</li>
      <li><strong>Agrega un router.</strong> Usa un router Cisco disponible, por ejemplo 2911 o equivalente.</li>
      <li><strong>Abre la consola CLI.</strong> Identifica el primer prompt. Debe aparecer algo parecido a <code>Router&gt;</code>.</li>
      <li><strong>Entra al modo privilegiado.</strong> Escribe <code>enable</code>. Verifica que el prompt cambie a <code>Router#</code>.</li>
      <li><strong>Entra a configuración global.</strong> Escribe <code>configure terminal</code>. Verifica que el prompt cambie a <code>Router(config)#</code>.</li>
      <li><strong>Cambia el nombre del router.</strong> Usa <code>hostname R611</code> o un nombre corto relacionado con tu equipo.</li>
      <li><strong>Revisa la configuración.</strong> Ejecuta <code>show running-config</code> y localiza el nombre asignado.</li>
      <li><strong>Guarda la configuración.</strong> Ejecuta <code>copy running-config startup-config</code>.</li>
    </ol>
  `
};

document.addEventListener('DOMContentLoaded', iniciarActividad);

async function iniciarActividad(){
  prepararNavegacion();
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if(!id){ mostrarDetalleError('No se encontró la actividad.'); return; }

  const perfil = await perfilActual();
  if(!perfil){ mostrarDetalleError('No se pudo validar la sesión.'); return; }

  const { data: alumno, error: alumnoError } = await sbAuth
    .from('alumnos')
    .select('id, grupo_id, grupos(nombre)')
    .eq('perfil_id', perfil.id)
    .single();

  if(alumnoError || !alumno){ mostrarDetalleError('No se encontró tu registro de alumno.'); return; }
  alumnoActual = alumno;

  const { data, error } = await sbAuth
    .from('modulo_actividades')
    .select('*')
    .eq('id', id)
    .eq('publicada', true)
    .single();

  if(error || !data){ console.error(error); mostrarDetalleError('La actividad no está disponible.'); return; }
  actividadActual = completarActividad(data);
  pintarActividad(actividadActual);
  prepararEntrega();
}

function completarActividad(data){
  const esRA21A = (data.codigo || '').includes('RA21-A') || /ios/i.test(data.titulo || '');
  if(!esRA21A) return data;
  return {
    ...data,
    apuntes_html: htmlSeguro(data.apuntes_html) || fallbackRA21A.apuntes_html,
    diagramas_html: htmlSeguro(data.diagramas_html) || fallbackRA21A.diagramas_html,
    ejemplo_html: htmlSeguro(data.ejemplo_html) || fallbackRA21A.ejemplo_html,
    ejercicios_html: htmlSeguro(data.ejercicios_html) || fallbackRA21A.ejercicios_html,
    practica_html: htmlSeguro(data.practica_html) || fallbackRA21A.practica_html
  };
}

function pintarActividad(a){
  const header = document.getElementById('actividadEncabezado');
  const shell = document.getElementById('learningShell');
  if(!header) return;

  header.innerHTML = `
    <div class="breadcrumb">Alumno · ${esc(a.modulo)} · ${esc(a.grupo)} · ${esc(a.codigo || 'Actividad')}</div>
    <h2>${esc(a.titulo)}</h2>
    <p>${esc(a.descripcion || '')}</p>
    <div class="activity-meta-row">
      <span class="badge blue">${esc(a.unidad || 'Unidad 2')}</span>
      <span class="badge warn">${esc(a.ra || 'R.A. 2.1')}</span>
      <span class="badge">${esc(a.tipo || 'Cuaderno práctico')}</span>
    </div>
  `;

  llenarPagina('apuntes', 'Información', 'Apuntes de clase', a.apuntes_html, 'Marca esta sección cuando hayas entendido los conceptos principales.');
  llenarPagina('diagramas', 'Diagramas', 'Dibujos y esquemas', a.diagramas_html, 'Observa cómo se relacionan los dispositivos y los modos IOS.');
  llenarPagina('ejemplo', 'Ejemplo', 'Ejemplo resuelto', a.ejemplo_html, 'Revisa el procedimiento antes de intentar resolver los ejercicios.');
  llenarPagina('ejercicios', 'Ejercicios', 'Ejercicios de análisis', construirEjerciciosInteractivos(a.ejercicios_html), 'Responde aquí mismo. No busques una respuesta perfecta: explica tu razonamiento.');
  llenarPagina('practica', 'Práctica', 'Práctica guiada paso a paso', construirPracticaInteractiva(a.practica_html), 'Trabaja en Packet Tracer y registra tu avance dentro del cuaderno.');

  shell?.classList.remove('hidden');
  actualizarProgreso();
}

function llenarPagina(key, etiqueta, titulo, html, ayuda){
  const page = document.querySelector(`[data-section="${key}"]`);
  if(!page) return;
  page.innerHTML = `
    <div class="section-heading">
      <span class="label-pill">${esc(etiqueta)}</span>
      <h3>${esc(titulo)}</h3>
      <p>${esc(ayuda)}</p>
    </div>
    <div class="content-block">${htmlSeguro(html) || '<p>Contenido pendiente.</p>'}</div>
    <div class="page-actions">
      <label class="done-check"><input type="checkbox" data-done="${key}"> Ya revisé esta sección</label>
      <button class="btn small" type="button" data-next>Continuar</button>
    </div>
  `;
}


function construirEjerciciosInteractivos(html){
  const base = htmlSeguro(html) || fallbackRA21A.ejercicios_html;
  return `
    <div class="work-instructions">
      <strong>Modo análisis:</strong> primero lee el caso. Después usa el simulador IOS para probar comandos. El sistema no te da la respuesta final; revisa si tu secuencia tiene sentido técnico.
    </div>
    ${base}
    <section class="ios-simulator" id="simuladorIOS">
      <div class="sim-head">
        <div>
          <span class="label-pill">Simulador IOS</span>
          <h4>Consola de práctica: prepara el router del laboratorio</h4>
          <p>Escribe comandos como si estuvieras en Packet Tracer. El simulador valida el modo IOS, detecta errores comunes y te orienta sin resolverte la práctica completa.</p>
        </div>
        <button class="btn small" type="button" data-ios-reset>Reiniciar simulador</button>
      </div>
      <div class="sim-scenario">
        <strong>Situación:</strong> recibes un router nuevo para el grupo 611. Necesitas entrar al modo correcto, cambiar su nombre, revisar la configuración y guardar los cambios antes de entregarlo al laboratorio.
      </div>
      <div class="terminal-window">
        <div class="terminal-title"><span></span><span></span><span></span> Cisco IOS Simulator</div>
        <pre id="iosTerminalOutput" class="terminal-output">Router&gt; </pre>
        <div class="terminal-input-row">
          <span id="iosPrompt">Router&gt;</span>
          <input id="iosCommandInput" class="terminal-input" autocomplete="off" spellcheck="false" placeholder="Escribe un comando y presiona Enter">
          <button class="btn small primary" type="button" data-run-ios>Ejecutar</button>
        </div>
      </div>
      <div class="sim-evaluation" id="iosEvaluation">
        <h4>Evaluación automática del simulador</h4>
        <ul>
          <li data-check="priv">Entrar al modo privilegiado con <code>enable</code>.</li>
          <li data-check="config">Entrar a configuración global con <code>configure terminal</code>.</li>
          <li data-check="host">Cambiar el nombre del router con <code>hostname</code>.</li>
          <li data-check="show">Verificar con un comando <code>show</code>.</li>
          <li data-check="save">Guardar la configuración con <code>copy running-config startup-config</code>.</li>
        </ul>
        <div id="iosFeedback" class="sim-feedback">Empieza escribiendo <code>enable</code> en la consola.</div>
      </div>
    </section>
    <div class="student-workbook" id="ejerciciosInteractivos">
      ${[1,2,3,4].map(n => `
        <label class="field answer-field">
          <span>Tu análisis del caso ${n}</span>
          <textarea class="textarea workbook-answer" data-answer="ejercicio_${n}" placeholder="Explica tu razonamiento. Menciona comandos, modo IOS, evidencia o concepto técnico si aplica."></textarea>
        </label>
      `).join('')}
    </div>
  `;
}


function construirPracticaInteractiva(html){
  const base = htmlSeguro(html) || fallbackRA21A.practica_html;
  return `
    <div class="case-file">
      <span class="label-pill">Caso realista</span>
      <h4>Problema: router sin identificar en el laboratorio</h4>
      <p>El laboratorio recibió un router Cisco para prácticas, pero nadie dejó documentado cómo entrar, en qué modo se encuentra ni si la configuración queda guardada al apagarlo. Tu tarea es prepararlo para el grupo 611, dejar evidencia de cada paso y explicar por qué realizaste cada comando.</p>
      <div class="case-goal-grid">
        <article><strong>Objetivo técnico</strong><p>Entrar al IOS, reconocer modos, nombrar el dispositivo, revisar configuración y guardar cambios.</p></article>
        <article><strong>Restricción</strong><p>No basta con capturas: debes explicar qué comprobaste y por qué.</p></article>
        <article><strong>Entrega esperada</strong><p>Archivo .pkt, bitácora y respuestas de análisis dentro del sistema.</p></article>
      </div>
    </div>
    ${base}
    <div class="practice-board advanced">
      <h4>Checklist de laboratorio</h4>
      <label><input type="checkbox" data-lab-check> Abrí Packet Tracer y guardé el archivo con el nombre solicitado.</label>
      <label><input type="checkbox" data-lab-check> Abrí la consola CLI y reconocí el prompt inicial.</label>
      <label><input type="checkbox" data-lab-check> Entré al modo privilegiado con <code>enable</code>.</label>
      <label><input type="checkbox" data-lab-check> Entré a configuración global con <code>configure terminal</code>.</label>
      <label><input type="checkbox" data-lab-check> Cambié el hostname siguiendo una nomenclatura clara.</label>
      <label><input type="checkbox" data-lab-check> Usé al menos un comando <code>show</code> para comprobar resultados.</label>
      <label><input type="checkbox" data-lab-check> Guardé la configuración con <code>copy running-config startup-config</code>.</label>
      <label><input type="checkbox" data-lab-check> Redacté en la bitácora qué hice, qué observé y qué corregiría si fallara.</label>
    </div>
    <label class="field answer-field">
      <span>Bitácora de laboratorio</span>
      <textarea class="textarea workbook-answer" data-answer="bitacora_practica" placeholder="Describe lo que hiciste en Packet Tracer. Incluye comandos, modo IOS, verificaciones y resultado observado."></textarea>
    </label>
  `;
}


const iosSimState = { mode:'user', hostname:'Router', saved:false, checks:{priv:false,config:false,host:false,show:false,save:false}, history:[] };

function promptIOS(){
  if(iosSimState.mode === 'config') return `${iosSimState.hostname}(config)#`;
  if(iosSimState.mode === 'priv') return `${iosSimState.hostname}#`;
  return `${iosSimState.hostname}>`;
}

function resetIOSSimulator(){
  iosSimState.mode = 'user';
  iosSimState.hostname = 'Router';
  iosSimState.saved = false;
  iosSimState.checks = {priv:false,config:false,host:false,show:false,save:false};
  iosSimState.history = [];
  const out = document.getElementById('iosTerminalOutput');
  if(out) out.textContent = `${promptIOS()} `;
  const input = document.getElementById('iosCommandInput');
  if(input) input.value = '';
  actualizarPromptIOS();
  actualizarEvaluacionIOS('Simulador reiniciado. Comienza con enable.');
}

function ejecutarComandoIOS(){
  const input = document.getElementById('iosCommandInput');
  const out = document.getElementById('iosTerminalOutput');
  if(!input || !out) return;
  const raw = input.value.trim();
  if(!raw) return;
  const cmd = raw.replace(/\s+/g,' ');
  iosSimState.history.push(cmd);
  let respuesta = procesarComandoIOS(cmd);
  out.textContent += `${cmd}\n${respuesta}${promptIOS()} `;
  out.scrollTop = out.scrollHeight;
  input.value = '';
  actualizarPromptIOS();
  actualizarProgreso();
}

function procesarComandoIOS(cmd){
  const lower = cmd.toLowerCase();
  if(lower === '?' || lower === 'help') return ayudaPorModo();
  if(lower === 'clear') { resetIOSSimulator(); return ''; }

  if(iosSimState.mode === 'user'){
    if(lower === 'enable' || lower === 'en'){
      iosSimState.mode = 'priv';
      iosSimState.checks.priv = true;
      actualizarEvaluacionIOS('Correcto: ahora estás en modo privilegiado. Observa que el prompt cambió a #.');
      return '';
    }
    if(lower.startsWith('configure')) return '% Invalid input: primero debes entrar al modo privilegiado con enable.\n';
    if(lower.startsWith('show')) return '% Comando limitado en modo usuario. Para esta práctica entra con enable.\n';
    return '% Comando no reconocido en modo usuario. Pista: inicia con enable.\n';
  }

  if(iosSimState.mode === 'priv'){
    if(lower === 'configure terminal' || lower === 'conf t'){
      iosSimState.mode = 'config';
      iosSimState.checks.config = true;
      actualizarEvaluacionIOS('Bien: entraste a configuración global. Aquí sí puedes modificar parámetros del dispositivo.');
      return 'Enter configuration commands, one per line. End with CNTL/Z.\n';
    }
    if(lower === 'disable'){
      iosSimState.mode = 'user';
      actualizarEvaluacionIOS('Volviste al modo usuario.');
      return '';
    }
    if(lower === 'show running-config' || lower === 'show run'){
      iosSimState.checks.show = true;
      actualizarEvaluacionIOS('Correcto: usaste un comando show para verificar la configuración activa.');
      return `Building configuration...\n\nCurrent configuration:\n!\nhostname ${iosSimState.hostname}\n!\nline console 0\n!\nend\n`;
    }
    if(lower === 'show startup-config' || lower === 'show start'){
      iosSimState.checks.show = true;
      return iosSimState.saved ? `Using 1024 out of 262144 bytes\n!\nhostname ${iosSimState.hostname}\n!\nend\n` : '% Startup-config is not present. Aún no has guardado la configuración.\n';
    }
    if(lower === 'show ip interface brief'){
      iosSimState.checks.show = true;
      actualizarEvaluacionIOS('Bien: show ip interface brief sirve para revisar interfaces y estado.');
      return 'Interface              IP-Address      OK? Method Status                Protocol\nGigabitEthernet0/0     unassigned      YES unset  administratively down down\nGigabitEthernet0/1     unassigned      YES unset  administratively down down\n';
    }
    if(lower === 'copy running-config startup-config' || lower === 'copy run start' || lower === 'wr'){
      iosSimState.saved = true;
      iosSimState.checks.save = true;
      actualizarEvaluacionIOS('Excelente: guardaste la running-config como startup-config.');
      return 'Destination filename [startup-config]? \nBuilding configuration...\n[OK]\n';
    }
    if(lower.startsWith('hostname')) return '% El comando hostname se ejecuta desde configuración global: configure terminal.\n';
    return '% Comando no reconocido en modo privilegiado. Prueba configure terminal, show running-config o copy running-config startup-config.\n';
  }

  if(iosSimState.mode === 'config'){
    if(lower === 'exit' || lower === 'end'){
      iosSimState.mode = 'priv';
      actualizarEvaluacionIOS('Saliste de configuración global. Ahora puedes verificar con show running-config.');
      return '';
    }
    if(lower.startsWith('hostname ')){
      const nuevo = cmd.split(' ').slice(1).join('-').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,18);
      if(!nuevo) return '% Hostname inválido. Usa un nombre corto, por ejemplo: hostname R611.\n';
      iosSimState.hostname = nuevo;
      iosSimState.checks.host = true;
      actualizarEvaluacionIOS(`Correcto: cambiaste el hostname a ${nuevo}. El prompt es evidencia inmediata del cambio.`);
      return '';
    }
    if(lower.startsWith('show')) return '% Los comandos show normalmente se ejecutan en modo privilegiado. Usa end y luego show running-config.\n';
    if(lower === 'enable') return '% Ya estás configurando el dispositivo. Para volver usa end.\n';
    return '% Comando no reconocido en configuración global. Para esta práctica usa hostname o end.\n';
  }
  return '';
}

function ayudaPorModo(){
  if(iosSimState.mode === 'user') return 'Comandos sugeridos: enable\n';
  if(iosSimState.mode === 'priv') return 'Comandos sugeridos: configure terminal | show running-config | show ip interface brief | copy running-config startup-config\n';
  return 'Comandos sugeridos: hostname R611 | end | exit\n';
}

function actualizarPromptIOS(){
  const p = document.getElementById('iosPrompt');
  if(p) p.textContent = promptIOS();
}

function actualizarEvaluacionIOS(mensaje){
  Object.entries(iosSimState.checks).forEach(([key,val]) => {
    const item = document.querySelector(`[data-check="${key}"]`);
    if(item) item.classList.toggle('ok', !!val);
  });
  const f = document.getElementById('iosFeedback');
  if(f) f.innerHTML = mensaje;
}

function prepararNavegacion(){
  document.querySelectorAll('[data-section-target]').forEach(btn => {
    btn.addEventListener('click', () => mostrarSeccion(btn.dataset.sectionTarget));
  });
  document.addEventListener('click', (event) => {
    if(event.target.matches('[data-next]')){
      const actual = document.querySelector('[data-section]:not(.hidden)')?.dataset.section;
      const idx = seccionesOrden.indexOf(actual);
      mostrarSeccion(seccionesOrden[Math.min(idx + 1, seccionesOrden.length - 1)] || 'entrega');
    }
    if(event.target.matches('[data-run-ios]')) ejecutarComandoIOS();
    if(event.target.matches('[data-ios-reset]')) resetIOSSimulator();
  });
  document.addEventListener('keydown', (event) => {
    if(event.key === 'Enter' && event.target?.id === 'iosCommandInput'){
      event.preventDefault();
      ejecutarComandoIOS();
    }
  });
  document.addEventListener('change', (event) => {
    if(event.target.matches('[data-done], [data-lab-check]')) actualizarProgreso();
  });
  document.addEventListener('input', (event) => {
    if(event.target.matches('.workbook-answer')){
      respuestasCuaderno.set(event.target.dataset.answer, event.target.value.trim());
      actualizarProgreso();
    }
  });
}

function mostrarSeccion(target){
  document.querySelectorAll('[data-section-target]').forEach(b => b.classList.toggle('active', b.dataset.sectionTarget === target));
  document.querySelectorAll('[data-section]').forEach(section => section.classList.toggle('hidden', section.dataset.section !== target));
  document.querySelector(`[data-section="${target}"]`)?.scrollIntoView({ behavior:'smooth', block:'start' });
}

function actualizarProgreso(){
  const totalDone = document.querySelectorAll('[data-done]').length || 5;
  const checkedDone = document.querySelectorAll('[data-done]:checked').length;
  const answers = Array.from(document.querySelectorAll('.workbook-answer')).filter(t => t.value.trim().length >= 40).length;
  const lab = document.querySelectorAll('[data-lab-check]').length ? Math.round((document.querySelectorAll('[data-lab-check]:checked').length / document.querySelectorAll('[data-lab-check]').length) * 2) : 0;
  const score = Math.min(totalDone + 6, checkedDone + answers + lab);
  const percent = Math.round((score / (totalDone + 6)) * 100);
  const bar = document.getElementById('progressBar');
  const text = document.getElementById('progressText');
  if(bar) bar.style.width = `${percent}%`;
  if(text) text.textContent = `${percent}% completado`;
}

function prepararEntrega(){
  const form = document.getElementById('formEntrega');
  const btnRevision = document.getElementById('btnRevision');
  if(!form || form.dataset.ready === 'true') return;
  form.dataset.ready = 'true';

  btnRevision?.addEventListener('click', () => mostrarRevisionPrevia(true));
  form.addEventListener('input', () => mostrarRevisionPrevia(false));

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if(!actividadActual || !alumnoActual){ setStatus('No se pudo preparar la entrega.', 'error'); return; }

    const bitacora = document.getElementById('bitacoraTexto').value.trim();
    const archivo = document.getElementById('entregaArchivo').files[0];
    const respuestas = recopilarRespuestas();
    const revision = generarRevisionLocal(respuestas, bitacora);

    if(revision.alertas.length){
      mostrarRevisionPrevia(true);
      setStatus('Tu trabajo todavía necesita más detalle antes de entregarlo.', 'error');
      return;
    }

    setStatus('Preparando envío...', 'info');
    let archivoUrl = null;
    let archivoNombre = null;

    if(archivo){
      archivoNombre = archivo.name;
      const ruta = `${actividadActual.modulo}/${actividadActual.grupo}/actividad-${actividadActual.id}/alumno-${alumnoActual.id}/${Date.now()}-${limpiarNombre(archivo.name)}`;
      const { error: uploadError } = await sbAuth.storage.from('evidencias').upload(ruta, archivo, { upsert: true });
      if(uploadError){ console.warn(uploadError); archivoUrl = null; }
      else archivoUrl = ruta;
    }

    const texto = `RESPUESTAS DEL CUADERNO:\n${respuestas}\n\nBITÁCORA FINAL:\n${bitacora}\n\nREVISIÓN PRELIMINAR:\n${revision.mensaje}`;
    const guardado = await registrarEntrega(texto, archivoNombre, archivoUrl, revision.mensaje);
    if(!guardado.ok){ console.error(guardado.error); setStatus('No se pudo registrar la entrega. Revisa permisos o tabla de entregas.', 'error'); return; }

    setStatus('Trabajo enviado correctamente. Tu docente podrá revisarlo y complementar la retroalimentación.', 'info');
    form.reset();
    document.querySelectorAll('.workbook-answer').forEach(t => { t.value = ''; });
    document.getElementById('revisionPrevia')?.classList.add('hidden');
    actualizarProgreso();
  });
}

async function registrarEntrega(texto, archivoNombre, archivoUrl, retroalimentacion){
  const payloadModulo = {
    actividad_id: actividadActual.id,
    alumno_id: alumnoActual.id,
    modulo: actividadActual.modulo,
    texto,
    archivo_nombre: archivoNombre,
    archivo_url: archivoUrl,
    estado: 'entregada',
    retroalimentacion
  };

  let res = await sbAuth.from('modulo_entregas').insert(payloadModulo);
  if(!res.error) return { ok:true };

  const payloadEntregas = {
    actividad_id: actividadActual.id,
    alumno_id: alumnoActual.id,
    texto,
    archivo_nombre: archivoNombre,
    archivo_url: archivoUrl,
    estado: 'entregada',
    retroalimentacion
  };
  res = await sbAuth.from('entregas').insert(payloadEntregas);
  if(!res.error) return { ok:true };

  return { ok:false, error: res.error };
}

function recopilarRespuestas(){
  const pares = [];
  document.querySelectorAll('.workbook-answer').forEach((campo, i) => {
    const titulo = campo.closest('.field')?.querySelector('span')?.textContent || `Respuesta ${i+1}`;
    pares.push(`${titulo}:\n${campo.value.trim() || '[Sin respuesta]'}`);
  });
  return pares.join('\n\n');
}

function mostrarRevisionPrevia(forzar = false){
  const box = document.getElementById('revisionPrevia');
  if(!box) return;
  const bitacora = document.getElementById('bitacoraTexto')?.value.trim() || '';
  const respuestas = recopilarRespuestas();
  if(!forzar && (bitacora + respuestas).replace(/\[Sin respuesta\]/g,'').length < 90){ box.classList.add('hidden'); return; }
  const revision = generarRevisionLocal(respuestas, bitacora);
  box.innerHTML = `<strong>Revisión preliminar</strong><p>${esc(revision.mensaje)}</p>${revision.alertas.length ? `<ul>${revision.alertas.map(a => `<li>${esc(a)}</li>`).join('')}</ul>` : '<p>Tu trabajo tiene elementos mínimos para enviarse. La revisión final queda pendiente para el docente.</p>'}`;
  box.classList.remove('hidden');
}

function generarRevisionLocal(respuestas, bitacora){
  const texto = `${respuestas} ${bitacora}`.toLowerCase();
  const alertas = [];
  const respuestasValidas = Array.from(document.querySelectorAll('.workbook-answer')).filter(t => t.value.trim().length >= 40).length;
  if(respuestasValidas < 3) alertas.push('Contesta al menos tres apartados del cuaderno con explicaciones completas.');
  if(bitacora.length < 100) alertas.push('Amplía la bitácora final: incluye qué hiciste, qué comandos usaste y qué comprobaste.');
  if(!/enable|configure terminal|hostname|show|ping|running-config|startup-config|ssh|telnet/.test(texto)) alertas.push('Incluye comandos o conceptos IOS relacionados con la actividad.');
  if(!/porque|por qué|para que|verificar|comprobar|confirmar|evidencia|resultado/.test(texto)) alertas.push('Justifica tus decisiones; evita escribir solo una lista de pasos.');
  const mensaje = alertas.length
    ? 'Tu trabajo todavía parece incompleto para una revisión de razonamiento. Atiende las observaciones antes de enviarlo.'
    : 'Tu trabajo incluye respuestas, bitácora y referencias técnicas. Esta revisión preliminar no sustituye la evaluación del docente.';
  return { alertas, mensaje };
}

function mostrarDetalleError(texto){
  const box = document.getElementById('actividadEncabezado');
  if(box) box.innerHTML = `<div class="breadcrumb">Actividad</div><h2>No disponible</h2><p>${esc(texto)}</p>`;
}

function setStatus(texto, tipo='info'){
  const box = document.getElementById('entregaStatus');
  if(!box) return;
  box.textContent = texto;
  box.dataset.type = tipo;
  box.classList.remove('hidden');
}

function limpiarNombre(nombre){ return nombre.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9._-]/g,'_'); }
function htmlSeguro(v){ return String(v || '').trim(); }
function esc(v){ return String(v ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
