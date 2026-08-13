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
// (detectado por el título de su banner o por el parámetro ?nombre= de la URL)
// o null si no es una página de materia.
// Soporta tanto las 5 materias por defecto como las materias que el usuario
// creó, para que sus tareas y exámenes se muestren correctamente.
function getMateriaActual() {
    // 1) Los enlaces a las materias creadas por el usuario llegan con
    //    ?nombre=<nombre de la materia> en la URL (materia-creada.html).
    const nombreParam = new URLSearchParams(window.location.search).get('nombre');
    if (nombreParam && nombreParam.trim()) {
        return nombreParam.trim();
    }

    // 2) Materias que el usuario creó: se comparan con el título del banner
    //    sin distinguir mayúsculas/minúsculas (las tareas guardan el nombre
    //    exacto tal como fue digitado).
    const h1 = document.querySelector('.banner-text h1');
    const texto = h1 ? h1.textContent.trim().toLowerCase() : '';

    const guardadas = getMateriasGuardadas();
    for (const nombre of guardadas) {
        if (nombre && texto === nombre.trim().toLowerCase()) {
            return nombre.trim();
        }
    }

    if (!h1) return null;

    // 3) Materias por defecto (coincidencias por palabras clave).
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