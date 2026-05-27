let actividadActual = null;
let alumnoActual = null;

document.addEventListener('DOMContentLoaded', iniciarActividad);

async function iniciarActividad(){
  prepararTabs();
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
  actividadActual = data;
  pintarActividad(data);
  prepararEntrega();
}

function pintarActividad(a){
  const header = document.getElementById('actividadEncabezado');
  const contenido = document.getElementById('actividadContenido');
  const tabs = document.getElementById('actividadTabsWrap');
  if(!header || !contenido) return;

  header.innerHTML = `
    <div class="breadcrumb">Alumno · ${esc(a.modulo)} · ${esc(a.grupo)} · ${esc(a.codigo || 'Actividad')}</div>
    <h2>${esc(a.titulo)}</h2>
    <p>${esc(a.descripcion || '')}</p>
    <div class="activity-meta-row">
      <span class="badge blue">${esc(a.unidad || 'Unidad 2')}</span>
      <span class="badge warn">${esc(a.ra || 'R.A. 2.1')}</span>
      <span class="badge">${esc(a.tipo || 'Actividad')}</span>
    </div>
  `;

  const apuntes = htmlSeguro(a.apuntes_html) || `<p>${esc(a.instrucciones || 'Sin apuntes registrados.')}</p>`;
  const diagramas = htmlSeguro(a.diagramas_html) || '<p>No hay diagramas registrados para esta actividad.</p>';
  const ejemplo = htmlSeguro(a.ejemplo_html) || '<p>No hay ejemplo registrado para esta actividad.</p>';
  const ejercicios = htmlSeguro(a.ejercicios_html) || '<p>No hay ejercicios registrados para esta actividad.</p>';
  const practica = htmlSeguro(a.practica_html) || '<p>No hay práctica guiada registrada para esta actividad.</p>';

  contenido.innerHTML = `
    <section class="activity-section paper-card" data-section="apuntes">
      <div class="section-heading"><span class="label-pill">Información</span><h3>Apuntes de clase</h3></div>
      <div class="content-block">${apuntes}</div>
    </section>
    <section class="activity-section paper-card hidden" data-section="diagramas">
      <div class="section-heading"><span class="label-pill">Diagramas</span><h3>Dibujos y esquemas</h3></div>
      <div class="content-block">${diagramas}</div>
    </section>
    <section class="activity-section paper-card hidden" data-section="ejemplo">
      <div class="section-heading"><span class="label-pill">Ejemplo</span><h3>Ejemplo resuelto</h3></div>
      <div class="content-block">${ejemplo}</div>
    </section>
    <section class="activity-section paper-card hidden" data-section="ejercicios">
      <div class="section-heading"><span class="label-pill">Ejercicios</span><h3>Ejercicios de análisis</h3></div>
      <div class="content-block">${ejercicios}</div>
    </section>
    <section class="activity-section paper-card hidden" data-section="practica">
      <div class="section-heading"><span class="label-pill">Práctica</span><h3>Práctica guiada paso a paso</h3></div>
      <div class="content-block">${practica}</div>
    </section>
  `;

  if(tabs) tabs.classList.remove('hidden');
}

