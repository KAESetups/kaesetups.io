// CONFIGURACIÓN DE SUPABASE
const SUPABASE_URL = 'https://bmyazfgvdwmxfdvgrjju.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJteWF6Zmd2ZHdteGZkdmdyamp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5ODc5NjAsImV4cCI6MjEwMjU2Mzk2MH0.EACJ4AtYJcIz5DU-qI7hNo71CC53-s7bsxLWh_hjCKc';

// Inicializar cliente de Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Función que se ejecuta al hacer clic en el botón de la barra de navegación
async function handleAuth() {
    const btn = document.getElementById('login-btn');
    
    // Si ya hay una sesión activa, el botón actúa como "Mi Perfil"
    if (btn.dataset.loggedIn === "true") {
        alert("¡Ya estás dentro! Aquí iría la redirección a tu perfil o inventario.");
        return;
    }

    // Si no está logueado, lanza el proceso de autenticación con Discord
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
            redirectTo: window.location.origin + window.location.pathname
        }
    });

    if (error) {
        console.error('Error al iniciar sesión con Discord:', error.message);
    }
}

// Comprobar el estado de la sesión al cargar la página
window.addEventListener('DOMContentLoaded', async () => {
    const btn = document.getElementById('login-btn');
    if (!btn) return;

    // Obtener la sesión actual del usuario en Supabase
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        // Usuario logueado: transformamos el botón
        btn.textContent = "Mi Perfil";
        btn.dataset.loggedIn = "true";
        
        // Guardar o verificar usuario en la tabla 'users' de la base de datos
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
        // Usuario no logueado
        btn.textContent = "Iniciar Sesión";
        btn.dataset.loggedIn = "false";
    }
});
