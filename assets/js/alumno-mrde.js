document.addEventListener('DOMContentLoaded', cargarMRDEAlumno);

async function cargarMRDEAlumno(){
  const estado = document.getElementById('estadoMRDEAlumno');
  const contenedor = document.getElementById('listaActividadesAlumno');
  if(!contenedor) return;

  try{
    const perfil = await perfilActual();
    if(!perfil){
      if(estado) estado.textContent = 'No se pudo validar tu sesión.';
      return;
    }

    const { data: alumno, error: alumnoError } = await sbAuth
      .from('alumnos')
      .select('id, grupo_id, estado, grupos(nombre)')
      .eq('perfil_id', perfil.id)
      .single();

    if(alumnoError || !alumno){
      if(estado) estado.textContent = 'No se encontró tu registro de alumno.';
      return;
    }

    if(alumno.estado === 'baja'){
      contenedor.innerHTML = '<div class="notice">Tu cuenta se encuentra dada de baja.</div>';
      if(estado) estado.classList.add('hidden');
      return;
    }

    const { data: acceso } = await sbAuth
      .from('alumno_accesos')
      .select('habilitado')
      .eq('alumno_id', alumno.id)
      .eq('modulo', 'MRDE')
      .maybeSingle();

    if(acceso && acceso.habilitado === false){
      contenedor.innerHTML = '<div class="notice">MRDE no está disponible por el momento.</div>';
      if(estado) estado.classList.add('hidden');
      return;
    }

    const grupo = alumno.grupos?.nombre || '611';
    const { data, error } = await sbAuth
      .from('modulo_actividades')
      .select('*')
      .eq('modulo', 'MRDE')
      .eq('grupo', grupo)
      .eq('publicada', true)
      .order('id', { ascending: true });

    if(error) throw error;

    if(!data?.length){
      contenedor.innerHTML = '<div class="notice">Aún no hay actividades publicadas para MRDE.</div>';
      if(estado) estado.textContent = 'Sin actividades publicadas';
      return;
    }

    contenedor.innerHTML = data.map(a => `
      <article class="activity-card">
        <h3>${esc(a.titulo)}</h3>
        <p>${esc(a.descripcion || '')}</p>
        <div class="row">
          <span class="badge warn">${esc(a.grupo)}</span>
          <span class="badge blue">${esc(a.codigo || a.tipo || 'Actividad')}</span>
          <a class="btn primary" href="actividad.html?id=${a.id}">Abrir cuaderno</a>
        </div>
      </article>
    `).join('');
    if(estado) estado.classList.add('hidden');
  }catch(error){
    console.error(error);
    if(estado) estado.textContent = 'No se pudieron cargar las actividades.';
  }
}

function esc(v){ return String(v ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
