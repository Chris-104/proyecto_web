// ==========================================================================
// 1. LÓGICA DEL MENÚ DESPLEGABLE LATERAL (SIDEBAR)
// ==========================================================================
const openSidebarBtn = document.getElementById('openSidebarBtn');
const closeSidebarBtn = document.getElementById('closeSidebarBtn');
const sidebar = document.getElementById('sidebar');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');

function openSidebar() {
    if (sidebar && sidebarBackdrop) {
        sidebar.classList.add('active');
        sidebarBackdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeSidebar() {
    if (sidebar && sidebarBackdrop) {
        sidebar.classList.remove('active');
        sidebarBackdrop.classList.remove('active');
        document.body.style.overflow = '';
    }
}

if (openSidebarBtn) openSidebarBtn.addEventListener('click', openSidebar);
if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeSidebar);
if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeSidebar);

// ==========================================================================
// 2. INICIO CAMBIO CARRUSEL: LÓGICA MANUAL (SOLO CLIC EN PUNTOS)
// ==========================================================================
const slides = document.querySelectorAll('.carousel-slide');
const dots = document.querySelectorAll('.carousel-dots .dot');
let currentSlide = 0;

function showSlide(index) {
    if (slides.length === 0) return;

    if (index >= slides.length) {
        currentSlide = 0;
    } else if (index < 0) {
        currentSlide = slides.length - 1;
    } else {
        currentSlide = index;
    }

    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    slides[currentSlide].classList.add('active');
    if (dots[currentSlide]) {
        dots[currentSlide].classList.add('active');
    }
}

dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        showSlide(index);
    });
});
// FIN CAMBIO CARRUSEL
