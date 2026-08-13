// ==========================================================================
// MATERIAS: por defecto + agregadas (ver materias.js)
// getTodasLasMaterias() y getMateriaActual() vienen de materias.js
// ==========================================================================

// ==========================================================================
// EXÁMENES (AGREGAR Y MOSTRAR) VÍA localStorage
// ==========================================================================
const EXAM_STORAGE_KEY = 'focusClassExams';

function getExams() {
    return JSON.parse(localStorage.getItem(EXAM_STORAGE_KEY) || '[]');
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
// SELECTOR DE MATERIA (nuevo-examen.html)
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

function setupExamMateriaSelect() {
    const form = document.querySelector('.custom-form');
    if (!form) return;

    const params = new URLSearchParams(window.location.search);
    const preseleccion = params.get('materia');

    const field = document.createElement('div');
    field.className = 'form-group';

    const label = document.createElement('label');
    label.htmlFor = 'exam-materia';
    label.textContent = 'Materia';

    const select = crearSelectMateria('exam-materia', 'form-select', preseleccion);

    field.appendChild(label);
    field.appendChild(select);
    form.insertBefore(field, form.firstChild);
}

// ==========================================================================
// GUARDAR EXAMEN (nuevo-examen.html)
// ==========================================================================
function handleExamForm() {
    const examForm = document.querySelector('.custom-form');
    if (!examForm) return;

    examForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('exam-name');
        const descInput = document.getElementById('exam-desc');
        const dateInput = document.getElementById('exam-date');
        const prioritySelect = document.getElementById('exam-priority');
        const materiaSelect = document.getElementById('exam-materia');

        const name = nameInput ? nameInput.value.trim() : '';
        const desc = descInput ? descInput.value.trim() : '';
        const examDate = dateInput ? dateInput.value : '';
        const priority = prioritySelect ? prioritySelect.value : 'media';
        const materia = materiaSelect ? materiaSelect.value : '';

        if (!name || !materia) return;
        if (!examDate) {
            alert('La fecha del examen es obligatoria.');
            if (dateInput) dateInput.focus();
            return;
        }

        const exams = getExams();
        exams.push({ name, desc, examDate, priority, materia });
        localStorage.setItem(EXAM_STORAGE_KEY, JSON.stringify(exams));

        if (examForm.reset) examForm.reset();
        alert('Examen guardado correctamente.');
        window.location.href = 'menu.html';
    });
}

// ==========================================================================
// TARJETA DE EXAMEN PARA PÁGINAS DE MATERIA
// ==========================================================================
function crearCardExamen(exam) {
    const card = document.createElement('div');
    card.className = 'card';

    const left = document.createElement('div');
    left.className = 'card-left';

    const icon = document.createElement('span');
    icon.className = 'card-icon-brain';
    icon.textContent = '🧠';

    const info = document.createElement('div');
    info.className = 'card-info';

    const h3 = document.createElement('h3');
    h3.textContent = exam.name || 'Examen';

    const p = document.createElement('p');
    p.textContent = exam.desc || 'Sin descripción';

    info.appendChild(h3);
    info.appendChild(p);

    left.appendChild(icon);
    left.appendChild(info);

    const right = document.createElement('div');
    right.className = 'card-right';

    const dateBox = document.createElement('div');
    dateBox.className = 'card-date';

    const span = document.createElement('span');
    span.textContent = '📅 ' + formatDate(exam.examDate);

    const small = document.createElement('small');
    small.textContent = 'Fecha de realización';

    dateBox.appendChild(span);
    dateBox.appendChild(small);

    const arrow = document.createElement('span');
    arrow.className = 'card-arrow';
    arrow.textContent = '>';

    right.appendChild(dateBox);
    right.appendChild(arrow);

    // Botón pequeño para eliminar el examen desde la página de la materia.
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'card-delete-btn';
    deleteBtn.title = 'Eliminar examen';
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
    right.appendChild(deleteBtn);

    deleteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        borrarExamenDeTarjeta(card);
    });

    card.appendChild(left);
    card.appendChild(right);
    return card;
}

