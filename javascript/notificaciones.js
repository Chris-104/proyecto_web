// ==========================================================================
// DESPLEGABLE DE NOTIFICACIONES (HEADER)
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');

    if (!notificationBtn || !notificationDropdown) return;

    notificationBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notificationDropdown.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
        if (!notificationWrapContains(e.target)) {
            notificationDropdown.classList.remove('open');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            notificationDropdown.classList.remove('open');
        }
    });

    function notificationWrapContains(target) {
        return notificationBtn.contains(target) || notificationDropdown.contains(target);
    }
});
