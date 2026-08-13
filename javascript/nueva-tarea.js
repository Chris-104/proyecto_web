// ==========================================================================
// MATERIAS: por defecto + agregadas (ver materias.js)
// getTodasLasMaterias() y getMateriaActual() vienen de materias.js
// ==========================================================================

// ==========================================================================
// TAREAS (AGREGAR Y MOSTRAR) VÍA localStorage
// ==========================================================================
const TASK_STORAGE_KEY = 'focusClassTasks';

function getTasks() {
    return JSON.parse(localStorage.getItem(TASK_STORAGE_KEY) || '[]');
}

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

// ==========================================================================
// SELECTOR DE MATERIA (nueva-tarea.html)
// ==========================================================================
function crearSelectMateria(id, className, preseleccion) {
    const select = document.createElement('select');
    select.id = id;
    select.className = className;
    select.required = true;

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Selecciona una materia';
    select.appendChild(placeholder);

    getTodasLasMaterias().forEach((nombre) => {
        const opcion = document.createElement('option');
        opcion.value = nombre;
        opcion.textContent = nombre;
        select.appendChild(opcion);
    });

    if (preseleccion) select.value = preseleccion;
    return select;
}

function setupTaskMateriaSelect() {
    const form = document.querySelector('.task-form');
    if (!form) return;

    const params = new URLSearchParams(window.location.search);
    const preseleccion = params.get('materia');

    const field = document.createElement('div');
    field.className = 'task-form__field';

    const label = document.createElement('label');
    label.htmlFor = 'task-materia';
    label.className = 'task-form__label';
    label.textContent = 'Materia';

    const select = crearSelectMateria('task-materia', 'task-form__select', preseleccion);

    field.appendChild(label);
    field.appendChild(select);
    form.insertBefore(field, form.firstChild);
}

// ==========================================================================
// GUARDAR TAREA (nueva-tarea.html)
// ==========================================================================
function handleTaskForm() {
    const taskForm = document.querySelector('.task-form');
    if (!taskForm) return;

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('task-name');
        const descInput = document.getElementById('task-desc');
        const dateInput = document.getElementById('due-date');
        const prioritySelect = document.getElementById('priority');
        const materiaSelect = document.getElementById('task-materia');

        const name = nameInput ? nameInput.value.trim() : '';
        const desc = descInput ? descInput.value.trim() : '';
        const dueDate = dateInput ? dateInput.value : '';
        const priority = prioritySelect ? prioritySelect.value : 'alta';
        const materia = materiaSelect ? materiaSelect.value : '';

        if (!name || !materia) return;
        if (!dueDate) {
            alert('La fecha de entrega es obligatoria.');
            if (dateInput) dateInput.focus();
            return;
        }

        const tasks = getTasks();
        tasks.push({ name, desc, dueDate, priority, materia });
        localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));

        if (taskForm.reset) taskForm.reset();
        alert('Tarea guardada correctamente.');
        window.location.href = 'menu.html';
    });
}

// ==========================================================================
// TARJETA DE TAREA PARA PÁGINAS DE MATERIA
// ==========================================================================
function crearCardTarea(task) {
    const card = document.createElement('div');
    card.className = 'card';

    const left = document.createElement('div');
    left.className = 'card-left';

    const icon = document.createElement('span');
    icon.className = 'card-icon-file';
    icon.textContent = '📄';

    const info = document.createElement('div');
    info.className = 'card-info';

    const h3 = document.createElement('h3');
    h3.textContent = task.name || 'Tarea';

    const p = document.createElement('p');
    p.textContent = task.desc || 'Sin descripción';

    info.appendChild(h3);
    info.appendChild(p);

    left.appendChild(icon);
    left.appendChild(info);

    const right = document.createElement('div');
    right.className = 'card-right';

    const dateBox = document.createElement('div');
    dateBox.className = 'card-date';

    const span = document.createElement('span');
    span.textContent = '📅 ' + formatDate(task.dueDate);

    const small = document.createElement('small');
    small.textContent = 'Fecha de entrega';

    dateBox.appendChild(span);
    dateBox.appendChild(small);

    const arrow = document.createElement('span');
    arrow.className = 'card-arrow';
    arrow.textContent = '>';

    right.appendChild(dateBox);
    right.appendChild(arrow);

    // Botón pequeño para eliminar la tarea desde la página de la materia.
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'card-delete-btn';
    deleteBtn.title = 'Eliminar tarea';
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
    right.appendChild(deleteBtn);

    deleteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        borrarTareaDeTarjeta(card);
    });

    card.appendChild(left);
    card.appendChild(right);
    return card;
}