// Borra un examen desde su tarjeta en la página de la materia.
function borrarExamenDeTarjeta(card) {
    const panel = card.closest('.panel');
    if (!panel) return;
    const cardList = panel.querySelector('.card-list');
    if (!cardList) return;

    const cards = Array.from(cardList.querySelectorAll('.card'));
    const indice = cards.indexOf(card);
    if (indice < 0) return;

    const exams = getExams();
    const materia = getMateriaActual();
    const deEstaMateria = exams.filter((examen) => examen.materia === materia);
    const objetivo = deEstaMateria[indice];
    if (!objetivo) return;

    if (!confirm('¿Eliminar este examen?')) return;

    localStorage.setItem(EXAM_STORAGE_KEY, JSON.stringify(exams.filter((examen) => examen !== objetivo)));
    renderExamsMateriaPage();
    if (typeof renderExamMetric === 'function') renderExamMetric();
}

// ==========================================================================
// RENDERIZAR EXÁMENES DE LA MATERIA EN SU PÁGINA
// ==========================================================================
function renderExamsMateriaPage() {
    const materia = getMateriaActual();
    if (!materia) return;

    const panels = document.querySelectorAll('.panel');
    panels.forEach((panel) => {
        const heading = panel.querySelector('.panel-header h2');
        if (!heading || !heading.textContent.toLowerCase().includes('exámenes')) return;

        const cardList = panel.querySelector('.card-list');
        const badge = panel.querySelector('.badge');
        const addBtn = panel.querySelector('a.btn-add');
        if (!cardList) return;

        if (addBtn && addBtn.getAttribute('href')) {
            addBtn.href = 'nuevo-examen.html?materia=' + encodeURIComponent(materia);
        }

        cardList.querySelectorAll('.card, .empty-state').forEach((card) => card.remove());

        const examenes = getExams().filter((examen) => examen.materia === materia);

        // Si no hay exámenes se muestra de nuevo el mensaje de vacío.
        if (examenes.length === 0) {
            const empty = document.createElement('p');
            empty.className = 'empty-state';
            empty.textContent = 'Aún no hay exámenes para esta materia.';
            cardList.appendChild(empty);
        }

        examenes.forEach((examen) => cardList.appendChild(crearCardExamen(examen)));

        if (badge) {
            badge.textContent = examenes.length + (examenes.length === 1 ? ' próximo' : ' próximos');
        }
    });
}

// ==========================================================================
// MOSTRAR EXÁMENES EN LA VISTA DE INICIO (menu.html)
// ==========================================================================
function crearExamItem(exam) {
    const item = document.createElement('div');
    item.className = 'task-item';

    const status = document.createElement('span');
    status.className = 'status-indicator ' + getStatusClass(exam.priority);

    const info = document.createElement('div');
    info.className = 'task-info';

    const infoTitle = document.createElement('h4');
    infoTitle.textContent = exam.materia || 'General';

    const infoText = document.createElement('p');
    infoText.textContent = exam.name || 'Examen';

    info.appendChild(infoTitle);
    info.appendChild(infoText);

    const dateBox = document.createElement('div');
    dateBox.className = 'task-date';

    const dateLabel = document.createElement('span');
    dateLabel.textContent = 'Fecha del examen:';

    const dateValue = document.createElement('strong');
    dateValue.className = 'text-red';
    dateValue.textContent = formatDate(exam.examDate);

    dateBox.appendChild(dateLabel);
    dateBox.appendChild(dateValue);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.type = 'button';
    deleteBtn.title = 'Borrar examen';
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';

    item.appendChild(status);
    item.appendChild(info);
    item.appendChild(dateBox);
    item.appendChild(deleteBtn);

    return item;
}

