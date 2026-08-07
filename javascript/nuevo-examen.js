const EXAM_STORAGE_KEY = 'focusClassExams';

function getExams() {
    return JSON.parse(localStorage.getItem(EXAM_STORAGE_KEY) || '[]');
}

function saveExam(exam) {
    const exams = getExams();
    exams.push(exam);
    localStorage.setItem(EXAM_STORAGE_KEY, JSON.stringify(exams));
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

        const name = nameInput ? nameInput.value.trim() : '';
        const desc = descInput ? descInput.value.trim() : '';
        const examDate = dateInput ? dateInput.value : '';
        const priority = prioritySelect ? prioritySelect.value : 'media';

        if (!name) return;

        saveExam({ name, desc, examDate, priority });

        if (examForm.reset) examForm.reset();
        alert('Examen guardado correctamente.');
        window.location.href = 'menu.html';
    });
}

// ==========================================================================
// MOSTRAR EXÁMENES EN LA VISTA DE INICIO (menu.html)
// ==========================================================================
function renderExamList() {
    const sidebarSection = document.querySelector('.sidebar-section');
    if (!sidebarSection) return;

    const exams = getExams();
    if (exams.length === 0) return;

    const existingBox = sidebarSection.querySelector('.exam-box');
    if (existingBox) existingBox.remove();

    const box = document.createElement('div');
    box.className = 'pending-box exam-box';
    box.style.width = '100%';
    box.style.boxSizing = 'border-box';
    box.style.marginTop = '1rem';

    const header = document.createElement('div');
    header.className = 'pending-header';

    const headerTitle = document.createElement('h2');
    headerTitle.innerHTML = '<i class="fa-regular fa-file-lines"></i> Próximos exámenes';

    const seeAll = document.createElement('a');
    seeAll.className = 'see-all';
    seeAll.href = '#';
    seeAll.textContent = 'Ver todos';

    header.appendChild(headerTitle);
    header.appendChild(seeAll);

    const list = document.createElement('div');
    list.className = 'tasks-list';

    exams.forEach((exam) => {
        const item = document.createElement('div');
        item.className = 'task-item';

        const status = document.createElement('span');
        status.className = 'status-indicator ' + getStatusClass(exam.priority);

        const info = document.createElement('div');
        info.className = 'task-info';

        const infoTitle = document.createElement('h4');
        infoTitle.textContent = exam.name || 'Examen';

        const infoText = document.createElement('p');
        infoText.textContent = exam.desc || 'Sin descripción';

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

        item.appendChild(status);
        item.appendChild(info);
        item.appendChild(dateBox);

        list.appendChild(item);
    });

    box.appendChild(header);
    box.appendChild(list);

    const btn = document.createElement('button');
    btn.className = 'btn btn-primary btn-block';
    btn.type = 'button';
    btn.textContent = 'Ver todos los exámenes';
    box.appendChild(btn);

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
    handleExamForm();
    renderExamList();
    renderExamMetric();
});