// Borra una tarea desde su tarjeta en la página de la materia.
function borrarTareaDeTarjeta(card) {
    const panel = card.closest('.panel');
    if (!panel) return;
    const cardList = panel.querySelector('.card-list');
    if (!cardList) return;

    const cards = Array.from(cardList.querySelectorAll('.card'));
    const indice = cards.indexOf(card);
    if (indice < 0) return;

    const tasks = getTasks();
    const materia = getMateriaActual();
    const deEstaMateria = tasks.filter((tarea) => tarea.materia === materia);
    const objetivo = deEstaMateria[indice];
    if (!objetivo) return;

    if (!confirm('¿Eliminar esta tarea?')) return;

    localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks.filter((tarea) => tarea !== objetivo)));
    renderTasksMateriaPage();
    if (typeof updateMetrics === 'function') updateMetrics();
}

// ==========================================================================
// RENDERIZAR TAREAS DE LA MATERIA EN SU PÁGINA
// ==========================================================================
function renderTasksMateriaPage() {
    const materia = getMateriaActual();
    if (!materia) return;

    const panels = document.querySelectorAll('.panel');
    panels.forEach((panel) => {
        const heading = panel.querySelector('.panel-header h2');
        if (!heading || !heading.textContent.toLowerCase().includes('tareas')) return;

        const cardList = panel.querySelector('.card-list');
        const badge = panel.querySelector('.badge');
        const addBtn = panel.querySelector('a.btn-add');
        if (!cardList) return;

        if (addBtn && addBtn.getAttribute('href')) {
            addBtn.href = 'nueva-tarea.html?materia=' + encodeURIComponent(materia);
        }

        cardList.querySelectorAll('.card').forEach((card) => card.remove());

        const tareas = getTasks().filter((tarea) => tarea.materia === materia);

        tareas.forEach((tarea) => cardList.appendChild(crearCardTarea(tarea)));

        if (badge) {
            badge.textContent = tareas.length + (tareas.length === 1 ? ' pendiente' : ' pendientes');
        }
    });
}

// ==========================================================================
// MOSTRAR TAREAS EN LA VISTA DE INICIO (menu.html)
// ==========================================================================
function crearTaskItem(task) {
    const item = document.createElement('div');
    item.className = 'task-item';

    const status = document.createElement('span');
    status.className = 'status-indicator ' + getStatusClass(task.priority);

    const info = document.createElement('div');
    info.className = 'task-info';

    const infoTitle = document.createElement('h4');
    infoTitle.textContent = task.materia || 'General';

    const infoText = document.createElement('p');
    infoText.textContent = task.name || 'Tarea';

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

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.type = 'button';
    deleteBtn.title = 'Borrar tarea';
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';

    item.appendChild(status);
    item.appendChild(info);
    item.appendChild(dateBox);
    item.appendChild(deleteBtn);

    return item;
}

function renderListaTareas(list, tasks) {
    if (!list) return;

    list.querySelectorAll('.task-item, .empty-state').forEach((el) => el.remove());

    if (tasks.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'empty-state';
        empty.textContent = 'No hay tareas pendientes';
        list.appendChild(empty);
        return;
    }

    tasks.forEach((task) => list.appendChild(crearTaskItem(task)));
}

function renderTasksInicio() {
    const tasksList = document.querySelector('.sidebar-section .pending-box .tasks-list');
    if (!tasksList) return;

    renderListaTareas(tasksList, getTasks());

    // Mostrar máximo 2 tareas de vista; el resto con scroll interno
    const firstItem = tasksList.querySelector('.task-item');
    const gap = 10;
    const listHeight = firstItem ? firstItem.offsetHeight * 2 + gap : 170;
    tasksList.style.maxHeight = listHeight + 'px';
    tasksList.style.overflowY = 'auto';
    tasksList.style.overflowX = 'hidden';
    tasksList.style.paddingRight = '6px';
}

// ==========================================================================
// MOSTRAR TAREAS EN LA VENTANA MODAL (menu.html)
// ==========================================================================
function renderModalTareas() {
    const list = document.querySelector('#modalTareas .modal-body .tasks-list');
    if (!list) return;
    renderListaTareas(list, getTasks());
}

// ==========================================================================
// CONTADORES (Materias, Tareas, Tareas pendientes) en menu.html
// ==========================================================================
function updateMetrics() {
    const metricCards = document.querySelectorAll('.metric-card');
    if (metricCards.length === 0) return;

    const tasks = getTasks();

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

// ==========================================================================
// LAYOUT: subir el cuadro de tareas y apilar tareas/exámenes en columna
// ==========================================================================
function layoutBoxes() {
    const sidebarSection = document.querySelector('.sidebar-section');
    if (!sidebarSection) return;

    sidebarSection.style.display = 'flex';
    sidebarSection.style.flexDirection = 'column';
    sidebarSection.style.gap = '12px';
    sidebarSection.style.alignItems = 'stretch';

    const pendingBox = sidebarSection.querySelector('.pending-box');
    if (pendingBox) {
        pendingBox.style.width = '100%';
        pendingBox.style.boxSizing = 'border-box';
        pendingBox.style.marginTop = '1rem';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    layoutBoxes();
    setupTaskMateriaSelect();
    handleTaskForm();
    renderTasksMateriaPage();
    renderTasksInicio();
    renderModalTareas();
    updateMetrics();
});