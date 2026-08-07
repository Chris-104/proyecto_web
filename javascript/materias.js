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
        if (!Array.isArray(data)) return [];

        // Normalizar el formato: puede haber strings (formato anterior) u
        // objetos { materia, docente, descripcion } (formato de nueva-materia.js).
        return data.map((item) => {
            if (typeof item === 'string') return item;
            if (item && typeof item.materia === 'string') return item.materia;
            return null;
        }).filter((nombre) => nombre);
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

    // 1. Coincidir con las materias por defecto (por palabras clave)
    for (const materia of DEFAULT_MATERIAS) {
        if (materia.claves.some((clave) => texto.includes(clave))) {
            return materia.nombre;
        }
    }

    // 2. Coincidir con las materias creadas por el usuario (por su nombre exacto)
    const encontrada = getTodasLasMaterias().find((nombre) => nombre.toLowerCase() === texto);
    return encontrada || null;
}

// ==========================================================================
// GUARDADO DE MATERIA (materia.html)
// NOTA: el formulario de materia.html lo maneja nueva-materia.js (guarda el
// objeto completo { materia, docente, descripcion }). Este archivo solo
// provee helpers de lectura compatibles con ambos formatos.
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Sin acciones adicionales: solo helpers (getMateriasGuardadas,
    // getTodasLasMaterias, getMateriaActual) usados por nueva-tarea.js,
    // nuevo-examen.js y nueva-materia.js.
});