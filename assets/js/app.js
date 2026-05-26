const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function cargarMaterias(){
  const estado = document.getElementById('estado');
  const contenedor = document.getElementById('materias');
  if(!estado || !contenedor) return;

  try{
    const { data, error } = await supabaseClient
      .from('materias')
      .select('*')
      .order('id');

    if(error) throw error;

    estado.textContent = '🟢 Conectado correctamente a Supabase';

    contenedor.innerHTML = data.map(m => `
      <article class="card">
        <div class="clave">${m.clave}</div>
        <h3>${m.nombre}</h3>
        <p>${m.descripcion || ''}</p>
      </article>
    `).join('');
  }catch(err){
    console.error(err);
    estado.textContent = '🔴 Error al conectar con Supabase';
  }
}

document.addEventListener('DOMContentLoaded', cargarMaterias);
