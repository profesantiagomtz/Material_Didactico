const sbMrde = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', cargarMRDE);

async function cargarMRDE(){
  const estado = document.getElementById('mrdeEstado');
  try{
    const { data: grupo } = await sbMrde.from('grupos').select('id').eq('nombre','611').single();
    const grupoId = grupo?.id;
    if(!grupoId){
      if(estado) estado.textContent = 'No se encontró el grupo 611';
      return;
    }

    const { data: alumnos, error } = await sbMrde
      .from('alumnos')
      .select('id, estado, perfiles(nombre, correo, activo), alumno_accesos(modulo, habilitado)')
      .eq('grupo_id', grupoId)
      .order('id', { ascending: true });

    if(error) throw error;

    const lista = alumnos || [];
    const activos = lista.filter(a => a.estado !== 'baja' && a.perfiles?.activo !== false).length;
    const evidencias = await contarMRDE('respuestas_simulador', 'modulo', 'MRDE');
    const mensajes = await contarMRDE('mensajes_postit');

    setTexto('mrdeAlumnos', lista.length);
    setTexto('mrdeActivos', activos);
    setTexto('mrdeEvidencias', evidencias);
    setTexto('mrdeMensajes', mensajes);
    pintarTablaMRDE(lista);
    if(estado) estado.textContent = lista.length ? 'Grupo 611 cargado' : 'Aún no hay alumnos registrados en 611';
  }catch(error){
    if(estado) estado.textContent = 'No se pudo cargar MRDE 611';
    console.error(error);
  }
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

async function contarMRDE(tabla, campo, valor){
  let query = sbMrde.from(tabla).select('id', { count: 'exact', head: true });
  if(campo) query = query.eq(campo, valor);
  const { count, error } = await query;
  if(error) return 0;
  return count || 0;
}

function setTexto(id, valor){
  const el = document.getElementById(id);
  if(el) el.textContent = valor;
}

function esc(v){ return String(v ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
