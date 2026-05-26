const sbAuth = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const CLAVE_DOCENTE = 'MD20PROFE';

function statusBox(texto, tipo = 'info'){
  const box = document.getElementById('authStatus');
  if(!box) return;
  box.classList.remove('hidden');
  box.textContent = texto;
  box.dataset.type = tipo;
}

async function perfilActual(){
  const { data: sessionData } = await sbAuth.auth.getUser();
  const user = sessionData?.user;
  if(!user) return null;
  const { data, error } = await sbAuth.from('perfiles').select('*').eq('id', user.id).single();
  if(error) return null;
  return data;
}

async function redirigirPorRol(){
  const perfil = await perfilActual();
  if(!perfil) return;
  if(perfil.activo === false){ statusBox('Tu cuenta está inactiva. Consulta con tu docente.', 'error'); await sbAuth.auth.signOut(); return; }
  if(perfil.rol === 'admin') location.href = 'admin/dashboard.html';
  else location.href = 'alumno/dashboard.html';
}

const loginForm = document.getElementById('loginForm');
if(loginForm){
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    statusBox('Validando acceso');
    const correo = document.getElementById('correo').value.trim();
    const password = document.getElementById('password').value;
    const { error } = await sbAuth.auth.signInWithPassword({ email: correo, password });
    if(error){ statusBox('No se pudo iniciar sesión. Revisa correo y contraseña.', 'error'); return; }
    await redirigirPorRol();
  });
}

const rolSelect = document.getElementById('rol');
if(rolSelect){
  rolSelect.addEventListener('change', () => {
    const docente = rolSelect.value === 'admin';
    document.getElementById('claveDocenteField').classList.toggle('hidden', !docente);
    document.getElementById('grupoField').classList.toggle('hidden', docente);
  });
}

const registroForm = document.getElementById('registroForm');
if(registroForm){
  registroForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const nombre = document.getElementById('nombre').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const password = document.getElementById('password').value;
    const rol = document.getElementById('rol').value;
    const grupo = document.getElementById('grupo').value;
    const claveDocente = document.getElementById('claveDocente').value;
    if(rol === 'admin' && claveDocente !== CLAVE_DOCENTE){
      statusBox('Clave docente incorrecta.', 'error');
      return;
    }
    statusBox('Creando cuenta');
    const { data, error } = await sbAuth.auth.signUp({ email: correo, password });
    if(error){ statusBox('No se pudo crear la cuenta. Revisa los datos.', 'error'); return; }
    const userId = data?.user?.id;
    if(!userId){ statusBox('Cuenta creada. Revisa tu correo para confirmar el acceso.', 'info'); return; }
    const { error: perfilError } = await sbAuth.from('perfiles').upsert({ id: userId, nombre, correo, rol, activo: true });
    if(perfilError){ statusBox('Cuenta creada, pero falta completar el perfil.', 'error'); return; }
    if(rol === 'alumno'){
      const { data: grupoData } = await sbAuth.from('grupos').select('id').eq('nombre', grupo).single();
      if(grupoData?.id){ await sbAuth.from('alumnos').insert({ perfil_id: userId, grupo_id: grupoData.id }); }
    }
    statusBox('Cuenta creada correctamente. Redirigiendo');
    setTimeout(() => { location.href = rol === 'admin' ? 'admin/dashboard.html' : 'alumno/dashboard.html'; }, 900);
  });
}

async function cerrarSesion(){
  await sbAuth.auth.signOut();
  location.href = '../login.html';
}

async function protegerPagina(rolEsperado){
  const { data } = await sbAuth.auth.getUser();
  if(!data?.user){ location.href = '../login.html'; return; }
  const perfil = await perfilActual();
  if(!perfil){ location.href = '../login.html'; return; }
  if(perfil.activo === false){ await sbAuth.auth.signOut(); location.href = '../login.html'; return; }
  const nombre = document.querySelector('[data-user-name]');
  if(nombre) nombre.textContent = perfil.nombre;
  if(rolEsperado && perfil.rol !== rolEsperado){ location.href = perfil.rol === 'admin' ? '../admin/dashboard.html' : '../alumno/dashboard.html'; }
}
