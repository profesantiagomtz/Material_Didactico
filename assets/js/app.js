const supabaseClient =
supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

async function cargarMaterias(){

    const estado =
    document.getElementById('estado');

    const materias =
    document.getElementById('materias');

    try{

        const { data,error } =
        await supabaseClient
        .from('materias')
        .select('*')
        .order('id');

        if(error) throw error;

        estado.innerHTML =
        '🟢 Conectado correctamente a Supabase';

        materias.innerHTML =
        data.map(m=>`

            <div class="card">

                <div class="clave">
                    ${m.clave}
                </div>

                <h3>
                    ${m.nombre}
                </h3>

                <p>
                    ${m.descripcion}
                </p>

            </div>

        `).join('');

    }
    catch(err){

        console.error(err);

        estado.innerHTML =
        '🔴 Error al conectar con Supabase';

    }

}

document.addEventListener(
'DOMContentLoaded',
cargarMaterias
);
