const sbAlumnoDash = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const infoModulos = {
  COBD: { titulo: 'Bases de Datos', href: 'cobd.html' },
  POO: { titulo: 'Programación', href: 'poo.html' },
  MRDE: { titulo: 'Redes', href: 'mrde.html' }
};

document.addEventListener('DOMContentLoaded', iniciarAlumnoDashboard);

function obtenerMapaModulos(){
  return {
    COBD: document.querySelector('[data-modulo="COBD"]'),
    POO: document.querySelector('[data-modulo="POO"]'),
    MRDE: document.querySelector('[data-modulo="MRDE"]')
  };
}

async function iniciarAlumnoDashboard(){
  ocultarModulos();

  const perfil = await perfilActual();
  if(!perfil) return;

  const { data: alumno, error } = await sbAlumnoDash
    .from('alumnos')
    .select('id, estado, grupo_id, grupos(nombre, turno)')
    .eq('perfil_id', perfil.id)
    .single();

  if(error || !alumno){
    mostrarAviso('No se encontró tu registro de alumno. Consulta con tu docente.');
    return;
  }

  if(alumno.estado === 'baja'){
    document.getElementById('bloqueoAlumno')?.classList.remove('hidden');
    return;
  }

  await cargarModulosAsignados(alumno);
  await cargarPostits(alumno.id);
}

function ocultarModulos(){
  const mapaModulos = obtenerMapaModulos();

  Object.values(mapaModulos).forEach(card => {
    if(!card) return;
    card.classList.add('hidden');
    card.classList.remove('disabled');
  });
}

async function cargarModulosAsignados(alumno){
  const mapaModulos = obtenerMapaModulos();

  const { data: asignaciones, error: asignacionesError } = await sbAlumnoDash
    .from('asignaciones')
    .select('grupo_id, activa, materias(clave, nombre)')
    .eq('grupo_id', alumno.grupo_id)
    .eq('activa', true);

  if(asignacionesError){
    console.error(asignacionesError);
    mostrarAviso('No se pudieron cargar tus módulos asignados.');
    return;
  }

  const modulosAsignados = (asignaciones || [])
    .map(item => item.materias?.clave)
    .filter(Boolean);

  if(!modulosAsignados.length){
    mostrarAviso('Tu grupo aún no tiene módulos asignados. Consulta con tu docente.');
    return;
  }

  const { data: accesos, error: accesosError } = await sbAlumnoDash
    .from('alumno_accesos')
    .select('modulo, habilitado')
    .eq('alumno_id', alumno.id);

  if(accesosError){
    console.error(accesosError);
  }

  const accesoPorModulo = new Map((accesos || []).map(a => [a.modulo, a.habilitado]));
  const grupoNombre = alumno.grupos?.nombre || '';

  modulosAsignados.forEach(modulo => {
    const card = mapaModulos[modulo];
    if(!card) return;

    card.classList.remove('hidden');
    card.setAttribute('href', infoModulos[modulo]?.href || '#');

    const meta = card.querySelector('.meta');
    const habilitado = accesoPorModulo.has(modulo) ? accesoPorModulo.get(modulo) : true;

    if(meta){
      meta.innerHTML = `<span class="chip">${esc(grupoNombre)}</span>`;
    }

    if(!habilitado){
      card.classList.add('disabled');
      card.removeAttribute('href');

      if(meta){
        meta.innerHTML = `<span class="chip">${esc(grupoNombre)}</span><span class="chip">No disponible</span>`;
      }
    }
  });
}

function mostrarAviso(texto){
  const aviso = document.getElementById('avisoModulos');
  if(!aviso) return;
  aviso.textContent = texto;
  aviso.classList.remove('hidden');
}

async function cargarPostits(alumnoId){
  const contenedor = document.getElementById('postitsAlumno');
  if(!contenedor) return;

  const { data, error } = await sbAlumnoDash
    .from('mensajes_postit')
    .select('*')
    .eq('alumno_id', alumnoId)
    .eq('visto', false)
    .order('creado_en', { ascending: false });

  if(error || !data?.length){
    contenedor.innerHTML = '';
    return;
  }

  contenedor.innerHTML = `
    <div class="postit-list">
      ${data.map(m => `
        <article class="postit">
          <h3>${esc(m.titulo)}</h3>
          <p>${esc(m.mensaje)}</p>
          <div class="actions">
            <button class="btn small" onclick="marcarPostit(${m.id})">
              Entendido
            </button>
          </div>
        </article>
      `).join('')}
    </div>
  `;
}

async function marcarPostit(id){
  await sbAlumnoDash
    .from('mensajes_postit')
    .update({ visto: true })
    .eq('id', id);

  iniciarAlumnoDashboard();
}

function esc(v){
  return String(v ?? '').replace(/[&<>"]/g, c => ({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;'
  }[c]));
}
