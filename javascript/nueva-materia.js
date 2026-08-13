// =============================================================================
// nueva-materia.js
// -----------------------------------------------------------------------------
// Este archivo maneja TODO lo relacionado con las materias creadas por el usuario:
//   1. La VISTA PREVIA en tiempo real en materia.html (mientras el usuario escribe).
//   2. GUARDAR la materia en un array persistido en localStorage.
//   3. MOSTRAR las materias guardadas como tarjetas en menu.html.
//   4. MOSTRAR el nombre en la vista materia-creada.html.
//
// Cómo se guarda la información (para no romper las funciones de materias.js,
// nueva-tarea.js y nuevo-examen.js que bajamos del repositorio):
//   - La clave 'focusClassMaterias' guarda SOLO los NOMBRES como strings:
//       [ "Matemáticas", "Física", ... ]
//     Ese es el formato que esperan las funciones compartidas (materias.js usa
//     esta clave para llenar el select de materia en tareas/exámenes).
//   - Los detalles (docente y descripción) se guardan en una clave aparte
//     'focusClassMateriasDetalles' con el formato:
//       [ { materia: "...", docente: "...", descripcion: "..." }, ... ]
//     Así la vista previa y las tarjetas del menú tienen datos extra.
//
// En localStorage solo se pueden guardar TEXTOS, por eso se convierte con
// JSON.stringify (objeto/array -> texto) y al leerlo se convierte de vuelta
// con JSON.parse (texto -> array).
//
// La imagen de fondo de TODAS las materias nuevas es la misma:
//   assets/img/imagen-generica.png (se ignora la sección de iconos y colores).
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================================
    // 1. CONFIGURACIÓN Y FUNCIONES BASE PARA LEER/ESCRIBIR LOS ARRAYS
    // ==========================================================================
    // Clave con los NOMBRES de las materias (la usan las funciones compartidas)
    const STORAGE_KEY = 'focusClassMaterias';
    // Clave con los DETALLES completos (docente y descripción)
    const DETAILS_KEY = 'focusClassMateriasDetalles';
    // Claves usadas solo al eliminar una materia (también borran sus tareas/exámenes)
    const TASKS_STORAGE_KEY = 'focusClassTasks';
    const EXAMS_STORAGE_KEY = 'focusClassExams';

    // Ruta de la imagen genérica que se usa como fondo de todas las materias
    // (desde las páginas de la carpeta /html se sube un nivel con ../)
    const IMAGEN_GENERICA = '../assets/img/imagen-generica.png';

    // Lee los nombres (strings) de las materias guardadas.
    // try/catch: si el texto guardado está dañado, devuelve un array vacío
    // en lugar de romper toda la página con un error.
    function cargarNombres() {
        try {
            const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
            return Array.isArray(data)
                ? data.filter((item) => typeof item === 'string')
                : [];
        } catch (e) {
            return [];
        }
    }

    // Lee los detalles completos (objetos) de las materias.
    function cargarDetalles() {
        try {
            const data = JSON.parse(localStorage.getItem(DETAILS_KEY)) || [];
            return Array.isArray(data) ? data : [];
        } catch (e) {
            return [];
        }
    }

    // Devuelve las materias como objetos { materia, docente, descripcion }.
    // Junta los nombres (strings) con los detalles guardados por separado.
    // Los nombres que no tengan detalles se completan con campos vacíos.
    function cargarMaterias() {
        const nombres = cargarNombres();
        const detalles = cargarDetalles();

        const detallePorNombre = {};
        detalles.forEach((detalle) => {
            if (detalle && typeof detalle.materia === 'string') {
                detallePorNombre[detalle.materia] = detalle;
            }
        });

        return nombres.map((nombre) => (
            detallePorNombre[nombre] || { materia: nombre, docente: '', descripcion: '' }
        ));
    }

    // Sobrescribe en localStorage el array de nombres (strings).
    // JSON.stringify convierte el array en un texto plano para poder guardarlo.
    function guardarNombres(nombres) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nombres));
    }

    // Sobrescribe en localStorage el array de detalles completos.
    function guardarDetalles(detalles) {
        localStorage.setItem(DETAILS_KEY, JSON.stringify(detalles));
    }

    // ==========================================================================
    // 2. VISTA PREVIA EN TIEMPO REAL (materia.html)
    // ==========================================================================
    // Primero se buscan los elementos del formulario y de la tarjeta de vista
    // previa por su id. Se guardan en constantes para no buscarlos cada vez.
    // Los "if" de cada sección son de seguridad: si el script se ejecuta en
    // menu.html, estos elementos NO existen, y sin el if se rompería el script.
    const materiaInput = document.getElementById('materia-name');      // input del nombre
    const docenteInput = document.getElementById('materia-teacher');   // input del docente
    const descInput = document.getElementById('materia-desc');         // textarea descripción
    const contadorDesc = document.getElementById('materia-desc-count');// span "0 / 25"
    const previewMateria = document.getElementById('preview-materia'); // span del nombre en la preview
    const previewDocente = document.getElementById('preview-docente'); // span del docente en la preview
    const previewDesc = document.getElementById('preview-desc');       // p de descripción en la preview
    const previewCard = document.getElementById('preview-card');       // tarjeta de la vista previa
    const previewIcono = document.getElementById('preview-icon');      // icono/logo en la vista previa

    // Icono (logo) y color que el usuario eligió en la sección de personalización.
    let iconoSeleccionado = '';
    let colorSeleccionado = '#0056d2';

    // Copia lo que el usuario escribe en los campos hacia la tarjeta de vista
    // previa. Si el campo está vacío, muestra un texto de ejemplo.
    // El operador ternario (condición ? valorSiTrue : valorSiFalse) elige
    // entre el texto del usuario o el texto de ejemplo.
    function actualizarVistaPrevia() {
        if (previewMateria) {
            previewMateria.textContent = materiaInput && materiaInput.value.trim()
                ? materiaInput.value.trim()
                : 'Nombre de la materia';
        }
        if (previewDocente) {
            previewDocente.textContent = docenteInput && docenteInput.value.trim()
                ? docenteInput.value.trim()
                : 'Prof. García';
        }
        if (previewDesc) {
            previewDesc.textContent = descInput && descInput.value.trim()
                ? descInput.value.trim()
                : 'Breve descripción de la materia';
        }
        // El color elegido se aplica como un pequeño margen/borde en la tarjeta.
        // Si no se eligió color, la tarjeta queda con su borde normal.
        if (previewCard) {
            previewCard.style.border = colorSeleccionado
                ? '3px solid ' + colorSeleccionado
                : '1px solid #e0e4eb';
        }
        // El logo elegido se muestra en la esquina superior derecha de la preview.
        // Si se eligió "sin logo", la preview queda sin icono.
        if (previewIcono) {
            previewIcono.innerHTML = iconoSeleccionado
                ? '<i class="' + iconoSeleccionado + '"></i>'
                : '';
        }
    }

    // Actualiza el contador de caracteres de la descripción (máx. 25).
    // .length cuenta cuántos caracteres tiene el texto escrito.
    function actualizarContador() {
        if (contadorDesc && descInput) {
            contadorDesc.textContent = descInput.value.length + ' / 25';
        }
    }

    // Evento "input": se dispara CADA VEZ que el usuario escribe o borra algo.
    // Así la vista previa se actualiza letra por letra, sin necesidad de un botón.
    if (materiaInput) {
        materiaInput.addEventListener('input', actualizarVistaPrevia);
    }
    if (docenteInput) {
        docenteInput.addEventListener('input', actualizarVistaPrevia);
    }
    if (descInput) {
        // En la descripción además se actualiza el contador de caracteres
        descInput.addEventListener('input', () => {
            actualizarVistaPrevia();
            actualizarContador();
        });
    }

    // Se ejecutan una vez al cargar la página para que la preview muestre
    // los textos de ejemplo desde el inicio (los spans ya los traen en el HTML).
    actualizarVistaPrevia();
    actualizarContador();

    // ==========================================================================
    // 2.1 SELECCIÓN DEL LOGO (icono) Y DEL COLOR (materia.html)
    // ==========================================================================
    const iconoBtns = document.querySelectorAll('.icon-selector .icon-btn');
    const colorCircles = document.querySelectorAll('.color-selector .color-circle');

    // Marca el logo elegido (se ilumina su botón) y refresca la vista previa.
    // El botón con data-sin-icono representa "sin logo" y guarda un valor vacío.
    function seleccionarIcono(btn) {
        iconoBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const icono = btn.querySelector('i');
        iconoSeleccionado = btn.hasAttribute('data-sin-icono')
            ? ''
            : (icono ? icono.className : '');
        actualizarVistaPrevia();
    }

    iconoBtns.forEach((btn) => {
        btn.addEventListener('click', () => seleccionarIcono(btn));
    });

    // Marca el color elegido (anillo rosa) y refresca la vista previa.
    // El círculo con data-color vacío representa "sin margen".
    function seleccionarColor(circle) {
        colorCircles.forEach((c) => c.classList.remove('active'));
        circle.classList.add('active');
        colorSeleccionado = circle.getAttribute('data-color') || '';
        actualizarVistaPrevia();
    }

    colorCircles.forEach((circle) => {
        circle.addEventListener('click', () => seleccionarColor(circle));
    });

    // Al cargar la página se toman los que ya vienen marcados en el HTML
    // (primer logo "libro" y primer color azul), para que la preview los use.
    // Solo se hace en materia.html, donde esos elementos existen.
    if (iconoBtns.length > 0) {
        seleccionarIcono(document.querySelector('.icon-selector .icon-btn.active') || iconoBtns[0]);
    }
    if (colorCircles.length > 0) {
        seleccionarColor(document.querySelector('.color-selector .color-circle.active') || colorCircles[0]);
    }

    // ==========================================================================
    // 3. GUARDAR UNA NUEVA MATERIA (materia.html)
    // ==========================================================================
    // Botón "Guardar materia" con su id del HTML
    const btnGuardar = document.getElementById('btnGuardarMateria');
    if (btnGuardar) {
        // Evento "click": ocurre cuando el usuario presiona el botón.
        btnGuardar.addEventListener('click', () => {
            // Se leen los valores de los campos y se les quita los espacios
            // sobrantes al inicio/final con .trim().
            const materia = materiaInput ? materiaInput.value.trim() : '';
            const docente = docenteInput ? docenteInput.value.trim() : '';
            const descripcion = descInput ? descInput.value.trim() : '';

            // Validación: si no hay nombre de materia no se guarda nada.
            if (!materia) {
                alert('Ingresa el nombre de la materia.');
                return; // return detiene la ejecución de la función aquí
            }

            // Se leen los arrays actuales, se agrega la materia nueva y se
            // vuelven a guardar. Los NOMBRES se guardan como strings en
            // 'focusClassMaterias' (formato que usan materias.js, nueva-tarea.js
            // y nuevo-examen.js) y los DETALLES en 'focusClassMateriasDetalles'.
            const nombres = cargarNombres();
            if (!nombres.includes(materia)) {
                nombres.push(materia);
                guardarNombres(nombres);
            }

            const detalles = cargarDetalles();
            if (!detalles.some((detalle) => detalle.materia === materia)) {
                detalles.push({
                    materia,
                    docente,
                    descripcion,
                    icono: iconoSeleccionado,
                    color: colorSeleccionado
                });
                guardarDetalles(detalles);
            }

            alert('Materia guardada correctamente.');
            // Redirección a la página de inicio donde se muestra la grilla
            window.location.href = 'menu.html';
        });
    }

    // Botón "Cancelar": simplemente regresa a menu.html sin guardar nada.
    const btnCancelar = document.getElementById('btnCancelarMateria');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            window.location.href = 'menu.html';
        });
    }

    // ==========================================================================
    // 4. MOSTRAR LAS MATERIAS GUARDADAS (menu.html)
    // ==========================================================================
    // Busca la tarjeta "Agregar nueva materia" (tiene la clase .card-add).
    // Las tarjetas nuevas se insertan en la grilla JUSTO ANTES de esa tarjeta,
    // así siempre queda al final como botón para seguir agregando.
    const cardAdd = document.querySelector('.card-add');
    if (cardAdd) {
        // El contenedor padre de .card-add es la grilla .courses-grid
        const grid = cardAdd.parentElement;
        if (grid) {
            // IMPORTANTE: primero se eliminan las tarjetas ".card-new" que ya
            // existan en el HTML. Esto evita que se DUPLIQUEN cada vez que se
            // carga o recarga la página (los datos reales están en localStorage,
            // el HTML solo es la "plantilla").
            grid.querySelectorAll('.course-card.card-new').forEach((el) => el.remove());

            // Se lee el array de materias guardadas y se crea una tarjeta por cada una.
            const materias = cargarMaterias();
            materias.forEach((m) => {
                // Se crean los elementos del DOM con JavaScript (createElement)
                // en lugar de escribirlos a mano en el HTML, porque dependen
                // de los datos que el usuario guardó.

                // 4.1 Enlace = tarjeta completa (como las tarjetas fijas del menú).
                // El enlace lleva a materia-creada.html y pasa el nombre de la
                // materia por la URL (?nombre=...) para que esa vista lo muestre
                // en grande en su banner.
                const card = document.createElement('a');
                card.href = 'materia-creada.html?nombre=' + encodeURIComponent(m.materia);
                card.className = 'course-card card-new'; // reutiliza el estilo de las tarjetas
                card.style.textDecoration = 'none';
                card.style.display = 'block';

                // 4.2 Imagen de fondo genérica (la misma para todas las materias)
                const img = document.createElement('img');
                img.src = IMAGEN_GENERICA;
                img.className = 'card-banner'; // el CSS la posiciona de fondo cubriendo la tarjeta
                img.alt = m.materia;
                card.appendChild(img);

                // 4.3 Contenedor con el texto que va ENCIMA de la imagen
                const content = document.createElement('div');
                content.className = 'card-new-content';

                // Nombre de la materia (título de la tarjeta)
                const h3 = document.createElement('h3');
                h3.textContent = m.materia;

                // Nombre del docente (si no tiene, muestra "Sin docente")
                const teacher = document.createElement('span');
                teacher.className = 'card-new-teacher';
                teacher.textContent = m.docente || 'Sin docente';

                // Descripción breve (si está vacía, no se muestra nada)
                const desc = document.createElement('p');
                desc.className = 'card-new-desc';
                desc.textContent = m.descripcion || '';

                // Se arma la tarjeta en orden: título -> docente -> descripción
                content.appendChild(h3);
                content.appendChild(teacher);
                content.appendChild(desc);
                card.appendChild(content);

                // 4.4 Logo elegido por el usuario: se coloca en la esquina
                // superior izquierda de la tarjeta (si dejó uno seleccionado).
                // El nombre se corre a la derecha para que no choque con el logo.
                if (m.icono) {
                    const icono = document.createElement('i');
                    icono.className = m.icono;
                    icono.classList.add('card-new-icon');
                    card.appendChild(icono);
                    content.style.paddingLeft = '38px';
                }

                // 4.5 Color elegido por el usuario: se aplica como un pequeño
                // margen/borde de la tarjeta (no como fondo completo).
                if (m.color) {
                    card.style.border = '3px solid ' + m.color;
                }

                // 4.6 Botón pequeño de eliminar materia (papelera).
                // Se evita que el clic navegue hacia la página de la materia.
                const deleteBtn = document.createElement('button');
                deleteBtn.type = 'button';
                deleteBtn.className = 'card-delete-btn';
                deleteBtn.title = 'Eliminar materia';
                deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
                card.appendChild(deleteBtn);

                deleteBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    eliminarMateriaBorrada(m.materia, card);
                });

                // 4.7 Se coloca la tarjeta en la grilla, justo antes de
                // la tarjeta "Agregar nueva materia" (.card-add).
                grid.insertBefore(card, cardAdd);
            });
        }
    }

    // ==========================================================================
    // 5. MOSTRAR EL NOMBRE EN LA VISTA DE LA MATERIA (materia-creada.html)
    // ==========================================================================
    // Esta parte solo se ejecuta cuando estamos en materia-creada.html.
    // El nombre de la materia llega por la URL en forma de parámetro:
    //   materia-creada.html?nombre=Matematicas
    // Se extrae con URLSearchParams y se coloca en el <h1> grande del banner.
    const tituloMateria = document.getElementById('materia-creada-titulo');
    if (tituloMateria) {
        // Lee el parámetro "nombre" de la URL
        const nombreParam = new URLSearchParams(window.location.search).get('nombre');

        // Si viene un nombre se muestra; si no, queda el texto por defecto
        if (nombreParam) {
            tituloMateria.textContent = nombreParam;
            document.title = 'Focus Class - ' + nombreParam;

            // Se aplican el logo y el color elegidos al banner de la materia.
            const detalle = cargarDetalles().find((d) => d && d.materia === nombreParam);
            const banner = document.querySelector('.banner-materia');
            if (banner) {
                if (detalle) {
                    // Color como pequeño margen/borde del banner.
                    if (detalle.color) {
                        banner.style.border = '3px solid ' + detalle.color;
                    }
                    // Logo/icono elegido reemplaza al emoji del banner.
                    if (detalle.icono) {
                        const bannerIcon = banner.querySelector('.banner-icon');
                        if (bannerIcon) {
                            bannerIcon.innerHTML = '<i class="' + detalle.icono + '"></i>';
                        }
                    }
                }

                // Botón pequeño para eliminar la materia creada desde su banner.
                const deleteMateriaBtn = document.createElement('button');
                deleteMateriaBtn.type = 'button';
                deleteMateriaBtn.className = 'banner-delete-btn';
                deleteMateriaBtn.title = 'Eliminar materia';
                deleteMateriaBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
                banner.appendChild(deleteMateriaBtn);

                deleteMateriaBtn.addEventListener('click', () => {
                    eliminarMateriaBorrada(nombreParam, null);
                    window.location.href = 'menu.html';
                });
            }
        }
    }

    // ==========================================================================
    // 6. ELIMINAR UNA MATERIA CREADA DESDE SU TARJETA (menu.html)
    //    - Borra el nombre y los detalles de localStorage.
    //    - También borra las tareas y exámenes asociados a esa materia.
    // ==========================================================================
    function eliminarMateriaBorrada(nombre, card) {
        if (!nombre) return;
        if (!confirm('¿Eliminar la materia "' + nombre + '"? También se eliminarán sus tareas y exámenes.')) return;

        // Se quita el nombre de los nombres guardados.
        const nombres = cargarNombres().filter((n) => n !== nombre);
        guardarNombres(nombres);

        // Se quitan los detalles de esa materia.
        const detalles = cargarDetalles().filter((d) => !d || d.materia !== nombre);
        guardarDetalles(detalles);

        // Se quitan las tareas de esa materia.
        try {
            const tasks = JSON.parse(localStorage.getItem(TASKS_STORAGE_KEY) || '[]')
                .filter((t) => t.materia !== nombre);
            localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
        } catch (e) { /* sin tareas guardadas */ }

        // Se quitan los exámenes de esa materia.
        try {
            const exams = JSON.parse(localStorage.getItem(EXAMS_STORAGE_KEY) || '[]')
                .filter((x) => x.materia !== nombre);
            localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(exams));
        } catch (e) { /* sin exámenes guardados */ }

        // Se retira la tarjeta de la grilla.
        if (card && card.parentElement) card.remove();

        // Se re-renderizan las listas visibles de tareas y exámenes (menu.html)
        // para que las de la materia eliminada desaparezcan de la vista previa
        // sin necesidad de recargar la página.
        if (typeof renderTasksInicio === 'function') renderTasksInicio();
        if (typeof renderModalTareas === 'function') renderModalTareas();
        if (typeof renderExamList === 'function') renderExamList();
        if (typeof renderModalExamenes === 'function') renderModalExamenes();
        if (typeof renderExamMetric === 'function') renderExamMetric();

        // Se actualizan los contadores de la página (si existen).
        if (typeof updateMetrics === 'function') updateMetrics();
    }
});
