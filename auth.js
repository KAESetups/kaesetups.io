// CONFIGURACIÓN DE SUPABASE
const SUPABASE_URL = 'https://bmyazfgvdwmxfdvgrjju.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJteWF6Zmd2ZHdteGZkdmdyamp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5ODc5NjAsImV4cCI6MjEwMjU2Mzk2MH0.EACJ4AtYJcIz5DU-qI7hNo71CC53-s7bsxLWh_hjCKc';

// Comprobar si Supabase cargó bien
if (window.supabase) {
    console.log("SDK de Supabase cargado correctamente.");
} else {
    console.error("¡ERROR! El SDK de Supabase no se ha cargado desde el CDN.");
}

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Función principal de autenticación
async function handleAuth() {
    console.log("¡Click detectado en el botón de login!");
    const btn = document.getElementById('login-btn');
    
    if (btn && btn.dataset.loggedIn === "true") {
        alert("¡Ya estás dentro! Aquí iría la redirección a tu perfil.");
        return;
    }

    console.log("Llamando a Supabase para iniciar sesión con Discord...");
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
            redirectTo: window.location.origin + window.location.pathname
        }
    });

    if (error) {
        console.error('Error detallado de Supabase:', error.message);
    } else {
        console.log('Respuesta de Supabase:', data);
    }
}

// Configurar el botón y comprobar sesión al cargar la página
window.addEventListener('DOMContentLoaded', async () => {
    console.log("Página cargada, buscando el botón...");
    const btn = document.getElementById('login-btn');
    
    if (!btn) {
        console.error("¡No se encontró el elemento con id 'login-btn' en el HTML!");
        return;
    }

    console.log("Botón encontrado. Asignando evento de clic.");
    btn.addEventListener('click', handleAuth);

    // Comprobar sesión
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
        console.error("Error al obtener sesión:", sessionError.message);
        return;
    }

    if (session) {
        console.log("Usuario con sesión activa:", session.user.email);
        btn.textContent = "Mi Perfil";
        btn.dataset.loggedIn = "true";
        
        const user = session.user;
        const username = user.user_metadata?.full_name || user.user_metadata?.name || "Piloto";
        const avatarUrl = user.user_metadata?.avatar_url || "";

        await supabase.from('users').upsert({
            id: user.id,
            username: username,
            avatar_url: avatarUrl,
            provider: 'discord'
        }, { onConflict: 'id' });
    } else {
        console.log("No hay sesión activa.");
        btn.textContent = "Iniciar Sesión";
        btn.dataset.loggedIn = "false";
    }
});
