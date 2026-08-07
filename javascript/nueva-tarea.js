document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================================
    // TARJETA CON ALTURA FIJA Y SCROLL INTERNO (sin cambiar su tamaño)
    // ==========================================================================
    const tasksList = document.querySelector('.tasks-list'); // lista "Tareas pendientes" (menu.html)

    function fitBox() {
        // Panel "Tareas pendientes": altura fija en la lista para que el cuadro no crezca.
        // El encabezado y el botón quedan fijos y solo la lista hace scroll.
        if (tasksList) {
            tasksList.style.maxHeight = '';
            const availList = window.innerHeight - 320;
            const listHeight = Math.max(120, Math.min(320, availList));
            tasksList.style.maxHeight = listHeight + 'px';
            tasksList.style.overflowY = 'auto';
            tasksList.style.overflowX = 'hidden';
            tasksList.style.paddingRight = '6px';
        }
    }

    fitBox();
    window.addEventListener('resize', fitBox);

    // ==========================================================================
    // TAREAS (AGREGAR Y MOSTRAR) VÍA localStorage
    // ==========================================================================
    const STORAGE_KEY = 'focusClassTasks';

    function formatDate(value) {
        if (!value) return 'Sin fecha';
        const parts = value.split('-');
        return parts.length === 3 ? parts.reverse().join('/') : value;
    }

    function getStatusClass(priority) {
        if (priority === 'baja') return 'green';
        if (priority === 'media') return 'orange';
        return 'red';
    }

    // Sembrar las 4 tareas precargadas si no hay nada guardado aún
    if (!localStorage.getItem(STORAGE_KEY)) {
        const preloaded = [
            { name: 'Matemáticas', desc: 'Resolver guía 3', dueDate: '2025-05-24', priority: 'alta' },
            { name: 'Ciencia', desc: 'Resolver quiz 3', dueDate: '2025-05-24', priority: 'alta' },
            { name: 'Inglés', desc: 'Resolver guía 2', dueDate: '2025-05-24', priority: 'baja' },
            { name: 'Matemáticas', desc: 'Resolver guía 3', dueDate: '2025-05-24', priority: 'media' },
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preloaded));
    }

    // Guardar una nueva tarea desde el formulario de nueva-tarea.html
    const taskForm = document.querySelector('.task-form');
    if (taskForm) {
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nameInput = document.getElementById('task-name');
            const descInput = document.getElementById('task-desc');
            const dateInput = document.getElementById('due-date');
            const prioritySelect = document.getElementById('priority');

            const name = nameInput ? nameInput.value.trim() : '';
            const desc = descInput ? descInput.value.trim() : '';
            const dueDate = dateInput ? dateInput.value : '';
            const priority = prioritySelect ? prioritySelect.value : 'alta';

            if (!name) return;

            const tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            tasks.push({ name, desc, dueDate, priority });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));

            if (taskForm.reset) taskForm.reset();
            alert('Tarea guardada correctamente.');
            window.location.href = 'menu.html';
        });
    }

    // Renderizar las tareas guardadas en la lista "Tareas pendientes" de menu.html
    if (tasksList) {
        // Limpiar los items estáticos del HTML para que todo venga de localStorage
        tasksList.querySelectorAll('.task-item').forEach((el) => el.remove());

        const tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

        tasks.forEach((task) => {
            const item = document.createElement('div');
            item.className = 'task-item';

            const status = document.createElement('span');
            status.className = 'status-indicator ' + getStatusClass(task.priority);

            const info = document.createElement('div');
            info.className = 'task-info';

            const infoTitle = document.createElement('h4');
            infoTitle.textContent = task.name || 'Tarea';

            const infoText = document.createElement('p');
            infoText.textContent = task.desc || 'Sin descripción';

            info.appendChild(infoTitle);
            info.appendChild(infoText);

            const dateBox = document.createElement('div');
            dateBox.className = 'task-date';

            const dateLabel = document.createElement('span');
            dateLabel.textContent = 'Fecha de entrega:';

            const dateValue = document.createElement('strong');
            dateValue.className = 'text-red';
            dateValue.textContent = formatDate(task.dueDate);

            dateBox.appendChild(dateLabel);
            dateBox.appendChild(dateValue);

            item.appendChild(status);
            item.appendChild(info);
            item.appendChild(dateBox);

            tasksList.appendChild(item);
        });
    }

    // ==========================================================================
    // CONTADORES (Materias, Tareas, Tareas pendientes) en menu.html
    // ==========================================================================
    function updateMetrics() {
        const metricCards = document.querySelectorAll('.metric-card');
        if (metricCards.length === 0) return;

        const tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

        // Materias: cuenta las tarjetas de curso reales en la grilla (sin la de agregar)
        const courseCount = document.querySelectorAll('.courses-grid a.course-card').length;

        // Tareas pendientes: las que tienen fecha hoy/futura o sin fecha
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const pending = tasks.filter((task) => {
            if (!task.dueDate) return true;
            const d = new Date(task.dueDate + 'T00:00:00');
            return d >= today;
        }).length;

        metricCards.forEach((card) => {
            const label = card.querySelector('p');
            const valueEl = card.querySelector('h3');
            if (!label || !valueEl) return;

            const text = label.textContent.toLowerCase().trim();

            if (text.includes('materias')) {
                valueEl.textContent = courseCount;
            } else if (text.includes('tareas pendientes')) {
                valueEl.textContent = pending;
            } else if (text.includes('tareas')) {
                valueEl.textContent = tasks.length;
            }
        });
    }

    updateMetrics();
});