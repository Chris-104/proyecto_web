document.addEventListener('DOMContentLoaded', () => {
  // Referencias a las ventanas modales
  const modalTareas = document.getElementById('modalTareas');
  const modalExamenes = document.getElementById('modalExamenes');

  // Elementos para cerrar
  const closeTareasBtn = document.getElementById('closeTareasBtn');
  const closeExamenesBtn = document.getElementById('closeExamenesBtn');

  // Funciones para abrir y cerrar
  function openModal(modal) {
    if (!modal) return;

    // Se re-renderiza el contenido con los datos actuales de localStorage
    if (modal === modalTareas && typeof renderModalTareas === 'function') renderModalTareas();
    if (modal === modalExamenes && typeof renderModalExamenes === 'function') renderModalExamenes();

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // Los botones/enlaces "Ver todas las tareas" y "Ver todos los exámenes" se
  // manejan con delegación de eventos porque la caja de exámenes se recrea
  // cada vez que se renderiza la lista.
  document.addEventListener('click', (e) => {
    if (e.target.closest('#btnVerTodasTareas, #linkVerTodasTareas')) {
      e.preventDefault();
      openModal(modalTareas);
      return;
    }
    if (e.target.closest('#btnVerTodosExamenes, #linkVerTodosExamenes')) {
      e.preventDefault();
      openModal(modalExamenes);
    }
  });

  // Eventos para cerrar
  if (closeTareasBtn) {
    closeTareasBtn.addEventListener('click', () => closeModal(modalTareas));
  }
  if (closeExamenesBtn) {
    closeExamenesBtn.addEventListener('click', () => closeModal(modalExamenes));
  }

  // Cerrar al hacer clic en la zona oscura fuera de la tarjeta
  window.addEventListener('click', (e) => {
    if (e.target === modalTareas) closeModal(modalTareas);
    if (e.target === modalExamenes) closeModal(modalExamenes);
  });

  // --------------------------------------------------------------------------
  // ELIMINAR TAREA O EXAMEN CON EL ICONO DE BASURA
  // --------------------------------------------------------------------------
  // Al pulsar el basurero se borra el elemento del localStorage y se
  // re-renderizan tanto la caja de pendientes como la ventana modal.
  document.addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('.delete-btn');
    if (!deleteBtn) return;
    e.preventDefault();
    e.stopPropagation();

    const taskItem = deleteBtn.closest('.task-item');
    if (!taskItem) return;

    // Si el item está dentro de la caja o modal de exámenes, es un examen.
    const esExamen = !!taskItem.closest('.exam-box, #modalExamenes');

    taskItem.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    taskItem.style.opacity = '0';
    taskItem.style.transform = 'scale(0.95)';

    setTimeout(() => {
      if (esExamen) {
        borrarExamenDesdeItem(taskItem);
      } else {
        borrarTareaDesdeItem(taskItem);
      }
    }, 200);
  });
});

// --------------------------------------------------------------------------
// FUNCIONES AUXILIARES PARA BORRAR DESDE localStorage
// --------------------------------------------------------------------------
function borrarTareaDesdeItem(taskItem) {
  const tasks = getTasks();
  const lista = taskItem.parentElement;
  const items = Array.from(lista.querySelectorAll('.task-item'));
  const indice = items.indexOf(taskItem);
  if (indice < 0) return;

  tasks.splice(indice, 1);
  localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));

  if (typeof renderTasksInicio === 'function') renderTasksInicio();
  if (typeof renderModalTareas === 'function') renderModalTareas();
  if (typeof updateMetrics === 'function') updateMetrics();
}

function borrarExamenDesdeItem(examItem) {
  const exams = getExams();
  const lista = examItem.parentElement;
  const items = Array.from(lista.querySelectorAll('.task-item'));
  const indice = items.indexOf(examItem);
  if (indice < 0) return;

  exams.splice(indice, 1);
  localStorage.setItem(EXAM_STORAGE_KEY, JSON.stringify(exams));

  if (typeof renderExamList === 'function') renderExamList();
  if (typeof renderModalExamenes === 'function') renderModalExamenes();
  if (typeof renderExamMetric === 'function') renderExamMetric();
}
