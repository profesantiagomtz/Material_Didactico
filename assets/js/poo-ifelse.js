const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const inicio = Date.now();
let pasteCount = 0;
let lastTestResult = null;

const codigoEl = document.getElementById('codigo');
const salidaEl = document.getElementById('salida');
const pruebasEl = document.getElementById('pruebas');

codigoEl.addEventListener('paste', () => pasteCount++);

function ejecutarEnSandbox(code, runTests = false){
  return new Promise((resolve) => {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('sandbox', 'allow-scripts');
    iframe.style.display = 'none';

    const tests = `
      const pruebas = [];
      if (typeof clasificarCliente !== 'function') {
        pruebas.push({ok:false, msg:'No existe la función clasificarCliente(edad).'});
      } else {
        const casos = [
          {edad:8, esperado:'infantil'},
          {edad:12, esperado:'general'},
          {edad:30, esperado:'general'},
          {edad:60, esperado:'adulto mayor'},
          {edad:75, esperado:'adulto mayor'}
        ];
        for (const c of casos) {
          let obtenido;
          try { obtenido = clasificarCliente(c.edad); }
          catch(e){ obtenido = 'ERROR: ' + e.message; }
          pruebas.push({
            ok: obtenido === c.esperado,
            msg: 'edad ' + c.edad + ' → esperado: ' + c.esperado + ', obtenido: ' + obtenido
          });
        }
      }
      window.parent.postMessage({type:'sandbox-result', logs, pruebas}, '*');
    `;

    const html = `
      <script>
        const logs = [];
        console.log = (...args) => logs.push(args.join(' '));
        console.error = (...args) => logs.push('ERROR: ' + args.join(' '));
        try {
          ${code}
          ${runTests ? tests : "window.parent.postMessage({type:'sandbox-result', logs, pruebas:null}, '*');"}
        } catch (e) {
          window.parent.postMessage({type:'sandbox-error', error:e.message, logs}, '*');
        }
      <\/script>
    `;

    const timer = setTimeout(() => {
      iframe.remove();
      resolve({error:'Tiempo agotado. Revisa si tu código tiene un ciclo infinito.', logs:[], pruebas:null});
    }, 2500);

    function handler(event){
      if(!event.data || !String(event.data.type).startsWith('sandbox')) return;
      clearTimeout(timer);
      window.removeEventListener('message', handler);
      iframe.remove();

      if(event.data.type === 'sandbox-error'){
        resolve({error:event.data.error, logs:event.data.logs || [], pruebas:null});
      }else{
        resolve({error:null, logs:event.data.logs || [], pruebas:event.data.pruebas});
      }
    }

    window.addEventListener('message', handler);
    iframe.srcdoc = html;
    document.body.appendChild(iframe);
  });
}

document.getElementById('btnEjecutar').addEventListener('click', async () => {
  salidaEl.textContent = 'Ejecutando...';
  const result = await ejecutarEnSandbox(codigoEl.value, false);
  salidaEl.textContent = result.error ? 'ERROR: ' + result.error : (result.logs.join('\n') || 'El programa no imprimió nada.');
});

document.getElementById('btnProbar').addEventListener('click', async () => {
  pruebasEl.textContent = 'Probando...';
  const result = await ejecutarEnSandbox(codigoEl.value, true);
  if(result.error){
    pruebasEl.textContent = 'ERROR: ' + result.error;
    lastTestResult = {score:0, detalle:result.error};
    return;
  }

  const pruebas = result.pruebas || [];
  const correctas = pruebas.filter(p => p.ok).length;
  const score = pruebas.length ? Math.round((correctas / pruebas.length) * 100) : 0;

  lastTestResult = {
    score,
    correctas,
    total: pruebas.length,
    detalle: pruebas.map(p => `${p.ok ? '✅' : '❌'} ${p.msg}`).join('\n')
  };

  pruebasEl.textContent =
    `Resultado: ${score}/100\n\n` + lastTestResult.detalle;
});

document.getElementById('btnGuardar').addEventListener('click', async () => {
  const nombre = document.getElementById('nombre').value.trim();
  const grupo = document.getElementById('grupo').value.trim();
  const explicacion = document.getElementById('explicacion').value.trim();
  const code = codigoEl.value;
  const segundos = Math.round((Date.now() - inicio) / 1000);
  const out = document.getElementById('guardarResultado');

  if(!nombre || !grupo || !explicacion || !code){
    out.textContent = '⚠️ Completa nombre, grupo, explicación y código.';
    return;
  }

  if(!lastTestResult){
    out.textContent = '⚠️ Primero ejecuta las pruebas automáticas.';
    return;
  }

  const autenticidad = {
    segundos_trabajo: segundos,
    veces_pegado: pasteCount,
    alerta_tiempo: segundos < 60,
    alerta_pegado: pasteCount > 0,
    nota: 'Estos datos no sancionan automáticamente; solo orientan al docente.'
  };

  const payload = {
    nombre,
    grupo,
    modulo: 'POO',
    actividad: 'if_else_tienda_descuentos',
    codigo: code,
    explicacion,
    resultado_pruebas: lastTestResult,
    autenticidad
  };

  try{
    const { error } = await supabaseClient
      .from('respuestas_simulador')
      .insert(payload);

    if(error) throw error;

    out.textContent =
      `✅ Entrega guardada.\nCalificación técnica automática: ${lastTestResult.score}/100\n` +
      `Tiempo: ${segundos} segundos · Pegados detectados: ${pasteCount}`;
  }catch(err){
    console.error(err);
    out.textContent =
      '🔴 No se pudo guardar en Supabase. Revisa que exista la tabla respuestas_simulador y permisos.';
  }
});
