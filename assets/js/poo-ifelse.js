const supa = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let inicioActividad = Date.now();
let eventosPegado = 0;
const codigo = document.getElementById('codigo');
const salida = document.getElementById('salida');
const pruebas = document.getElementById('pruebas');
const estadoEnvio = document.getElementById('estadoEnvio');

codigo.addEventListener('paste', () => eventosPegado++);

document.getElementById('ejecutar').addEventListener('click', ejecutarCodigo);
document.getElementById('formActividad').addEventListener('submit', enviarEvidencia);

function ejecutarCodigo(){
  const logs = [];
  const originalLog = console.log;
  salida.textContent = '';
  pruebas.innerHTML = '';
  try{
    console.log = (...args) => logs.push(args.join(' '));
    new Function(codigo.value)();
    console.log = originalLog;
    salida.textContent = logs.length ? logs.join('\n') : 'El código se ejecutó sin mostrar salida.';
    validarCodigo(codigo.value, logs.join(' '));
  }catch(error){
    console.log = originalLog;
    salida.textContent = error.message;
    pintarPrueba('El código debe ejecutarse sin errores', false);
  }
}

function validarCodigo(texto, resultado){
  pintarPrueba('Usa una estructura if', /\bif\s*\(/.test(texto));
  pintarPrueba('Usa una alternativa else', /\belse\b/.test(texto));
  pintarPrueba('Muestra una salida con console.log', /console\.log\s*\(/.test(texto));
  pintarPrueba('La salida está relacionada con descuento o precio normal', /descuento|precio|normal|aplica/i.test(resultado));
}

function pintarPrueba(texto, ok){
  const div = document.createElement('div');
  div.className = `test ${ok ? 'ok' : 'bad'}`;
  div.textContent = `${ok ? '✓' : '•'} ${texto}`;
  pruebas.appendChild(div);
}

async function enviarEvidencia(event){
  event.preventDefault();
  ejecutarCodigo();
  const payload = {
    nombre: document.getElementById('nombre').value.trim(),
    grupo: document.getElementById('grupo').value,
    modulo: 'POO',
    actividad: 'if_else_tienda_descuento',
    explicacion: document.getElementById('explicacion').value.trim(),
    codigo: codigo.value,
    salida: salida.textContent,
    tiempo_segundos: Math.round((Date.now() - inicioActividad) / 1000),
    eventos_pegado: eventosPegado,
    creado_en: new Date().toISOString()
  };
  estadoEnvio.classList.remove('hidden');
  estadoEnvio.textContent = 'Enviando evidencia';
  const { error } = await supa.from('respuestas_simulador').insert(payload);
  if(error){
    estadoEnvio.textContent = 'No se pudo enviar la evidencia';
    console.error(error);
    return;
  }
  estadoEnvio.textContent = 'Evidencia enviada correctamente';
}