function prepararTabs(){
  document.querySelectorAll('[data-section-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.sectionTarget;
      document.querySelectorAll('[data-section-target]').forEach(b => b.classList.toggle('active', b === btn));
      document.querySelectorAll('[data-section]').forEach(section => {
        section.classList.toggle('hidden', section.dataset.section !== target);
      });
      if(target === 'evidencia') document.getElementById('evidencia')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function prepararEntrega(){
  const form = document.getElementById('formEntrega');
  if(!form || form.dataset.ready === 'true') return;
  form.dataset.ready = 'true';

  ['analisisTexto','procedimientoTexto','reflexionTexto'].forEach(id => {
    const campo = document.getElementById(id);
    if(campo) campo.addEventListener('input', mostrarRevisionPrevia);
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if(!actividadActual || !alumnoActual){ setStatus('No se pudo preparar la entrega.', 'error'); return; }

    const analisis = document.getElementById('analisisTexto').value.trim();
    const procedimiento = document.getElementById('procedimientoTexto').value.trim();
    const reflexion = document.getElementById('reflexionTexto').value.trim();
    const archivo = document.getElementById('entregaArchivo').files[0];

    if(!analisis || !procedimiento || !reflexion){
      setStatus('Completa análisis, procedimiento y reflexión antes de entregar.', 'error');
      return;
    }

    const revision = generarRevisionLocal(analisis, procedimiento, reflexion);
    if(revision.alertas.length){
      setStatus('Tu respuesta todavía necesita más detalle. Revisa la retroalimentación preliminar antes de enviar.', 'error');
      mostrarRevisionPrevia(true);
      return;
    }

    setStatus('Enviando evidencia...', 'info');
    let archivoUrl = null;
    let archivoNombre = null;

    if(archivo){
      archivoNombre = archivo.name;
      const ruta = `${actividadActual.modulo}/${actividadActual.grupo}/actividad-${actividadActual.id}/alumno-${alumnoActual.id}/${Date.now()}-${limpiarNombre(archivo.name)}`;
      const { error: uploadError } = await sbAuth.storage.from('evidencias').upload(ruta, archivo, { upsert: true });
      if(uploadError){ console.error(uploadError); setStatus('No se pudo subir el archivo. Revisa el bucket evidencias.', 'error'); return; }
      archivoUrl = ruta;
    }

    const texto = `ANÁLISIS:\n${analisis}\n\nPROCEDIMIENTO:\n${procedimiento}\n\nREFLEXIÓN:\n${reflexion}\n\nREVISIÓN PRELIMINAR:\n${revision.mensaje}`;

    const { error } = await sbAuth.from('modulo_entregas').insert({
      actividad_id: actividadActual.id,
      alumno_id: alumnoActual.id,
      modulo: actividadActual.modulo,
      texto,
      archivo_nombre: archivoNombre,
      archivo_url: archivoUrl,
      estado: 'entregada',
      retroalimentacion: revision.mensaje
    });

    if(error){ console.error(error); setStatus('No se pudo registrar la entrega.', 'error'); return; }
    form.reset();
    document.getElementById('revisionPrevia')?.classList.add('hidden');
    setStatus('Evidencia enviada correctamente. Tu docente podrá revisarla y complementar la retroalimentación.', 'info');
  });
}

function mostrarRevisionPrevia(forzar = false){
  const box = document.getElementById('revisionPrevia');
  if(!box) return;
  const analisis = document.getElementById('analisisTexto')?.value.trim() || '';
  const procedimiento = document.getElementById('procedimientoTexto')?.value.trim() || '';
  const reflexion = document.getElementById('reflexionTexto')?.value.trim() || '';
  if(!forzar && (analisis + procedimiento + reflexion).length < 80){ box.classList.add('hidden'); return; }
  const revision = generarRevisionLocal(analisis, procedimiento, reflexion);
  box.innerHTML = `<strong>Revisión preliminar</strong><p>${esc(revision.mensaje)}</p>${revision.alertas.length ? `<ul>${revision.alertas.map(a => `<li>${esc(a)}</li>`).join('')}</ul>` : '<p>Tu respuesta tiene elementos mínimos para enviarse. La revisión final queda pendiente para el docente.</p>'}`;
  box.classList.remove('hidden');
}

function generarRevisionLocal(analisis, procedimiento, reflexion){
  const texto = `${analisis} ${procedimiento} ${reflexion}`.toLowerCase();
  const alertas = [];
  if(analisis.length < 80) alertas.push('Amplía el análisis: explica qué observaste y por qué decidiste iniciar por ahí.');
  if(procedimiento.length < 120) alertas.push('Detalla mejor el procedimiento: incluye comandos, verificaciones y resultados esperados.');
  if(reflexion.length < 60) alertas.push('Agrega una reflexión más personal: qué aprendiste y qué harías si algo fallara.');
  if(!/enable|configure terminal|hostname|show|ping|running-config|startup-config/.test(texto)) alertas.push('Incluye comandos o verificaciones de IOS relacionados con la práctica.');
  if(!/porque|por qué|para que|verificar|comprobar|confirmar|evidencia/.test(texto)) alertas.push('Justifica tus decisiones; no escribas solo una lista de pasos.');
  const mensaje = alertas.length
    ? 'La entrega todavía parece incompleta para una revisión de razonamiento. Atiende las observaciones antes de enviarla.'
    : 'La entrega incluye análisis, procedimiento, reflexión y referencias técnicas. Esta revisión no sustituye la evaluación del docente.';
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
