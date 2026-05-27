document.addEventListener('DOMContentLoaded', cargarMRDE);

async function cargarMRDE(){
  const estado = document.getElementById('mrdeEstado');
  try{
    const grupoId = await obtenerGrupo611();
    if(!grupoId){
      if(estado) estado.textContent = 'No se encontró el grupo 611';
      return;
    }

    await Promise.all([
      cargarResumenGrupo(grupoId),
      cargarActividadesMRDE()
    ]);

    prepararFormularioActividad();
    if(estado) estado.textContent = 'MRDE 611 cargado correctamente';
  }catch(error){
    if(estado) estado.textContent = 'No se pudo cargar MRDE 611';
    console.error(error);
  }
}

async function obtenerGrupo611(){
  const { data, error } = await sbAuth.from('grupos').select('id').eq('nombre','611').single();
  if(error) return null;
  return data?.id || null;
}

async function cargarResumenGrupo(grupoId){
  const { data: alumnos, error } = await sbAuth
    .from('alumnos')
    .select('id, estado, perfiles(nombre, correo, activo), alumno_accesos(modulo, habilitado)')
    .eq('grupo_id', grupoId)
    .order('id', { ascending: true });

  if(error) throw error;

  const lista = alumnos || [];
  const activos = lista.filter(a => a.estado !== 'baja' && a.perfiles?.activo !== false).length;
  const entregas = await contarTabla('modulo_entregas', 'modulo', 'MRDE');
  const actividades = await contarTabla('modulo_actividades', 'modulo', 'MRDE');

  setTexto('mrdeAlumnos', lista.length);
  setTexto('mrdeActivos', activos);
  setTexto('mrdeEvidencias', entregas);
  setTexto('mrdeActividades', actividades);
  pintarTablaMRDE(lista);
}

function prepararFormularioActividad(){
  const form = document.getElementById('formActividadMRDE');
  if(!form || form.dataset.ready === 'true') return;
  form.dataset.ready = 'true';

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = {
      modulo: 'MRDE',
      grupo: '611',
      titulo: document.getElementById('actTitulo').value.trim(),
      tipo: document.getElementById('actTipo').value,
      descripcion: document.getElementById('actDescripcion').value.trim(),
      instrucciones: document.getElementById('actInstrucciones').value.trim(),
      evidencia_requerida: document.getElementById('actEvidencia').value.trim(),
      publicada: document.getElementById('actPublicada').value === 'true'
    };

    if(!payload.titulo || !payload.descripcion || !payload.instrucciones){
      mostrarActividadStatus('Completa título, descripción e instrucciones.', 'error');
      return;
    }

    mostrarActividadStatus('Guardando actividad...', 'info');
    const { error } = await sbAuth.from('modulo_actividades').insert(payload);
    if(error){
      console.error(error);
      mostrarActividadStatus('No se pudo guardar la actividad.', 'error');
      return;
    }

    form.reset();
    document.getElementById('actPublicada').value = 'true';
    mostrarActividadStatus('Actividad guardada correctamente.', 'info');
    await cargarActividadesMRDE();
    const total = await contarTabla('modulo_actividades', 'modulo', 'MRDE');
    setTexto('mrdeActividades', total);
  });

  document.getElementById('limpiarActividad')?.addEventListener('click', () => {
    form.reset();
    document.getElementById('actPublicada').value = 'true';
    mostrarActividadStatus('', 'info', true);
  });
}

async function cargarActividadesMRDE(){
  const contenedor = document.getElementById('listaActividadesMRDE');
  if(!contenedor) return;

  const { data, error } = await sbAuth
    .from('modulo_actividades')
    .select('*')
    .eq('modulo', 'MRDE')
    .eq('grupo', '611')
    .order('creado_en', { ascending: false });

  if(error){
    console.error(error);
    contenedor.innerHTML = '<div class="notice">No se pudieron cargar las actividades.</div>';
    return;
  }

  if(!data?.length){
    contenedor.innerHTML = '<div class="notice">Aún no hay actividades publicadas para MRDE 611.</div>';
    return;
  }

  contenedor.innerHTML = data.map(a => `
    <article class="activity-card admin-activity-card">
      <div>
        <div class="row start">
          <span class="badge blue">${esc(a.tipo || 'Actividad')}</span>
          <span class="badge ${a.publicada ? 'ok' : 'warn'}">${a.publicada ? 'Publicada' : 'Borrador'}</span>
        </div>
        <h3>${esc(a.titulo)}</h3>
        <p>${esc(a.descripcion || '')}</p>
        <small class="muted">Evidencia: ${esc(a.evidencia_requerida || 'No especificada')}</small>
      </div>
      <div class="actions">
        <button class="btn small ${a.publicada ? 'danger' : 'ok'}" onclick="cambiarPublicacion(${a.id}, ${a.publicada ? 'false' : 'true'})">${a.publicada ? 'Ocultar' : 'Publicar'}</button>
        <button class="btn small danger" onclick="eliminarActividad(${a.id})">Eliminar</button>
      </div>
    </article>
  `).join('');
}

async function cambiarPublicacion(id, publicada){
  const { error } = await sbAuth.from('modulo_actividades').update({ publicada }).eq('id', id);
  if(error){ console.error(error); return; }
  await cargarActividadesMRDE();
}

async function eliminarActividad(id){
  if(!confirm('¿Eliminar esta actividad?')) return;
  const { error } = await sbAuth.from('modulo_actividades').delete().eq('id', id);
  if(error){ console.error(error); return; }
  await cargarActividadesMRDE();
  const total = await contarTabla('modulo_actividades', 'modulo', 'MRDE');
  setTexto('mrdeActividades', total);
}

function pintarTablaMRDE(lista){
  const tabla = document.getElementById('mrdeTabla');
  if(!tabla) return;
  if(!lista.length){
    tabla.innerHTML = '<tr><td colspan="4">Aún no hay alumnos registrados en el grupo 611.</td></tr>';
    return;
  }
  tabla.innerHTML = lista.map(alumno => {
    const perfil = alumno.perfiles || {};
    const activo = alumno.estado !== 'baja' && perfil.activo !== false;
    const acceso = (alumno.alumno_accesos || []).find(a => a.modulo === 'MRDE');
    const habilitado = acceso ? acceso.habilitado : true;
    return `<tr><td><strong>${esc(perfil.nombre || 'Sin nombre')}</strong></td><td>${esc(perfil.correo || '')}</td><td><span class="badge ${activo ? 'ok' : 'warn'}">${activo ? 'Activo' : 'Baja'}</span></td><td><span class="badge ${habilitado ? 'ok' : 'warn'}">${habilitado ? 'Habilitado' : 'Deshabilitado'}</span></td></tr>`;
  }).join('');
}

async function contarTabla(tabla, campo, valor){
  let query = sbAuth.from(tabla).select('id', { count: 'exact', head: true });
  if(campo) query = query.eq(campo, valor);
  const { count, error } = await query;
  if(error) return 0;
  return count || 0;
}

function mostrarActividadStatus(texto, tipo='info', ocultar=false){
  const box = document.getElementById('actividadStatus');
  if(!box) return;
  if(ocultar){ box.classList.add('hidden'); return; }
  box.textContent = texto;
  box.dataset.type = tipo;
  box.classList.remove('hidden');
}

function setTexto(id, valor){
  const el = document.getElementById(id);
  if(el) el.textContent = valor;
}

function esc(v){ return String(v ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
