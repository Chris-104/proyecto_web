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
// MOSTRAR EN EL MENÚ LATERAL LAS MATERIAS CREADAS POR EL USUARIO
//    - El menú desplegable (.sidebar-nav) está escrito a mano en el HTML con
//      las 5 materias por defecto, así que las materias nuevas agregadas por
//      el usuario no aparecían.
//    - Esta función lee las materias guardadas en localStorage y las agrega al
//      final de la lista del menú, en los mismos lugares donde está el enlace
//      "Inicio".
// ==========================================================================
// Lee los detalles (docente, descripción, icono y color) de las materias
// creadas, guardados en la clave 'focusClassMateriasDetalles' por nueva-materia.js.
function getDetallesMaterias() {
    try {
        const data = JSON.parse(localStorage.getItem('focusClassMateriasDetalles') || '[]');
        return Array.isArray(data) ? data : [];
    } catch (e) {
        return [];
    }
}

// Devuelve el detalle (icono/color) de una materia según su nombre exacto.
function getDetalleMateria(nombre) {
    return getDetallesMaterias().find(function (detalle) {
        return detalle && detalle.materia === nombre;
    }) || null;
}

function renderMateriasEnSidebar() {
    const listaMenu = document.querySelector('.sidebar-nav ul');
    if (!listaMenu) return;

    // Se eliminan los enlaces que ya se agregaron antes para no duplicarlos
    // al recargar la página o al volver con el botón atrás del navegador.
    listaMenu.querySelectorAll('li.sidebar-materia-usuario').forEach(function (item) {
        item.remove();
    });

    // Solo las materias creadas por el usuario (las 5 por defecto ya están
    // escritas a mano en el HTML de cada página). No hay límite de materias:
    // se procesan todas las que estén guardadas.
    const nombres = getMateriasGuardadas();
    const enCarpetaHtml = /\/html\//.test(window.location.pathname);

    nombres.forEach(function (nombre) {
        if (!nombre) return;

        // Los nombres se comparan sin distinguir mayúsculas/minúsculas para
        // no repetir una materia que ya esté en el menú (ej. "Matemáticas").
        const yaExisteDireccionLink = Array.prototype.some.call(
            listaMenu.querySelectorAll('a'),
            function (enlace) {
                return enlace.textContent.trim().toLowerCase() === nombre.trim().toLowerCase();
            }
        );
        if (yaExisteDireccionLink) return;

        const item = document.createElement('li');
        item.className = 'sidebar-materia-usuario';

        const enlace = document.createElement('a');
        // El enlace lleva a la vista de la materia creada pasando su nombre.
        const baseRuta = enCarpetaHtml ? 'materia-creada.html' : 'html/materia-creada.html';
        enlace.href = baseRuta + '?nombre=' + encodeURIComponent(nombre);

        // Se usa el icono que el usuario eligió al crear la materia (el que
        // guardó en los detalles); si no eligió ninguno, se muestra un icono
        // genérico de ejemplo.
        const icono = document.createElement('i');
        const detalle = getDetalleMateria(nombre);
        icono.className = detalle && detalle.icono ? detalle.icono : 'fa-solid fa-graduation-cap';

        const texto = document.createElement('span');
        texto.textContent = nombre;

        enlace.appendChild(icono);
        enlace.appendChild(texto);
        item.appendChild(enlace);

        // Si el usuario eligió un color, se pinta una pequeña franja izquierda
        // para que cada materia también se reconozca por su color.
        if (detalle && detalle.color) {
            enlace.style.borderLeft = '4px solid ' + detalle.color;
        }

        listaMenu.appendChild(item);
    });
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
    renderMateriasEnSidebar();

    // "pageshow" también se dispara cuando el navegador restaura la página con
    // el botón atrás/adelante (sin recargar). Así el menú se vuelve a renderizar
    // y muestra cualquier materia nueva guardada, aunque no se recargue.
    window.addEventListener('pageshow', renderMateriasEnSidebar);
});