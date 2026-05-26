const sbAuth = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

  const { data, error } = await sbAuth
    .from('perfiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if(error){
    console.error(error);
    return null;
  }

  return data;
}

function rutaLogin(){
  return location.pathname.includes('/admin/') || location.pathname.includes('/alumno/')
    ? '../login.html'
    : 'login.html';
}

async function redirigirPorRol(){
  const perfil = await perfilActual();
  if(!perfil){
    statusBox('No se encontró el perfil de usuario.', 'error');
    return;
  }

  if(perfil.rol === 'docente_pendiente'){
    statusBox('Tu solicitud docente está pendiente de aprobación.', 'info');
    await sbAuth.auth.signOut();
    return;
  }

  if(perfil.activo === false){
    statusBox('Tu cuenta está inactiva. Consulta con tu docente.', 'error');
    await sbAuth.auth.signOut();
    return;
  }

  if(perfil.rol === 'admin') location.href = 'admin/dashboard.html';
  else location.href = 'alumno/dashboard.html';
}

const loginForm = document.getElementById('loginForm');
if(loginForm){
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    statusBox('Validando acceso');

    const correo = document.getElementById('correo').value.trim().toLowerCase();
    const password = document.getElementById('password').value;

    const { error } = await sbAuth.auth.signInWithPassword({ email: correo, password });
    if(error){
      console.error(error);
      statusBox('No se pudo iniciar sesión. Revisa correo y contraseña.', 'error');
      return;
    }

    await redirigirPorRol();
  });
}

const rolSelect = document.getElementById('rol');
if(rolSelect){
  rolSelect.addEventListener('change', () => {
    const docente = rolSelect.value === 'docente';
    const grupoField = document.getElementById('grupoField');
    if(grupoField) grupoField.classList.toggle('hidden', docente);
  });
}

const registroForm = document.getElementById('registroForm');
if(registroForm){
  registroForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const correo = document.getElementById('correo').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const tipo = document.getElementById('rol').value;
    const grupo = document.getElementById('grupo')?.value;

    statusBox('Creando cuenta');

    const { data, error } = await sbAuth.auth.signUp({ email: correo, password });
    if(error){
      console.error(error);
      const mensaje = error.message?.toLowerCase().includes('already')
        ? 'Ese correo ya está registrado. Intenta iniciar sesión.'
        : 'No se pudo crear la cuenta. Revisa los datos.';
      statusBox(mensaje, 'error');
      return;
    }

    const userId = data?.user?.id;
    if(!userId){
      statusBox('Cuenta creada. Revisa tu correo para confirmar el acceso.', 'info');
      return;
    }

    let rol = 'alumno';
    let activo = true;

    if(tipo === 'docente'){
      const { count } = await sbAuth
        .from('perfiles')
        .select('id', { count: 'exact', head: true })
        .eq('rol', 'admin');

      const noHayAdmin = !count;
      rol = noHayAdmin ? 'admin' : 'docente_pendiente';
      activo = noHayAdmin;
    }

    const { error: perfilError } = await sbAuth.from('perfiles').upsert({
      id: userId,
      nombre,
      correo,
      rol,
      activo
    });

    if(perfilError){
      console.error(perfilError);
      statusBox('Cuenta creada, pero falta completar el perfil.', 'error');
      return;
    }

    if(tipo === 'alumno'){
      const { data: grupoData, error: grupoError } = await sbAuth
        .from('grupos')
        .select('id')
        .eq('nombre', grupo)
        .single();

      if(grupoError || !grupoData?.id){
        console.error(grupoError);
        statusBox('Cuenta creada, pero no se encontró el grupo.', 'error');
        return;
      }

      const { data: alumnoCreado, error: alumnoError } = await sbAuth
        .from('alumnos')
        .insert({ perfil_id: userId, grupo_id: grupoData.id, estado: 'activo' })
        .select('id')
        .single();

      if(alumnoError){
        console.error(alumnoError);
        statusBox('Cuenta creada, pero falta completar el registro de alumno.', 'error');
        return;
      }

      const { data: modulosGrupo, error: modulosError } = await sbAuth
        .from('asignaciones')
        .select('materias(clave)')
        .eq('grupo_id', grupoData.id)
        .eq('activa', true);

      if(modulosError){
        console.error(modulosError);
      }

      const accesosIniciales = (modulosGrupo || [])
        .map(item => item.materias?.clave)
        .filter(Boolean)
        .map(modulo => ({ alumno_id: alumnoCreado.id, modulo, habilitado: true }));

      if(accesosIniciales.length){
        const { error: accesosError } = await sbAuth
          .from('alumno_accesos')
          .upsert(accesosIniciales, { onConflict: 'alumno_id,modulo' });
        if(accesosError) console.error(accesosError);
      }

      statusBox('Cuenta de alumno creada correctamente. Redirigiendo');
      setTimeout(() => { location.href = 'alumno/dashboard.html'; }, 900);
      return;
    }

    if(rol === 'admin'){
      statusBox('Cuenta administradora creada correctamente. Redirigiendo');
      setTimeout(() => { location.href = 'admin/dashboard.html'; }, 900);
      return;
    }

    await sbAuth.auth.signOut();
    statusBox('Solicitud docente registrada. Un administrador debe aprobar tu acceso.', 'info');
  });
}

async function cerrarSesion(){
  await sbAuth.auth.signOut();
  location.href = rutaLogin();
}

async function protegerPagina(rolEsperado){
  const { data } = await sbAuth.auth.getUser();
  if(!data?.user){ location.href = '../login.html'; return; }

  const perfil = await perfilActual();
  if(!perfil){ location.href = '../login.html'; return; }

  if(perfil.rol === 'docente_pendiente' || perfil.activo === false){
    await sbAuth.auth.signOut();
    location.href = '../login.html';
    return;
  }

  const nombre = document.querySelector('[data-user-name]');
  if(nombre) nombre.textContent = perfil.nombre;

  if(rolEsperado && perfil.rol !== rolEsperado){
    location.href = perfil.rol === 'admin' ? '../admin/dashboard.html' : '../alumno/dashboard.html';
  }
}
