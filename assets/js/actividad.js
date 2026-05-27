let actividadActual = null;
let alumnoActual = null;

document.addEventListener('DOMContentLoaded', iniciarActividad);

async function iniciarActividad(){
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if(!id){ mostrarDetalleError('No se encontró la actividad.'); return; }

  const perfil = await perfilActual();
  if(!perfil){ mostrarDetalleError('No se pudo validar la sesión.'); return; }

  const { data: alumno } = await sbAuth
    .from('alumnos')
    .select('id, grupo_id, grupos(nombre)')
    .eq('perfil_id', perfil.id)
    .single();
  alumnoActual = alumno;

  const { data, error } = await sbAuth
    .from('modulo_actividades')
    .select('*')
    .eq('id', id)
    .eq('publicada', true)
    .single();

  if(error || !data){ mostrarDetalleError('La actividad no está disponible.'); return; }
  actividadActual = data;
  pintarActividad(data);
  prepararEntrega();
}

function pintarActividad(a){
  const box = document.getElementById('actividadDetalle');
  if(!box) return;
  box.innerHTML = `
    <div class="breadcrumb">Alumno · ${esc(a.modulo)} · ${esc(a.grupo)}</div>
    <h2>${esc(a.titulo)}</h2>
    <p>${esc(a.descripcion || '')}</p>
    <div class="activity-instructions">
      <h3>Instrucciones</h3>
      <p>${esc(a.instrucciones || '').replace(/\n/g, '<br>')}</p>
    </div>
    <div class="tabs">
      <span class="tab active">${esc(a.tipo || 'Actividad')}</span>
      <span class="tab">Evidencia: ${esc(a.evidencia_requerida || 'No especificada')}</span>
    </div>
  `;
}

function prepararEntrega(){
  const form = document.getElementById('formEntrega');
  if(!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if(!actividadActual || !alumnoActual){ setStatus('No se pudo preparar la entrega.', 'error'); return; }
    const texto = document.getElementById('entregaTexto').value.trim();
    const archivo = document.getElementById('entregaArchivo').files[0];
    if(!texto){ setStatus('Escribe la explicación de tu procedimiento.', 'error'); return; }

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

    const { error } = await sbAuth.from('modulo_entregas').insert({
      actividad_id: actividadActual.id,
      alumno_id: alumnoActual.id,
      modulo: actividadActual.modulo,
      texto,
      archivo_nombre: archivoNombre,
      archivo_url: archivoUrl,
      estado: 'entregada'
    });

    if(error){ console.error(error); setStatus('No se pudo registrar la entrega.', 'error'); return; }
    form.reset();
    setStatus('Evidencia enviada correctamente.', 'info');
  });
}

function mostrarDetalleError(texto){
  const box = document.getElementById('actividadDetalle');
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
function esc(v){ return String(v ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
