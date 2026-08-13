// ==========================================================================
// context-menu.js
// Menú contextual (clic derecho) para ELIMINAR elementos creados por el usuario:
//   - Materias nuevas (.card-new) en menu.html
//   - Tareas y exámenes (cards y task-items) en las páginas de materia y en menu.html
// Las materias por defecto (las 5 del sistema) NO se pueden eliminar.
// ==========================================================================

(function () {
    'use strict';

    // Claves de localStorage (iguales a las de materias.js, nueva-tarea.js,
    // nuevo-examen.js y nueva-materia.js)
    const MATERIAS_KEY = 'focusClassMaterias';
    const DETALLES_KEY = 'focusClassMateriasDetalles';
    const TASKS_KEY = 'focusClassTasks';
    const EXAMS_KEY = 'focusClassExams';

    // --------------------------------------------------------------------------
    // 1. CREAR EL MENÚ Y SUS ESTILOS
    // --------------------------------------------------------------------------
    // El menú se crea una sola vez con JavaScript y se oculta/muestra según
    // donde el usuario haga clic derecho.
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.setAttribute('role', 'menu');

    const eliminarBtn = document.createElement('button');
    eliminarBtn.type = 'button';
    eliminarBtn.setAttribute('role', 'menuitem');
    eliminarBtn.innerHTML = '<i class="fa-solid fa-trash"></i> Eliminar';

    menu.appendChild(eliminarBtn);
    document.body.appendChild(menu);

    // Información del elemento sobre el que se abrió el menú.
    //   { tipo: 'materia' | 'tarea' | 'examen', elemento, panel }
    // "elemento" es la tarjeta/item sobre la que se hizo clic derecho.
    // "panel" existe solo en las páginas de materia (identifica la tarjeta).
    let objetivo = null;

    function ocultarMenu() {
        menu.classList.remove('visible');
        objetivo = null;
    }

    // Posiciona el menú en las coordenadas del clic, sin que se salga de la
    // pantalla (si se pasa de largo, se corre hacia la izquierda/arriba).
    function mostrarMenu(x, y, info) {
        objetivo = info;
        menu.classList.add('visible');

        const sobraX = x + menu.offsetWidth - window.innerWidth;
        const sobraY = y + menu.offsetHeight - window.innerHeight;
        menu.style.left = (x - (sobraX > 0 ? sobraX : 0)) + 'px';
        menu.style.top = (y - (sobraY > 0 ? sobraY : 0)) + 'px';
    }

    // --------------------------------------------------------------------------
    // 2. AYUDANTES PARA LEER/ESCRIBIR LOS ARRAYS EN localStorage
    // --------------------------------------------------------------------------
    function leerArray(clave) {
        try {
            const data = JSON.parse(localStorage.getItem(clave) || '[]');
            return Array.isArray(data) ? data : [];
        } catch (e) {
            return [];
        }
    }

    function guardarArray(clave, arr) {
        localStorage.setItem(clave, JSON.stringify(arr));
    }

    // --------------------------------------------------------------------------
    // 3. DETECTAR QUÉ SE HIZO CLIC DERECHO
    // --------------------------------------------------------------------------
    // Devuelve la info del elemento (o null si el clic fue sobre algo que
    // NO se puede eliminar). El orden de las comprobaciones importa.
    function resolverClic(e) {
        const objetivoDom = e.target;

        // 3.1 Materia creada por el usuario en menu.html.
        //     Solo las tarjetas .card-new (las 5 materias fijas no tienen
        //     esa clase, así que NO se pueden eliminar).
        const cardMateria = objetivoDom.closest('.course-card.card-new');
        if (cardMateria) {
            return { tipo: 'materia', elemento: cardMateria, panel: null };
        }

        // 3.2 Tarea o examen en las páginas de materia (tarjeta .card dentro
        //     de un panel cuyo título dice "Tareas" o "Exámenes").
        const card = objetivoDom.closest('.card');
        if (card) {
            const panel = card.closest('.panel');
            if (panel) {
                const h2 = panel.querySelector('.panel-header h2');
                const titulo = (h2 && h2.textContent || '').toLowerCase();
                if (titulo.includes('exámen') || titulo.includes('examen')) {
                    return { tipo: 'examen', elemento: card, panel };
                }
                if (titulo.includes('tarea')) {
                    return { tipo: 'tarea', elemento: card, panel };
                }
            }
        }

        // 3.3 Item de tarea o examen en menu.html (.task-item).
        //     Los exámenes se muestran dentro de una caja .exam-box,
        //     las tareas dentro de la caja .pending-box normal.
        const item = objetivoDom.closest('.task-item');
        if (item) {
            if (item.closest('.exam-box')) {
                return { tipo: 'examen', elemento: item, panel: null };
            }
            if (item.closest('.pending-box')) {
                return { tipo: 'tarea', elemento: item, panel: null };
            }
        }

        return null;
    }

    // --------------------------------------------------------------------------
    // 4. FUNCIONES PARA ELIMINAR
    // --------------------------------------------------------------------------
    // Se busca el índice del elemento dentro de su lista en el DOM y se usa ese
    // mismo índice en el array correspondiente de localStorage (el orden es el
    // mismo porque las funciones de renderizado agregan en orden).
    function eliminarMateria(card) {
        const nombres = leerArray(MATERIAS_KEY);
        const detalles = leerArray(DETALLES_KEY);

        // Índice de la tarjeta entre las tarjetas .card-new de la grilla
        const grid = card.parentElement;
        const cards = Array.from(grid.querySelectorAll('.course-card.card-new'));
        const indice = cards.indexOf(card);
        const nombre = nombres[indice];

        if (!nombre) return;
        if (!confirm('¿Eliminar la materia "' + nombre + '"? También se eliminarán sus tareas y exámenes.')) return;

        // Se quita el nombre de los nombres y el detalle de los detalles
        nombres.splice(indice, 1);
        guardarArray(MATERIAS_KEY, nombres);

        const nuevosDetalles = detalles.filter((d) => !d || d.materia !== nombre);
        guardarArray(DETALLES_KEY, nuevosDetalles);

        // Se eliminan las tareas y exámenes de esa materia
        const tasks = leerArray(TASKS_KEY).filter((t) => t.materia !== nombre);
        guardarArray(TASKS_KEY, tasks);

        const exams = leerArray(EXAMS_KEY).filter((x) => x.materia !== nombre);
        guardarArray(EXAMS_KEY, exams);

        card.remove();

        // Si estamos en menu.html, se re-renderizan las listas visibles de
        // tareas y exámenes para que las de la materia eliminada desaparezcan
        // de la vista previa sin necesidad de recargar la página.
        if (typeof renderTasksInicio === 'function') renderTasksInicio();
        if (typeof renderModalTareas === 'function') renderModalTareas();
        if (typeof renderExamList === 'function') renderExamList();
        if (typeof renderModalExamenes === 'function') renderModalExamenes();
        if (typeof renderExamMetric === 'function') renderExamMetric();
        if (typeof updateMetrics === 'function') updateMetrics();
    }

    function eliminarTarea(elemento, panel) {
        const tasks = leerArray(TASKS_KEY);
        let indice;
        let objetivoTarea;

        if (panel) {
            // Tarjeta dentro de la página de la materia: se filtra por la materia
            // actual y se busca el índice dentro de las tarjetas del panel.
            const cardList = panel.querySelector('.card-list');
            if (!cardList) return;
            const cards = Array.from(cardList.querySelectorAll('.card'));
            indice = cards.indexOf(elemento);
            if (indice < 0) return;

            const materia = typeof getMateriaActual === 'function' ? getMateriaActual() : null;
            const filtradas = tasks.filter((t) => t.materia === materia);
            objetivoTarea = filtradas[indice];
        } else {
            // Item en menu.html: la lista .task-item corresponde a TODAS las tareas
            const lista = elemento.parentElement;
            const items = Array.from(lista.querySelectorAll('.task-item'));
            indice = items.indexOf(elemento);
            if (indice < 0) return;
            objetivoTarea = tasks[indice];
        }

        if (!objetivoTarea) return;
        if (!confirm('¿Eliminar esta tarea?')) return;

        guardarArray(TASKS_KEY, tasks.filter((t) => t !== objetivoTarea));

        // Se re-renderiza la lista para que el contador se actualice
        if (panel && typeof renderTasksMateriaPage === 'function') {
            renderTasksMateriaPage();
        } else {
            if (typeof renderTasksInicio === 'function') renderTasksInicio();
            if (typeof updateMetrics === 'function') updateMetrics();
        }
    }

    function eliminarExamen(elemento, panel) {
        const exams = leerArray(EXAMS_KEY);
        let indice;
        let objetivoExamen;

        if (panel) {
            const cardList = panel.querySelector('.card-list');
            if (!cardList) return;
            const cards = Array.from(cardList.querySelectorAll('.card'));
            indice = cards.indexOf(elemento);
            if (indice < 0) return;

            const materia = typeof getMateriaActual === 'function' ? getMateriaActual() : null;
            const filtradas = exams.filter((x) => x.materia === materia);
            objetivoExamen = filtradas[indice];
        } else {
            const lista = elemento.parentElement;
            const items = Array.from(lista.querySelectorAll('.task-item'));
            indice = items.indexOf(elemento);
            if (indice < 0) return;
            objetivoExamen = exams[indice];
        }

        if (!objetivoExamen) return;
        if (!confirm('¿Eliminar este examen?')) return;

        guardarArray(EXAMS_KEY, exams.filter((x) => x !== objetivoExamen));

        if (panel && typeof renderExamsMateriaPage === 'function') {
            renderExamsMateriaPage();
        } else {
            if (typeof renderExamList === 'function') renderExamList();
            if (typeof renderExamMetric === 'function') renderExamMetric();
        }
    }

    // --------------------------------------------------------------------------
    // 5. EVENTOS: mostrar, elegir y ocultar el menú
    // --------------------------------------------------------------------------
    // Clic derecho: se muestra el menú SOLO si el elemento se puede eliminar.
    // Si no, se deja pasar el menú nativo del navegador.
    document.addEventListener('contextmenu', (e) => {
        const info = resolverClic(e);
        if (!info) {
            ocultarMenu();
            return;
        }
        e.preventDefault();
        mostrarMenu(e.clientX, e.clientY, info);
    });

    // Al elegir "Eliminar" se ejecuta la acción correspondiente.
    eliminarBtn.addEventListener('click', () => {
        const info = objetivo;
        ocultarMenu();
        if (!info) return;

        if (info.tipo === 'materia') eliminarMateria(info.elemento);
        else if (info.tipo === 'tarea') eliminarTarea(info.elemento, info.panel);
        else if (info.tipo === 'examen') eliminarExamen(info.elemento, info.panel);
    });

    // Se oculta el menú al hacer clic en cualquier otro lugar, con Escape,
    // al hacer scroll o al redimensionar la ventana.
    document.addEventListener('click', () => ocultarMenu());
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') ocultarMenu();
    });
    window.addEventListener('resize', ocultarMenu);
    document.addEventListener('scroll', ocultarMenu, true);
})();
