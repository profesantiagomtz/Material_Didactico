const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const rutasModulo = {
  COBD: 'alumno/cobd.html',
  POO: 'alumno/poo.html',
  MRDE: 'alumno/mrde.html'
};

async function cargarInicio(){
  const estado = document.getElementById('estado');
  const contenedor = document.getElementById('materias');
  if(!estado || !contenedor) return;
  try{
    const { data, error } = await sb.from('materias').select('*').order('id');
    if(error) throw error;
    estado.textContent = 'Conectado correctamente a Supabase';
    contenedor.innerHTML = data.map(m => `
      <a class="module-card" href="${rutasModulo[m.clave] || 'alumno/dashboard.html'}">
        <div>
          <span class="code">${m.clave}</span>
          <h3>${m.nombre}</h3>
          <p>${m.descripcion || ''}</p>
        </div>
        <div class="meta"><span class="chip">Ver módulo</span><span class="chip">Contenido</span><span class="chip">Actividades</span></div>
      </a>
    `).join('');
  }catch(error){
    estado.textContent = 'No se pudo conectar con Supabase';
    console.error(error);
  }
}

document.addEventListener('DOMContentLoaded', cargarInicio);
