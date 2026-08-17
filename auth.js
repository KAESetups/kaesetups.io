// ==========================================
// CONFIGURACIÓN DE SUPABASE
// ==========================================
// Pega aquí tus claves reales del panel de Supabase:
const SUPABASE_URL = 'TU_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'TU_SUPABASE_ANON_KEY';

// Inicializamos la conexión
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// FUNCIÓN DE INICIO DE SESIÓN
// ==========================================
async function handleAuth() {
    // Si ya está logueado, redirigir al perfil
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
        window.location.href = 'perfil.html';
        return;
    }

    // Si no está logueado, abrir ventana de Discord para iniciar sesión
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
            redirectTo: window.location.href // Te devuelve a la misma página tras iniciar sesión
        }
    });

    if (error) {
        console.error('Error al iniciar sesión con Discord:', error.message);
        alert('Hubo un error al intentar conectar con Discord.');
    }
}

// ==========================================
// COMPROBAR ESTADO AL CARGAR LA PÁGINA
// ==========================================
// Cada vez que abres o recargas una página, esto comprueba si hay una sesión activa
document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    actualizarBotonLogin(session);
});

// Escucha cambios en tiempo real (si inicia sesión o cierra sesión)
supabase.auth.onAuthStateChange((event, session) => {
    actualizarBotonLogin(session);
});

// Función auxiliar para cambiar el aspecto del botón dinámicamente
function actualizarBotonLogin(session) {
    const btn = document.getElementById('login-btn');
    if (!btn) return;

    if (session) {
        // Si hay sesión activa: Cambia el botón a "Mi Perfil"
        btn.innerText = 'Mi Perfil';
        btn.style.borderColor = 'var(--neon-green)';
        btn.style.color = 'var(--neon-green)';
    } else {
        // Si no hay sesión: Muestra "Iniciar Sesión"
        btn.innerText = 'Iniciar Sesión';
    }
}
