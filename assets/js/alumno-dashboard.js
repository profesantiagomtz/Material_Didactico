const sbAlumnoDash = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const mapaModulos = {
  COBD: document.querySelector('[data-modulo="COBD"]'),
  POO: document.querySelector('[data-modulo="POO"]'),
  MRDE: document.querySelector('[data-modulo="MRDE"]')
};

document.addEventListener('DOMContentLoaded', iniciarAlumnoDashboard);

async function iniciarAlumnoDashboard(){
  const perfil = await perfilActual();
  if(!perfil) return;
  const { data: alumno } = await sbAlumnoDash.from('alumnos').select('id, estado').eq('perfil_id', perfil.id).single();
  if(!alumno) return;
  if(alumno.estado === 'baja'){
    document.getElementById('bloqueoAlumno')?.classList.remove('hidden');
    Object.values(mapaModulos).forEach(card => card?.classList.add('disabled'));
    return;
  }
  await cargarAccesos(alumno.id);
  await cargarPostits(alumno.id);
}

async function cargarAccesos(alumnoId){
  const { data } = await sbAlumnoDash.from('alumno_accesos').select('modulo, habilitado').eq('alumno_id', alumnoId);
  (data || []).forEach(acceso => {
    const card = mapaModulos[acceso.modulo];
    if(card && !acceso.habilitado){
      card.classList.add('disabled');
      const meta = card.querySelector('.meta');
      if(meta) meta.innerHTML = '<span class="chip">No disponible</span>';
      card.removeAttribute('href');
    }
  });
}

async function cargarPostits(alumnoId){
  const contenedor = document.getElementById('postitsAlumno');
  if(!contenedor) return;
  const { data, error } = await sbAlumnoDash.from('mensajes_postit').select('*').eq('alumno_id', alumnoId).eq('visto', false).order('creado_en', { ascending: false });
  if(error || !data?.length){ contenedor.innerHTML = ''; return; }
  contenedor.innerHTML = `<div class="postit-list">${data.map(m => `<article class="postit"><h3>${esc(m.titulo)}</h3><p>${esc(m.mensaje)}</p><div class="actions"><button class="btn small" onclick="marcarPostit(${m.id})">Entendido</button></div></article>`).join('')}</div>`;
}

async function marcarPostit(id){
  await sbAlumnoDash.from('mensajes_postit').update({ visto: true }).eq('id', id);
  iniciarAlumnoDashboard();
}

function esc(v){ return String(v ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
