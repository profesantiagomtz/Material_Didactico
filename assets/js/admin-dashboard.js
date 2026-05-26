const sbDash = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', cargarResumenDocente);

async function cargarResumenDocente(){
  const estado = document.getElementById('dashEstado');
  try{
    const [alumnos, activos, docentes, evidencias] = await Promise.all([
      contar('alumnos'),
      contar('alumnos', 'estado', 'activo'),
      contar('perfiles', 'rol', 'docente_pendiente'),
      contar('respuestas_simulador')
    ]);

    setTexto('dashAlumnos', alumnos);
    setTexto('dashActivos', activos);
    setTexto('dashDocentes', docentes);
    setTexto('dashEvidencias', evidencias);
    if(estado) estado.textContent = 'Resumen actualizado';
  }catch(error){
    if(estado) estado.textContent = 'No se pudo cargar el resumen';
    console.error(error);
  }
}

async function contar(tabla, campo, valor){
  let query = sbDash.from(tabla).select('id', { count: 'exact', head: true });
  if(campo) query = query.eq(campo, valor);
  const { count, error } = await query;
  if(error) return 0;
  return count || 0;
}

function setTexto(id, valor){
  const el = document.getElementById(id);
  if(el) el.textContent = valor;
}
