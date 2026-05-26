const sbBoleta = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const params = new URLSearchParams(location.search);
const alumnoId = Number(params.get('alumno_id'));
const tipo = params.get('tipo') === 'boleta' ? 'boleta' : 'preboleta';
let promedioActual = 0;
let entregasActual = 0;

document.addEventListener('DOMContentLoaded', cargarBoleta);
document.getElementById('guardarBoleta').addEventListener('click', guardarBoleta);

async function cargarBoleta(){
  document.getElementById('tituloBoleta').textContent = tipo === 'boleta' ? 'Boleta' : 'Preboleta';
  document.getElementById('boletaTipo').textContent = tipo === 'boleta' ? 'Boleta final' : 'Preboleta de seguimiento';
  const { data: alumno, error } = await sbBoleta
    .from('alumnos')
    .select('id, perfiles(nombre, correo), grupos(nombre, turno)')
    .eq('id', alumnoId)
    .single();
  if(error || !alumno){ mostrarEstado('No se pudo cargar la información del alumno'); return; }
  document.getElementById('alumnoNombre').textContent = alumno.perfiles?.nombre || 'Alumno';
  document.getElementById('alumnoDatos').textContent = `${alumno.perfiles?.correo || ''} · Grupo ${alumno.grupos?.nombre || ''} ${alumno.grupos?.turno || ''}`;
  const { data: entregas } = await sbBoleta.from('respuestas_simulador').select('*').eq('nombre', alumno.perfiles?.nombre || '');
  entregasActual = entregas?.length || 0;
  promedioActual = entregasActual ? 100 : 0;
  document.getElementById('promedio').textContent = promedioActual;
  document.getElementById('entregas').textContent = entregasActual;
  document.getElementById('estatus').textContent = promedioActual >= 70 ? 'Aprobado' : 'Pendiente';
}

async function guardarBoleta(){
  const observaciones = document.getElementById('observaciones').value.trim();
  const { error } = await sbBoleta.from('boletas').insert({ alumno_id: alumnoId, tipo, promedio: promedioActual, observaciones });
  if(error){ mostrarEstado('No se pudo guardar el documento'); console.error(error); return; }
  mostrarEstado('Documento guardado correctamente');
}

function mostrarEstado(texto){
  const box = document.getElementById('estadoBoleta');
  box.classList.remove('hidden');
  box.textContent = texto;
}
