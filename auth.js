// CONFIGURACIÓN DE SUPABASE
const SUPABASE_URL = 'https://bmyazfgvdwmxfdvgrjju.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJteWF6Zmd2ZHdteGZkdmdyamp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5ODc5NjAsImV4cCI6MjEwMjU2Mzk2MH0.EACJ4AtYJcIz5DU-qI7hNo71CC53-s7bsxLWh_hjCKc';

// Inicializar cliente de Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Función principal de autenticación asignada por código
async function handleAuth() {
    const btn = document.getElementById('login-btn');
    
    if (btn && btn.dataset.loggedIn === "true") {
        alert("¡Ya estás dentro! Aquí iría la redirección a tu perfil.");
        return;
    }

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

// Configurar el botón y comprobar sesión al cargar la página de forma limpia
window.addEventListener('DOMContentLoaded', async () => {
    const btn = document.getElementById('login-btn');
    if (!btn) return;

    // Asignar el evento de clic por JavaScript para evitar errores de referencia
    btn.addEventListener('click', handleAuth);

    // Comprobar si el usuario ya inició sesión previamente
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
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
        btn.textContent = "Iniciar Sesión";
        btn.dataset.loggedIn = "false";
    }
});