function renderListaExamenes(list, exams) {
    if (!list) return;

    list.querySelectorAll('.task-item, .empty-state').forEach((el) => el.remove());

    if (exams.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'empty-state';
        empty.textContent = 'No hay próximos exámenes';
        list.appendChild(empty);
        return;
    }

    exams.forEach((exam) => list.appendChild(crearExamItem(exam)));
}

function renderExamList() {
    const sidebarSection = document.querySelector('.sidebar-section');
    if (!sidebarSection) return;

    const exams = getExams();

    const existingBox = sidebarSection.querySelector('.exam-box');
    if (existingBox) existingBox.remove();

    // La caja se muestra SIEMPRE, incluso si no hay exámenes todavía.
    // En ese caso la lista interna muestra el mensaje de "sin exámenes".
    const box = document.createElement('div');
    box.className = 'pending-box exam-box';
    box.style.width = '100%';
    box.style.boxSizing = 'border-box';
    box.style.marginTop = '1rem';

    const header = document.createElement('div');
    header.className = 'pending-header';

    const headerTitle = document.createElement('h2');
    headerTitle.innerHTML = '<i class="fa-regular fa-file-lines"></i> Próximo examen';

    const seeAll = document.createElement('a');
    seeAll.className = 'see-all';
    seeAll.href = '#';
    seeAll.id = 'linkVerTodosExamenes';
    seeAll.textContent = 'Ver todos';

    header.appendChild(headerTitle);
    header.appendChild(seeAll);

    const list = document.createElement('div');
    list.className = 'tasks-list';

    renderListaExamenes(list, exams);

    box.appendChild(header);
    box.appendChild(list);

    // El botón "Ver todos los exámenes" solo se muestra si ya hay exámenes.
    if (exams.length > 0) {
        const btn = document.createElement('button');
        btn.className = 'btn btn-primary btn-block';
        btn.type = 'button';
        btn.id = 'btnVerTodosExamenes';
        btn.textContent = 'Ver todos los exámenes';
        box.appendChild(btn);
    }

    sidebarSection.appendChild(box);

    // Mostrar máximo 2 exámenes de vista; el resto con scroll interno
    const firstItem = list.querySelector('.task-item');
    const gap = 10;
    const listHeight = firstItem ? firstItem.offsetHeight * 2 + gap : 170;
    list.style.maxHeight = listHeight + 'px';
    list.style.overflowY = 'auto';
    list.style.overflowX = 'hidden';
    list.style.paddingRight = '6px';
}

// ==========================================================================
// MOSTRAR EXÁMENES EN LA VENTANA MODAL (menu.html)
// ==========================================================================
function renderModalExamenes() {
    const list = document.querySelector('#modalExamenes .modal-body .tasks-list');
    if (!list) return;
    renderListaExamenes(list, getExams());
}

// ==========================================================================
// CONTADOR DE EXÁMENES (junto a las demás métricas de menu.html)
// ==========================================================================
function renderExamMetric() {
    const container = document.querySelector('.metrics-container');
    if (!container) return;

    const exams = getExams();

    let card = container.querySelector('.metric-card.metric-exam');
    if (!card) {
        card = document.createElement('div');
        card.className = 'metric-card metric-exam';

        const icon = document.createElement('i');
        icon.className = 'fa-regular fa-file-lines metric-icon';
        icon.style.color = '#f59e0b';

        const textGroup = document.createElement('div');

        const value = document.createElement('h3');
        value.className = 'metric-exam-value';

        const label = document.createElement('p');
        label.textContent = 'Exámenes';

        textGroup.appendChild(value);
        textGroup.appendChild(label);

        card.appendChild(icon);
        card.appendChild(textGroup);
        container.appendChild(card);
    }

    card.querySelector('.metric-exam-value').textContent = exams.length;
}

document.addEventListener('DOMContentLoaded', () => {
    setupExamMateriaSelect();
    handleExamForm();
    renderExamsMateriaPage();
    renderExamList();
    renderModalExamenes();
    renderExamMetric();
});