// =============================================================================
// nueva-materia.js
// -----------------------------------------------------------------------------
// Este archivo maneja TODO lo relacionado con las materias creadas por el usuario:
//   1. La VISTA PREVIA en tiempo real en materia.html (mientras el usuario escribe).
//   2. GUARDAR la materia en un array persistido en localStorage.
//   3. MOSTRAR las materias guardadas como tarjetas en menu.html.
//
// Cómo se guarda la información:
//   - En el navegador existe "localStorage", una memoria que sobrevive aunque
//     cambies de página o cierres y abras el navegador.
//   - En localStorage solo se pueden guardar TEXTOS, por eso para guardar un
//     array se convierte con JSON.stringify (objeto/array -> texto) y al leerlo
//     se convierte de vuelta con JSON.parse (texto -> array).
//   - La clave usada es 'focusClassMaterias' y el formato es:
//       [ { materia: "...", docente: "...", descripcion: "..." }, ... ]
//
// La imagen de fondo de TODAS las materias nuevas es la misma:
//   assets/img/imagen-generica.png (se ignora la sección de iconos y colores).
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================================
    // 1. CONFIGURACIÓN Y FUNCIONES BASE PARA LEER/ESCRIBIR EL ARRAY
    // ==========================================================================
    // Clave con la que se identifica el array dentro de localStorage
    const STORAGE_KEY = 'focusClassMaterias';

    // Ruta de la imagen genérica que se usa como fondo de todas las materias
    // (desde las páginas de la carpeta /html se sube un nivel con ../)
    const IMAGEN_GENERICA = '../assets/img/imagen-generica.png';

    // Lee el array de materias desde localStorage.
    // try/catch: si el texto guardado está dañado, devuelve un array vacío
    // en lugar de romper toda la página con un error.
    function cargarMaterias() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch (e) {
            return [];
        }
    }

    // Sobrescribe en localStorage el array completo de materias.
    // JSON.stringify convierte el array en un texto plano para poder guardarlo.
    function guardarMaterias(materias) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(materias));
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

            // Se lee el array actual, se agrega el nuevo objeto con .push()
            // (que añade un elemento AL FINAL del array) y se vuelve a guardar.
            const materias = cargarMaterias();
            materias.push({ materia, docente, descripcion });
            guardarMaterias(materias);

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

                // 4.4 Se coloca la tarjeta en la grilla, justo antes de
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
        }
    }
});
