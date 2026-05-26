const sbDocentes = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const tablaDocentes = document.getElementById('tablaDocentes');
const estadoDocentes = document.getElementById('estadoDocentes');
document.getElementById('recargarDocentes')?.addEventListener('click', cargarDocentes);
document.addEventListener('DOMContentLoaded', cargarDocentes);

async function cargarDocentes(){
  estadoDocentes.textContent = 'Cargando docentes';
  const { data, error } = await sbDocentes
    .from('perfiles')
    .select('id,nombre,correo,rol,activo,creado_en')
    .in('rol', ['docente_pendiente','admin'])
    .order('creado_en', { ascending: false });

  if(error){
    estadoDocentes.textContent = 'No se pudo cargar la lista';
    console.error(error);
    return;
  }

  tablaDocentes.innerHTML = (data || []).map(d => filaDocente(d)).join('');
  estadoDocentes.textContent = data?.length ? 'Lista actualizada' : 'No hay solicitudes docentes';
}

function filaDocente(d){
  const pendiente = d.rol === 'docente_pendiente';
  const estado = pendiente ? 'Pendiente' : (d.activo ? 'Autorizado' : 'Inactivo');
  return `<tr>
    <td><strong>${esc(d.nombre)}</strong></td>
    <td>${esc(d.correo)}</td>
    <td><span class="badge ${pendiente ? 'warn' : 'ok'}">${estado}</span></td>
    <td><div class="actions">
      ${pendiente ? `<button class="btn small ok" onclick="aprobarDocente('${d.id}')">Aprobar</button>` : ''}
      ${d.rol === 'admin' && d.activo ? `<button class="btn small danger" onclick="desactivarDocente('${d.id}')">Desactivar</button>` : ''}
      ${d.rol === 'admin' && !d.activo ? `<button class="btn small ok" onclick="reactivarDocente('${d.id}')">Reactivar</button>` : ''}
      <button class="btn small danger" onclick="eliminarPerfil('${d.id}')">Eliminar</button>
    </div></td>
  </tr>`;
}

async function aprobarDocente(id){
  if(!confirm('¿Autorizar esta cuenta docente?')) return;
  const { error } = await sbDocentes.from('perfiles').update({ rol: 'admin', activo: true }).eq('id', id);
  if(error){ alert('No se pudo aprobar la cuenta.'); console.error(error); return; }
  cargarDocentes();
}

async function desactivarDocente(id){
  if(!confirm('¿Desactivar esta cuenta docente?')) return;
  const { error } = await sbDocentes.from('perfiles').update({ activo: false }).eq('id', id);
  if(error){ alert('No se pudo desactivar.'); console.error(error); return; }
  cargarDocentes();
}

async function reactivarDocente(id){
  const { error } = await sbDocentes.from('perfiles').update({ activo: true }).eq('id', id);
  if(error){ alert('No se pudo reactivar.'); console.error(error); return; }
  cargarDocentes();
}

async function eliminarPerfil(id){
  if(!confirm('Esta acción eliminará el perfil del sistema.')) return;
  const { error } = await sbDocentes.from('perfiles').delete().eq('id', id);
  if(error){ alert('No se pudo eliminar.'); console.error(error); return; }
  cargarDocentes();
}

function esc(v){ return String(v ?? '').replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
