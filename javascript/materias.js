// ==========================================================================
// MATERIAS COMPARTIDAS (por defecto + las que el usuario agrega)
// ==========================================================================
const MATERIA_STORAGE_KEY = 'focusClassMaterias';
const DEFAULT_MATERIAS = [
    { nombre: 'Matemáticas', claves: ['matemática'] },
    { nombre: 'Ciencias', claves: ['ciencias naturales', 'ciencia'] },
    { nombre: 'Historia', claves: ['estudios sociales', 'historia', 'sociales'] },
    { nombre: 'Lenguaje', claves: ['lenguaje y literatura', 'lenguaje'] },
    { nombre: 'Inglés', claves: ['english', 'inglés'] },
];

function getMateriasGuardadas() {
    try {
        const data = JSON.parse(localStorage.getItem(MATERIA_STORAGE_KEY) || '[]');
        return Array.isArray(data) ? data : [];
    } catch (e) {
        return [];
    }
}

// Todas las materias disponibles: las 5 por defecto + las guardadas por el usuario.
function getTodasLasMaterias() {
    const todas = DEFAULT_MATERIAS.map((materia) => materia.nombre);
    getMateriasGuardadas().forEach((nombre) => {
        if (nombre && !todas.includes(nombre)) {
            todas.push(nombre);
        }
    });
    return todas;
}

// Devuelve el nombre de la materia a la que pertenece la página actual
// (detectado por el título de su banner) o null si no es una página de materia.
function getMateriaActual() {
    const h1 = document.querySelector('.banner-text h1');
    if (!h1) return null;
    const texto = h1.textContent.trim().toLowerCase();
    for (const materia of DEFAULT_MATERIAS) {
        if (materia.claves.some((clave) => texto.includes(clave))) {
            return materia.nombre;
        }
    }
    return null;
}

// ==========================================================================
// GUARDAR NUEVA MATERIA (materia.html)
// ==========================================================================
function setupMateriaForm() {
    const saveBtn = document.querySelector('.btn-save');
    if (!saveBtn) return;

    saveBtn.addEventListener('click', (e) => {
        e.preventDefault();

        const nameInput = document.querySelector('.form-section .form-group input');
        const name = nameInput ? nameInput.value.trim() : '';

        if (!name) {
            alert('Escribe el nombre de la materia.');
            return;
        }

        const materias = getMateriasGuardadas();
        if (!materias.includes(name)) {
            materias.push(name);
            localStorage.setItem(MATERIA_STORAGE_KEY, JSON.stringify(materias));
        }

        alert('Materia guardada correctamente.');
        window.location.href = 'menu.html';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupMateriaForm();
});