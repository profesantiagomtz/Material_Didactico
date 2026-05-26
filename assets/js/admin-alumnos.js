const sbAdmin = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const modulos = ['COBD','POO','MRDE'];
let alumnosCache = [];

const tabla = document.getElementById('tablaAlumnos');
const estado = document.getElementById('estadoAlumnos');
const modal = document.getElementById('modal');
document.getElementById('recargar').addEventListener('click', cargarAlumnos);

document.addEventListener('DOMContentLoaded', cargarAlumnos);

async function cargarAlumnos(){
  estado.textContent = 'Cargando lista de alumnos';
  const { data, error } = await sbAdmin
    .from('alumnos')
    .select('id, perfil_id, matricula, grupo_id, estado, perfiles(nombre, correo, activo), grupos(nombre, turno), alumno_accesos(modulo, habilitado)')
    .order('id', { ascending: true });

  if(error){
    estado.textContent = 'No se pudo cargar la lista de alumnos';
    console.error(error);
    return;
  }

  alumnosCache = data || [];
  pintarKPIs();
  tabla.innerHTML = alumnosCache.map(alumno => filaAlumno(alumno)).join('');
  estado.textContent = alumnosCache.length ? 'Lista actualizada' : 'Aún no hay alumnos registrados';
}

function filaAlumno(alumno){
  const perfil = alumno.perfiles || {};
  const grupo = alumno.grupos ? `${alumno.grupos.nombre} · ${alumno.grupos.turno}` : 'Sin grupo';
  const activo = perfil.activo !== false && alumno.estado !== 'baja';
  const accesos = alumno.alumno_accesos || [];
  return `
    <tr>
      <td><strong>${esc(perfil.nombre || 'Sin nombre')}</strong><br><span class="muted">ID alumno: ${alumno.id}</span></td>
      <td>${esc(perfil.correo || '')}</td>
      <td>${esc(grupo)}</td>
      <td><span class="badge ${activo ? 'ok' : 'warn'}">${activo ? 'Activo' : 'Baja'}</span></td>
      <td><div class="switches">${modulos.map(m => switchModulo(alumno, accesos, m)).join('')}</div></td>
      <td><div class="actions">
        <button class="btn small" onclick="abrirPostit(${alumno.id})">Post-it</button>
        <button class="btn small" onclick="enviarReset('${escAttr(perfil.correo || '')}')">Contraseña</button>
        <button class="btn small" onclick="abrirBoleta(${alumno.id}, 'preboleta')">Preboleta</button>
        <button class="btn small" onclick="abrirBoleta(${alumno.id}, 'boleta')">Boleta</button>
        <button class="btn small ${activo ? 'danger' : 'ok'}" onclick="toggleBaja(${alumno.id}, '${activo ? 'baja' : 'activo'}', '${alumno.perfil_id}')">${activo ? 'Dar de baja' : 'Reactivar'}</button>
        <button class="btn small danger" onclick="eliminarAlumno(${alumno.id}, '${alumno.perfil_id}')">Eliminar</button>
      </div></td>
    </tr>`;
}

function switchModulo(alumno, accesos, modulo){
  const registro = accesos.find(a => a.modulo === modulo);
  const habilitado = registro ? registro.habilitado : true;
  return `<button class="switch ${habilitado ? 'on' : 'off'}" onclick="toggleModulo(${alumno.id}, '${modulo}', ${!habilitado})">${modulo} ${habilitado ? 'ON' : 'OFF'}</button>`;
}

function pintarKPIs(){
  const total = alumnosCache.length;
  const activos = alumnosCache.filter(a => a.estado !== 'baja' && a.perfiles?.activo !== false).length;
  document.getElementById('kpiTotal').textContent = total;
  document.getElementById('kpiActivos').textContent = activos;
  document.getElementById('kpiBaja').textContent = total - activos;
}

async function toggleModulo(alumnoId, modulo, habilitado){
  const { error } = await sbAdmin
    .from('alumno_accesos')
    .upsert({ alumno_id: alumnoId, modulo, habilitado, actualizado_en: new Date().toISOString() }, { onConflict: 'alumno_id,modulo' });
  if(error){ alert('No se pudo actualizar el acceso.'); console.error(error); return; }
  await cargarAlumnos();
}

function abrirPostit(alumnoId){
  const alumno = alumnosCache.find(a => a.id === alumnoId);
  const nombre = alumno?.perfiles?.nombre || 'Alumno';
  modal.classList.remove('hidden');
  modal.innerHTML = `<section class="modal-card"><h2>Mensaje para ${esc(nombre)}</h2><form class="form" id="postitForm"><label class="field"><span>Título</span><input class="input" id="postitTitulo" required></label><label class="field"><span>Mensaje</span><textarea class="textarea" id="postitMensaje" required></textarea></label><div class="actions"><button class="btn primary" type="submit">Enviar mensaje</button><button class="btn" type="button" onclick="cerrarModal()">Cancelar</button></div></form></section>`;
  document.getElementById('postitForm').addEventListener('submit', async e => {
    e.preventDefault();
    const titulo = document.getElementById('postitTitulo').value.trim();
    const mensaje = document.getElementById('postitMensaje').value.trim();
    const { error } = await sbAdmin.from('mensajes_postit').insert({ alumno_id: alumnoId, titulo, mensaje });
    if(error){ alert('No se pudo enviar el mensaje.'); console.error(error); return; }
    cerrarModal();
  });
}

async function enviarReset(correo){
  if(!correo) return alert('El alumno no tiene correo registrado.');
  const ok = confirm(`Se enviará un correo para restablecer contraseña a ${correo}.`);
  if(!ok) return;
  const { error } = await sbAdmin.auth.resetPasswordForEmail(correo, { redirectTo: location.origin + location.pathname.replace('/admin/alumnos.html','/login.html') });
  if(error){ alert('No se pudo enviar el correo de recuperación.'); console.error(error); return; }
  alert('Correo de recuperación enviado.');
}

function abrirBoleta(alumnoId, tipo){
  location.href = `boleta.html?alumno_id=${alumnoId}&tipo=${tipo}`;
}

async function toggleBaja(alumnoId, nuevoEstado, perfilId){
  const texto = nuevoEstado === 'baja' ? 'dar de baja' : 'reactivar';
  if(!confirm(`¿Deseas ${texto} este alumno?`)) return;
  const activo = nuevoEstado !== 'baja';
  const { error: alumnoError } = await sbAdmin.from('alumnos').update({ estado: nuevoEstado, actualizado_en: new Date().toISOString() }).eq('id', alumnoId);
  const { error: perfilError } = await sbAdmin.from('perfiles').update({ activo }).eq('id', perfilId);
  if(alumnoError || perfilError){ alert('No se pudo actualizar el estado.'); console.error(alumnoError || perfilError); return; }
  await cargarAlumnos();
}

async function eliminarAlumno(alumnoId, perfilId){
  if(!confirm('Esta acción eliminará el registro académico del alumno.')) return;
  const { error: alumnoError } = await sbAdmin.from('alumnos').delete().eq('id', alumnoId);
  const { error: perfilError } = await sbAdmin.from('perfiles').delete().eq('id', perfilId);
  if(alumnoError || perfilError){ alert('No se pudo eliminar el alumno.'); console.error(alumnoError || perfilError); return; }
  await cargarAlumnos();
}

function cerrarModal(){ modal.classList.add('hidden'); modal.innerHTML = ''; }
function esc(v){ return String(v ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function escAttr(v){ return esc(v).replace(/'/g, '&#39;'); }
